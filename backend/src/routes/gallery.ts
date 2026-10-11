/**
 * Gallery management for /admin.
 *
 * The gallery lives in the repo (frontend/data/gallery.json plus the photo
 * files), not in the database: that keeps photos free to host, versioned, and
 * served by the frontend exactly as before. Each action here is one commit;
 * Railway sees it and redeploys the frontend, so changes go live in a few
 * minutes.
 */
import { randomBytes } from "node:crypto";
import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { commitFromFiles, readFileAtHead, type Change } from "../github.js";
import {
  GALLERY,
  PHOTO_DIR,
  PUBLIC_PREFIX,
  SERVICES,
  parse,
  serialize,
  type Category,
  type GalleryItem,
} from "../manifests.js";
import { adminGitRouter } from "./shared.js";

/** Matches the existing photos: phone shots at 900×1600. */
const MAX_EDGE = 1600;

const slug = z.string().regex(/^[a-z0-9-]+$/);
const altText = z.string().trim().max(300);

function aspectOf(width: number, height: number): GalleryItem["aspect"] {
  const ratio = width / height;
  if (ratio < 0.9) return "tall";
  if (ratio > 1.15) return "wide";
  return "square";
}

const shortId = () => randomBytes(4).toString("hex");

/** Newest first within the category; a category with no photos yet goes last. */
function insertAtTopOfCategory(items: GalleryItem[], added: GalleryItem[]) {
  const at = items.findIndex((it) => it.category === added[0]!.category);
  items.splice(at === -1 ? items.length : at, 0, ...added);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

export const galleryRouter = adminGitRouter();

galleryRouter.get("/", async (_req, res) => {
  res.json({ items: parse<GalleryItem>(await readFileAtHead(GALLERY)) });
});

galleryRouter.post("/", upload.array("photos", 10), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const fields = z.object({ category: slug, alt: altText.optional() }).safeParse(req.body);
  if (!fields.success || files.length === 0) {
    res.status(400).json({ error: "invalid_upload" });
    return;
  }
  const { category } = fields.data;

  // Resize before touching GitHub, so a bad file fails the whole request
  // without a half-made commit. `rotate()` applies the phone's EXIF
  // orientation; metadata (including GPS) is dropped by default.
  let photos: { name: string; buffer: Buffer; aspect: GalleryItem["aspect"] }[];
  try {
    photos = await Promise.all(
      files.map(async (file) => {
        const { data, info } = await sharp(file.buffer)
          .rotate()
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer({ resolveWithObject: true });
        return {
          name: `${category}-${Date.now().toString(36)}-${shortId()}.jpg`,
          buffer: data,
          aspect: aspectOf(info.width, info.height),
        };
      }),
    );
  } catch {
    res.status(400).json({ error: "unreadable_image" });
    return;
  }

  const added = await commitFromFiles([GALLERY, SERVICES], ([galleryRaw, servicesRaw]) => {
    const target = parse<Category>(servicesRaw!).find((c) => c.slug === category);
    if (!target) return { changes: [], message: "", result: null };

    const items = parse<GalleryItem>(galleryRaw!);
    const alt = fields.data.alt || `עיצוב ומיתוג ל${target.label} — עבודה של מיתוגל`;
    const newItems: GalleryItem[] = photos.map((p) => ({
      id: `${category}-${shortId()}`,
      category,
      src: PUBLIC_PREFIX + p.name,
      aspect: p.aspect,
      alt,
    }));
    insertAtTopOfCategory(items, newItems);

    const changes: Change[] = [
      ...photos.map((p) => ({ path: `${PHOTO_DIR}/${p.name}`, content: p.buffer })),
      { path: GALLERY, content: serialize(items) },
    ];
    return {
      changes,
      message: `גלריה: ${photos.length === 1 ? "נוספה תמונה" : `נוספו ${photos.length} תמונות`} (${target.label})`,
      result: newItems,
    };
  });

  if (!added) {
    res.status(400).json({ error: "unknown_category" });
    return;
  }
  res.status(201).json({ items: added });
});

galleryRouter.patch("/:id", async (req, res) => {
  const parsed = z
    .object({ alt: altText.min(1).optional(), category: slug.optional() })
    .refine((v) => v.alt !== undefined || v.category !== undefined)
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  type Outcome = { item: GalleryItem } | { error: string };
  const outcome = await commitFromFiles<Outcome>([GALLERY, SERVICES], ([galleryRaw, servicesRaw]) => {
    const fail = (error: string) => ({ changes: [], message: "", result: { error } });
    const items = parse<GalleryItem>(galleryRaw!);
    const index = items.findIndex((it) => it.id === req.params.id);
    if (index === -1) return fail("not_found");
    if (parsed.data.category && !parse<Category>(servicesRaw!).some((c) => c.slug === parsed.data.category)) {
      return fail("unknown_category");
    }

    const before = items[index]!;
    const item: GalleryItem = { ...before, ...parsed.data };
    if (item.category === before.category) {
      items[index] = item;
    } else {
      // Moving category: top of its new group, like a fresh upload.
      items.splice(index, 1);
      insertAtTopOfCategory(items, [item]);
    }
    return {
      changes: [{ path: GALLERY, content: serialize(items) }],
      message: `גלריה: עודכנה תמונה (${item.id})`,
      result: { item },
    };
  });

  if ("error" in outcome) {
    res.status(outcome.error === "not_found" ? 404 : 400).json(outcome);
    return;
  }
  res.json(outcome);
});

galleryRouter.delete("/:id", async (req, res) => {
  const removed = await commitFromFiles([GALLERY], ([raw]) => {
    const items = parse<GalleryItem>(raw!);
    const index = items.findIndex((it) => it.id === req.params.id);
    if (index === -1) return { changes: [], message: "", result: false };

    const [item] = items.splice(index, 1);
    const changes: Change[] = [{ path: GALLERY, content: serialize(items) }];
    // Delete the file too, or check-images fails the next frontend build.
    if (item!.src?.startsWith(PUBLIC_PREFIX)) {
      changes.push({ path: `${PHOTO_DIR}/${item!.src.slice(PUBLIC_PREFIX.length)}`, delete: true });
    }
    return { changes, message: `גלריה: נמחקה תמונה (${item!.id})`, result: true };
  });

  if (!removed) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ ok: true });
});

galleryRouter.put("/order", async (req, res) => {
  const parsed = z.object({ ids: z.array(z.string()).min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const { ids } = parsed.data;

  const ok = await commitFromFiles([GALLERY], ([raw]) => {
    const items = parse<GalleryItem>(raw!);
    const byId = new Map(items.map((it) => [it.id, it]));
    // Must be exactly the current set: otherwise the admin was looking at a
    // stale list, and saving it would silently drop or resurrect photos.
    const sameSet =
      ids.length === items.length && new Set(ids).size === ids.length && ids.every((id) => byId.has(id));
    if (!sameSet) return { changes: [], message: "", result: false };
    return {
      changes: [{ path: GALLERY, content: serialize(ids.map((id) => byId.get(id)!)) }],
      message: "גלריה: שונה סדר התמונות",
      result: true,
    };
  });

  if (!ok) {
    res.status(409).json({ error: "stale_order" });
    return;
  }
  res.json({ ok: true });
});

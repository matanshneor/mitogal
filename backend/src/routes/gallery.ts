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
import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import sharp from "sharp";
import { z } from "zod";
import { requireAdmin } from "../auth.js";
import { env } from "../env.js";
import { GitHubNotConfiguredError, commitFromFile, readFileAtHead, type Change } from "../github.js";

const MANIFEST = "frontend/data/gallery.json";
const PHOTO_DIR = "frontend/public/images/portfolio";
const PUBLIC_PREFIX = "/images/portfolio/";

/** Mirrors the slugs in frontend/data/services.ts. Add here when adding a category there. */
const CATEGORIES = ["weddings", "gifts", "proposals", "birthdays", "holidays", "concept"] as const;

const CATEGORY_LABELS: Record<(typeof CATEGORIES)[number], string> = {
  weddings: "חתונות",
  gifts: "מתנות ממותגות",
  proposals: "הצעות נישואין",
  birthdays: "ימי הולדת",
  holidays: "חגים",
  concept: "אירועי קונספט",
};

/** Matches the existing photos: phone shots at 900×1600. */
const MAX_EDGE = 1600;

type Item = {
  id: string;
  category: string;
  src?: string;
  aspect: "tall" | "square" | "wide";
  alt: string;
};

const category = z.enum(CATEGORIES);
const altText = z.string().trim().max(300);

function parseManifest(raw: string): Item[] {
  return JSON.parse(raw) as Item[];
}

function serialize(items: Item[]): Buffer {
  return Buffer.from(JSON.stringify(items, null, 2) + "\n");
}

function aspectOf(width: number, height: number): Item["aspect"] {
  const ratio = width / height;
  if (ratio < 0.9) return "tall";
  if (ratio > 1.15) return "wide";
  return "square";
}

function defaultAlt(slug: (typeof CATEGORIES)[number]): string {
  return `עיצוב ומיתוג ל${CATEGORY_LABELS[slug]} — עבודה של מיתוגל`;
}

function shortId(): string {
  return randomBytes(4).toString("hex");
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, file.mimetype.startsWith("image/")),
});

export const galleryRouter = Router();

galleryRouter.use(requireAdmin);

galleryRouter.use((_req, res, next) => {
  if (!env.GITHUB_TOKEN) {
    res.status(503).json({ error: "gallery_not_configured" });
    return;
  }
  next();
});

galleryRouter.get("/", async (_req, res) => {
  res.json({ items: parseManifest(await readFileAtHead(MANIFEST)) });
});

galleryRouter.post("/", upload.array("photos", 10), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  const fields = z
    .object({ category, alt: altText.optional() })
    .safeParse(req.body);
  if (!fields.success || files.length === 0) {
    res.status(400).json({ error: "invalid_upload" });
    return;
  }
  const { category: slug } = fields.data;
  const alt = fields.data.alt || defaultAlt(slug);

  // Resize before touching GitHub, so a bad file fails the whole request
  // without a half-made commit. `rotate()` applies the phone's EXIF
  // orientation; metadata (including GPS) is dropped by default.
  let photos: { name: string; buffer: Buffer; aspect: Item["aspect"] }[];
  try {
    photos = await Promise.all(
      files.map(async (file) => {
        const { data, info } = await sharp(file.buffer)
          .rotate()
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 82, mozjpeg: true })
          .toBuffer({ resolveWithObject: true });
        return {
          name: `${slug}-${Date.now().toString(36)}-${shortId()}.jpg`,
          buffer: data,
          aspect: aspectOf(info.width, info.height),
        };
      }),
    );
  } catch {
    res.status(400).json({ error: "unreadable_image" });
    return;
  }

  const added = await commitFromFile(MANIFEST, (raw) => {
    const items = parseManifest(raw);
    const newItems: Item[] = photos.map((p) => ({
      id: `${slug}-${shortId()}`,
      category: slug,
      src: PUBLIC_PREFIX + p.name,
      aspect: p.aspect,
      alt,
    }));

    // Newest first within the category; a category with no photos yet goes last.
    const at = items.findIndex((it) => it.category === slug);
    items.splice(at === -1 ? items.length : at, 0, ...newItems);

    const changes: Change[] = [
      ...photos.map((p) => ({ path: `${PHOTO_DIR}/${p.name}`, content: p.buffer })),
      { path: MANIFEST, content: serialize(items) },
    ];
    return {
      changes,
      message: `גלריה: ${photos.length === 1 ? "נוספה תמונה" : `נוספו ${photos.length} תמונות`} (${CATEGORY_LABELS[slug]})`,
      result: newItems,
    };
  });

  res.status(201).json({ items: added });
});

galleryRouter.patch("/:id", async (req, res) => {
  const parsed = z
    .object({ alt: altText.min(1).optional(), category: category.optional() })
    .refine((v) => v.alt !== undefined || v.category !== undefined)
    .safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }

  const updated = await commitFromFile(MANIFEST, (raw) => {
    const items = parseManifest(raw);
    const index = items.findIndex((it) => it.id === req.params.id);
    if (index === -1) return { changes: [], message: "", result: null };

    const before = items[index]!;
    const item: Item = { ...before, ...parsed.data };
    if (item.category === before.category) {
      items[index] = item;
    } else {
      // Moving category: top of its new group, like a fresh upload.
      items.splice(index, 1);
      const at = items.findIndex((it) => it.category === item.category);
      items.splice(at === -1 ? items.length : at, 0, item);
    }
    return {
      changes: [{ path: MANIFEST, content: serialize(items) }],
      message: `גלריה: עודכנה תמונה (${item.id})`,
      result: item,
    };
  });

  if (!updated) {
    res.status(404).json({ error: "not_found" });
    return;
  }
  res.json({ item: updated });
});

galleryRouter.delete("/:id", async (req, res) => {
  const removed = await commitFromFile(MANIFEST, (raw) => {
    const items = parseManifest(raw);
    const index = items.findIndex((it) => it.id === req.params.id);
    if (index === -1) return { changes: [], message: "", result: false };

    const [item] = items.splice(index, 1);
    const changes: Change[] = [{ path: MANIFEST, content: serialize(items) }];
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

  const ok = await commitFromFile(MANIFEST, (raw) => {
    const items = parseManifest(raw);
    const byId = new Map(items.map((it) => [it.id, it]));
    // Must be exactly the current set: otherwise the admin was looking at a
    // stale list, and saving it would silently drop or resurrect photos.
    const sameSet =
      ids.length === items.length && new Set(ids).size === ids.length && ids.every((id) => byId.has(id));
    if (!sameSet) return { changes: [], message: "", result: false };
    return {
      changes: [{ path: MANIFEST, content: serialize(ids.map((id) => byId.get(id)!)) }],
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

galleryRouter.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof GitHubNotConfiguredError) {
    res.status(503).json({ error: "gallery_not_configured" });
    return;
  }
  if (err instanceof multer.MulterError) {
    res.status(413).json({ error: err.code === "LIMIT_FILE_SIZE" ? "file_too_large" : "too_many_files" });
    return;
  }
  next(err);
});

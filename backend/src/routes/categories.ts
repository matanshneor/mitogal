/**
 * Category ("כרטיסיות") management for /admin.
 *
 * Categories live in frontend/data/services.json and drive the services
 * grid, the gallery filters, the contact-form options and one page each at
 * /gallery/<slug>. Same model as the gallery: every action is one commit,
 * and Railway redeploys the frontend from it.
 */
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { commitFromFiles, readFileAtHead } from "../github.js";
import {
  COLOR_KEYS,
  GALLERY,
  ICON_NAMES,
  SERVICES,
  parse,
  serialize,
  type Category,
  type GalleryItem,
} from "../manifests.js";
import { adminGitRouter } from "./shared.js";

const text = (max: number) => z.string().trim().min(1).max(max);

const fields = z.object({
  label: text(40),
  labelSingular: text(40),
  tagline: text(80),
  pageTitle: text(80),
  pageIntro: text(600),
  icon: z.enum(ICON_NAMES),
  color: z.enum(COLOR_KEYS),
});

/** URL segment. Lowercase latin, digits and single hyphens; "all" is the gallery's "everything" filter. */
const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(40)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  .refine((s) => s !== "all");

type Fail = { error: string; status: number };
type Outcome<T> = T | Fail;
const fail = (error: string, status = 409) => ({
  changes: [],
  message: "",
  result: { error, status } as Fail,
});

function sameLabel(a: string, b: string) {
  return a.trim() === b.trim();
}

export const categoriesRouter = adminGitRouter();

categoriesRouter.get("/", async (_req, res) => {
  res.json({ categories: parse<Category>(await readFileAtHead(SERVICES)) });
});

categoriesRouter.post("/", async (req, res) => {
  const parsed = fields.extend({ slug: slugSchema.optional().or(z.literal("")) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_category" });
    return;
  }
  const { slug: wanted, ...data } = parsed.data;

  const outcome = await commitFromFiles<Outcome<{ category: Category }>>([SERVICES], ([raw]) => {
    const categories = parse<Category>(raw!);
    const slug = wanted || `event-${randomBytes(3).toString("hex")}`;
    if (categories.some((c) => c.slug === slug)) return fail("duplicate_slug");
    // Labels double as the contact form's option values, so two equal ones
    // would make leads ambiguous.
    if (categories.some((c) => sameLabel(c.label, data.label))) return fail("duplicate_label");

    const category: Category = { slug, ...data };
    categories.push(category);
    return {
      changes: [{ path: SERVICES, content: serialize(categories) }],
      message: `כרטיסיות: נוספה "${category.label}"`,
      result: { category },
    };
  });

  if ("error" in outcome) {
    res.status(outcome.status).json({ error: outcome.error });
    return;
  }
  res.status(201).json(outcome);
});

categoriesRouter.patch("/:slug", async (req, res) => {
  const parsed = fields.partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    res.status(400).json({ error: "invalid_category" });
    return;
  }

  const outcome = await commitFromFiles<Outcome<{ category: Category }>>([SERVICES], ([raw]) => {
    const categories = parse<Category>(raw!);
    const index = categories.findIndex((c) => c.slug === req.params.slug);
    if (index === -1) return fail("not_found", 404);
    const label = parsed.data.label;
    if (label && categories.some((c, i) => i !== index && sameLabel(c.label, label))) {
      return fail("duplicate_label");
    }

    const category: Category = { ...categories[index]!, ...parsed.data };
    categories[index] = category;
    return {
      changes: [{ path: SERVICES, content: serialize(categories) }],
      message: `כרטיסיות: עודכנה "${category.label}"`,
      result: { category },
    };
  });

  if ("error" in outcome) {
    res.status(outcome.status).json({ error: outcome.error });
    return;
  }
  res.json(outcome);
});

categoriesRouter.delete("/:slug", async (req, res) => {
  const outcome = await commitFromFiles<Outcome<{ ok: true }>>([SERVICES, GALLERY], ([servicesRaw, galleryRaw]) => {
    const categories = parse<Category>(servicesRaw!);
    const index = categories.findIndex((c) => c.slug === req.params.slug);
    if (index === -1) return fail("not_found", 404);
    if (categories.length === 1) return fail("last_category");
    // Never strand photos: a gallery item whose category is gone would vanish
    // from every filter and page while still being listed.
    if (parse<GalleryItem>(galleryRaw!).some((it) => it.category === req.params.slug)) {
      return fail("has_photos");
    }

    const [removed] = categories.splice(index, 1);
    return {
      changes: [{ path: SERVICES, content: serialize(categories) }],
      message: `כרטיסיות: נמחקה "${removed!.label}"`,
      result: { ok: true as const },
    };
  });

  if ("error" in outcome) {
    res.status(outcome.status).json({ error: outcome.error });
    return;
  }
  res.json(outcome);
});

categoriesRouter.put("/order", async (req, res) => {
  const parsed = z.object({ slugs: z.array(z.string()).min(1) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_request" });
    return;
  }
  const { slugs } = parsed.data;

  const ok = await commitFromFiles([SERVICES], ([raw]) => {
    const categories = parse<Category>(raw!);
    const bySlug = new Map(categories.map((c) => [c.slug, c]));
    const sameSet =
      slugs.length === categories.length &&
      new Set(slugs).size === slugs.length &&
      slugs.every((s) => bySlug.has(s));
    if (!sameSet) return { changes: [], message: "", result: false };
    return {
      changes: [{ path: SERVICES, content: serialize(slugs.map((s) => bySlug.get(s)!)) }],
      message: "כרטיסיות: שונה הסדר",
      result: true,
    };
  });

  if (!ok) {
    res.status(409).json({ error: "stale_order" });
    return;
  }
  res.json({ ok: true });
});

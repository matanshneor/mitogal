/**
 * The portfolio gallery manifest.
 *
 * The photos themselves are listed in gallery.json, which Gal edits from the
 * "גלריה" tab on /admin: the backend commits the photo and the updated JSON
 * to GitHub, and Railway redeploys the site. Editing the JSON by hand works
 * just as well.
 *
 * Order in the JSON is display order. Items are grouped by category, newest
 * upload first within its group.
 *
 * ── NOTES THAT USED TO LIVE NEXT TO THE ENTRIES ──────────────────────────
 * - prp-3 is `square`, not `tall`: the file is cropped to 737×835, so a 3/4
 *   tile would clip the heart box at the sides.
 * - The alt text on con-6, con-7 and con-8 describes them at group level;
 *   sharpen it when someone who knows those jobs can look at them.
 * ──────────────────────────────────────────────────────────────────────────
 */
import items from "./gallery.json";

export type GalleryItem = {
  id: string;
  /** Must match a `slug` in data/services.ts. */
  category: string;
  /** Descriptive alt text. Required — never leave this empty. */
  alt: string;
  /** Optional. Absent => placeholder tile. */
  src?: string;
  /** Drives the masonry rhythm. Most of Gal's photos are phone-shot portrait. */
  aspect: "tall" | "square" | "wide";
};

export const gallery = items as GalleryItem[];

/**
 * The photos that cycle in the hero arch — two per category.
 *
 * Deliberately interleaved rather than grouped: the first screen has to show
 * the full range fast, so an elegant wedding menu is followed by a kids'
 * branded snack bag, not by a second wedding.
 *
 * Slides are fetched as the loop reaches them, not all at once, so the length
 * of this list costs nothing upfront. The FIRST entry loads with `priority`
 * and is the page's LCP image — keep a strong photo there.
 *
 * A photo deleted from /admin simply drops out of this list.
 */
export const heroSlides: GalleryItem[] = [
  // ── first pass, one per category ────────────────────────────────────────
  "con-3", // forest-fairy concept table — the only frame showing a whole event
  "bd-1", // Winnie-the-Pooh snack bags, first birthday
  "prp-1", // black-and-white engagement tablescape
  "hol-3", // Shavuot gift basket
  "gft-8", // branded tzedakah tins
  "wed-2", // wedding tablescape, professionally shot
  // ── second pass, same order ─────────────────────────────────────────────
  "con-1", // women's day chocolate wrappers
  "bd-5", // ice-cream-truck chocolate wrappers
  "prp-2", // engagement plate close-up
  "hol-4", // Passover chocolate sets
  "gft-9", // branded tumbler with a printed card
  "wed-3", // mirror plate flat-lay with rings
]
  .map((id) => gallery.find((item) => item.id === id))
  .filter((item): item is GalleryItem => item !== undefined);

/*
 * Deliberately excluded from the hero, though they are fine in the gallery:
 *   gft-1  (gift2)         — a hand holds the plaque
 *   gft-10 (events10)      — a hand holds the plaque
 *   wed-4  (wedding-gift1) — a hand holds the bottle
 *   wed-1  (wedding1)      — landscape; the 4:5 arch would crop it badly
 * The hero is the first thing anyone sees, so it takes only clean product
 * shots: no hands, no clutter, nothing soft.
 */

/** Returns every item, or only the ones in a given category. */
export function galleryFor(categorySlug?: string): GalleryItem[] {
  if (!categorySlug || categorySlug === "all") return gallery;
  return gallery.filter((item) => item.category === categorySlug);
}

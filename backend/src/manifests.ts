/**
 * The two JSON files in the repo that /admin edits, and their shapes.
 * Mirrors frontend/data/gallery.ts and frontend/data/services.ts.
 */

export const GALLERY = "frontend/data/gallery.json";
export const SERVICES = "frontend/data/services.json";
export const PHOTO_DIR = "frontend/public/images/portfolio";
export const PUBLIC_PREFIX = "/images/portfolio/";

export type GalleryItem = {
  id: string;
  category: string;
  src?: string;
  aspect: "tall" | "square" | "wide";
  alt: string;
};

export type Category = {
  slug: string;
  label: string;
  labelSingular: string;
  tagline: string;
  icon: string;
  color: string;
  pageTitle: string;
  pageIntro: string;
};

/** Must match ICONS in frontend/data/services.ts. */
export const ICON_NAMES = [
  "Gem", "Gift", "Heart", "Cake", "Sparkles", "Palette", "Baby", "Star",
  "Crown", "Flower2", "PartyPopper", "GraduationCap", "Balloon", "BookOpen", "Candy", "Camera",
] as const;

/** Must match PALETTE in frontend/data/services.ts. */
export const COLOR_KEYS = [
  "rose", "coral", "raspberry", "gold", "green", "lavender", "sky", "plum", "sage",
] as const;

export function parse<T>(raw: string): T[] {
  return JSON.parse(raw) as T[];
}

export function serialize(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(value, null, 2) + "\n");
}

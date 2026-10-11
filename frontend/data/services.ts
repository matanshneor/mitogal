import {
  Baby,
  Balloon,
  BookOpen,
  Cake,
  Camera,
  Candy,
  Crown,
  Flower2,
  Gem,
  Gift,
  GraduationCap,
  Heart,
  Palette,
  PartyPopper,
  Sparkles,
  Star,
  type LucideIcon,
} from "lucide-react";
import entries from "./services.json";

/**
 * The event categories Mitogal designs for.
 *
 * The content lives in services.json, which Gal edits from the "כרטיסיות"
 * tab on /admin (the backend commits it and Railway redeploys). This file
 * turns those plain entries into what the components need: an icon
 * component, Tailwind classes and a hex colour.
 *
 * This list drives FOUR things at once:
 *   1. the services grid on the landing page
 *   2. the gallery filter chips
 *   3. the "סוג האירוע" select in the contact form
 *   4. the statically generated /gallery/[category] pages + sitemap
 *
 * Adding a category is a single entry in the JSON — the page, the filter,
 * the form option and the sitemap entry all appear on their own.
 */

/**
 * Icons Gal can choose from. The backend keeps the same list of names
 * (backend/src/routes/categories.ts) — add to both.
 */
export const ICONS: Record<string, LucideIcon> = {
  Gem,
  Gift,
  Heart,
  Cake,
  Sparkles,
  Palette,
  Baby,
  Star,
  Crown,
  Flower2,
  PartyPopper,
  GraduationCap,
  Balloon,
  BookOpen,
  Candy,
  Camera,
};

/**
 * Every Tailwind class that depends on a category colour, written out in full.
 *
 * Tailwind v4 scans source files as plain text: a template literal like
 * `bg-${color}` produces no CSS, because the full class name never appears
 * anywhere for the scanner to find. Listing them here is the supported way
 * to keep the colours data-driven.
 */
export type CategoryClasses = {
  /** Vivid fill. Always pair with ink text — white fails contrast on these. */
  bg: string;
  /** Very light background for full-width bands. */
  bgTint: string;
  /** Darkened variant, safe for small text on paper. */
  text: string;
  border: string;
  /** Vivid fill used as a ring/outline. */
  ring: string;
};

type Swatch = {
  /** Shown to Gal in the colour picker. */
  name: string;
  /** For the OG image generator, which can't use Tailwind. */
  hex: string;
  classes: CategoryClasses;
};

/**
 * The colours a category can take. Every one passes the same contrast
 * checks as the originals (see the tokens in app/globals.css), which is why
 * Gal picks from this list rather than any colour. The backend keeps the
 * same keys — add to both.
 *
 * The first six keep the token names of the categories they were made for.
 */
export const PALETTE: Record<string, Swatch> = {
  rose: {
    name: "ורוד",
    hex: "#E58BA0",
    classes: {
      bg: "bg-cat-weddings",
      bgTint: "bg-cat-weddings-tint",
      text: "text-cat-weddings-deep",
      border: "border-cat-weddings",
      ring: "ring-cat-weddings",
    },
  },
  coral: {
    name: "כתום",
    hex: "#F5906B",
    classes: {
      bg: "bg-cat-gifts",
      bgTint: "bg-cat-gifts-tint",
      text: "text-cat-gifts-deep",
      border: "border-cat-gifts",
      ring: "ring-cat-gifts",
    },
  },
  raspberry: {
    name: "פטל",
    hex: "#E05C87",
    classes: {
      bg: "bg-cat-proposals",
      bgTint: "bg-cat-proposals-tint",
      text: "text-cat-proposals-deep",
      border: "border-cat-proposals",
      ring: "ring-cat-proposals",
    },
  },
  gold: {
    name: "צהוב",
    hex: "#F5B942",
    classes: {
      bg: "bg-cat-birthdays",
      bgTint: "bg-cat-birthdays-tint",
      text: "text-cat-birthdays-deep",
      border: "border-cat-birthdays",
      ring: "ring-cat-birthdays",
    },
  },
  green: {
    name: "ירוק",
    hex: "#3FB3A5",
    classes: {
      bg: "bg-cat-holidays",
      bgTint: "bg-cat-holidays-tint",
      text: "text-cat-holidays-deep",
      border: "border-cat-holidays",
      ring: "ring-cat-holidays",
    },
  },
  lavender: {
    name: "לבנדר",
    hex: "#8E9BE0",
    classes: {
      bg: "bg-cat-concept",
      bgTint: "bg-cat-concept-tint",
      text: "text-cat-concept-deep",
      border: "border-cat-concept",
      ring: "ring-cat-concept",
    },
  },
  sky: {
    name: "תכלת",
    hex: "#78B6E2",
    classes: {
      bg: "bg-cat-sky",
      bgTint: "bg-cat-sky-tint",
      text: "text-cat-sky-deep",
      border: "border-cat-sky",
      ring: "ring-cat-sky",
    },
  },
  plum: {
    name: "סגול",
    hex: "#C794D1",
    classes: {
      bg: "bg-cat-plum",
      bgTint: "bg-cat-plum-tint",
      text: "text-cat-plum-deep",
      border: "border-cat-plum",
      ring: "ring-cat-plum",
    },
  },
  sage: {
    name: "זית",
    hex: "#A3BB81",
    classes: {
      bg: "bg-cat-sage",
      bgTint: "bg-cat-sage-tint",
      text: "text-cat-sage-deep",
      border: "border-cat-sage",
      ring: "ring-cat-sage",
    },
  },
};

/** What services.json holds — plain strings only, so the backend can edit it. */
export type ServiceEntry = {
  /** URL segment: /gallery/<slug>. Lowercase, hyphenated, never changes. */
  slug: string;
  /** Short label — grid tiles, filter chips, form options. Plural. */
  label: string;
  /**
   * Singular form, for sentences about one specific job.
   * "להזמנת עיצוב לחתונה" reads correctly; the plural "לחתונות" would sound
   * like ordering for weddings in general rather than for yours.
   */
  labelSingular: string;
  /** One line under the tile. */
  tagline: string;
  /** A key of ICONS. */
  icon: string;
  /** A key of PALETTE. */
  color: string;
  /** Category page: <h1> and the intro paragraph. */
  pageTitle: string;
  pageIntro: string;
};

export type Service = Omit<ServiceEntry, "icon"> & {
  icon: LucideIcon;
  /** Raw hex, for the OG image generator which can't use Tailwind. */
  hex: string;
};

const BRAND_CLASSES: CategoryClasses = {
  bg: "bg-brand",
  bgTint: "bg-brand-tint",
  text: "text-brand",
  border: "border-brand",
  ring: "ring-brand",
};

// An unknown icon or colour (a hand edit with a typo) falls back rather than
// breaking the build.
export const services: Service[] = (entries as ServiceEntry[]).map((entry) => ({
  ...entry,
  icon: ICONS[entry.icon] ?? Sparkles,
  hex: PALETTE[entry.color]?.hex ?? "#6ED7D8",
}));

/** Fast lookup for the [category] route and the gallery filter. */
export const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

/** Falls back to brand colours for anything not in the list (e.g. "all"). */
export function classesFor(slug: string): CategoryClasses {
  const color = serviceBySlug.get(slug)?.color;
  return (color && PALETTE[color]?.classes) || BRAND_CLASSES;
}

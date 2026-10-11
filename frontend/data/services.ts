import {
  Cake,
  Gem,
  Gift,
  Heart,
  Palette,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * The event categories Mitogal designs for.
 *
 * This array drives FOUR things at once:
 *   1. the services grid on the landing page
 *   2. the gallery filter chips
 *   3. the "סוג האירוע" select in the contact form
 *   4. the statically generated /gallery/[category] pages + sitemap
 *
 * Adding a seventh category is a single entry here — the page, the filter,
 * the form option and the sitemap entry all appear on their own.
 * Gal's Instagram also shows בת/בר מצווה, מתנות סוף שנה, כרטיסי גירוד
 * and בלונים — each is one more object in this list.
 */
export type Service = {
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
  icon: LucideIcon;
  /** Category page: <h1> and the intro paragraph. */
  pageTitle: string;
  pageIntro: string;
  /**
   * Tailwind class fragments for this category's colour, e.g. "cat-weddings".
   * Used as `bg-${color}`, `bg-${color}-tint`, `text-${color}-deep`.
   *
   * Written out in full below rather than interpolated, because Tailwind
   * scans source text statically — `bg-${s.color}` alone would never be
   * generated. See CATEGORY_CLASSES at the bottom of this file.
   */
  color: string;
  /** Raw hex, for the OG image generator which can't use Tailwind. */
  hex: string;
};

export const services: Service[] = [
  {
    slug: "weddings",
    color: "cat-weddings",
    hex: "#E58BA0",
    label: "חתונות",
    labelSingular: "חתונה",
    tagline: "מהזמנה ועד שולחן המתנות",
    icon: Gem,
    pageTitle: "מיתוג ועיצוב לחתונות",
    pageIntro:
      "שילוט כניסה, תפריטים, שמות שולחנות, פינת מתנות ועיצוב שנשאר בזיכרון — הכל בשפה עיצובית אחת שנבנית סביבכם ומלווה את היום מהרגע הראשון ועד האחרון.",
  },
  {
    slug: "gifts",
    color: "cat-gifts",
    hex: "#F5906B",
    label: "מתנות ממותגות",
    labelSingular: "מתנה ממותגת",
    tagline: "מתנה שרואים שחשבו עליה",
    icon: Gift,
    pageTitle: "מתנות ממותגות בהתאמה אישית",
    pageIntro:
      "שלטי אקריליק עם תמונה, עטיפות שוקולד מודפסות, אריזות מעוצבות ומתנות תודה למורות, לצוות ולאורחים. כל מתנה נבנית סביב האנשים שמקבלים אותה — עם השמות, התמונות והמילים הנכונות.",
  },
  {
    slug: "proposals",
    color: "cat-proposals",
    hex: "#E05C87",
    label: "הצעות נישואין",
    labelSingular: "הצעת נישואין",
    tagline: "הרגע הזה קורה פעם אחת",
    icon: Heart,
    pageTitle: "עיצוב להצעות נישואין",
    pageIntro:
      "אותיות מוארות, שלט אישי וכל הפרטים הקטנים שמובילים לרגע אחד. הכל מגיע אליכם מוכן, ארוז ודיסקרטי — כדי שאף אחד לא יגלה לפני הזמן.",
  },
  {
    slug: "birthdays",
    color: "cat-birthdays",
    hex: "#F5B942",
    label: "ימי הולדת",
    labelSingular: "יום הולדת",
    tagline: "לכל גיל, לכל סגנון",
    icon: Cake,
    pageTitle: "עיצוב ומיתוג לימי הולדת",
    pageIntro:
      "מיום הולדת ראשון ועד מסיבת הפתעה לגיל שישים — קיר בלונים, שלטי ברכה, מיתוג שולחן וכיבוד ממותג בהתאמה אישית מלאה לנושא שבחרתם.",
  },
  {
    slug: "holidays",
    color: "cat-holidays",
    hex: "#3FB3A5",
    label: "חגים",
    labelSingular: "חג",
    tagline: "חנוכה, פורים וסופי שנה",
    icon: Sparkles,
    pageTitle: "עיצוב ומיתוג לחגים",
    pageIntro:
      "מסיבות חג בגן ובבית הספר, אירועי חג בעבודה ומתנות סוף שנה ממותגות. עיצוב חגיגי שנראה מושקע ומגיע אליכם מוכן ומסודר.",
  },
  {
    slug: "concept",
    color: "cat-concept",
    hex: "#8E9BE0",
    label: "אירועי קונספט",
    labelSingular: "אירוע קונספט",
    tagline: "רעיון אחד שעובר בכל פרט",
    icon: Palette,
    pageTitle: "עיצוב ומיתוג לאירועי קונספט",
    pageIntro:
      "אירוע שנבנה סביב רעיון אחד — נושא, צבע או סיפור שחוזר בכל פריט. מהשילוט ועד עטיפת השוקולד, הכל מדבר באותה שפה, וכל פריט מרגיש חלק מאותו סיפור.",
  },
];

/** Fast lookup for the [category] route and the gallery filter. */
export const serviceBySlug = new Map(services.map((s) => [s.slug, s]));

/**
 * Every Tailwind class that depends on a category colour, written out in full.
 *
 * Tailwind v4 scans source files as plain text: a template literal like
 * `bg-${service.color}` produces no CSS, because the string "bg-cat-weddings"
 * never appears anywhere for the scanner to find. Listing them here is the
 * supported way to keep the colours data-driven.
 *
 * Adding a seventh category means adding one entry here as well as one to
 * `services` above.
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

export const CATEGORY_CLASSES: Record<string, CategoryClasses> = {
  weddings: {
    bg: "bg-cat-weddings",
    bgTint: "bg-cat-weddings-tint",
    text: "text-cat-weddings-deep",
    border: "border-cat-weddings",
    ring: "ring-cat-weddings",
  },
  gifts: {
    bg: "bg-cat-gifts",
    bgTint: "bg-cat-gifts-tint",
    text: "text-cat-gifts-deep",
    border: "border-cat-gifts",
    ring: "ring-cat-gifts",
  },
  proposals: {
    bg: "bg-cat-proposals",
    bgTint: "bg-cat-proposals-tint",
    text: "text-cat-proposals-deep",
    border: "border-cat-proposals",
    ring: "ring-cat-proposals",
  },
  birthdays: {
    bg: "bg-cat-birthdays",
    bgTint: "bg-cat-birthdays-tint",
    text: "text-cat-birthdays-deep",
    border: "border-cat-birthdays",
    ring: "ring-cat-birthdays",
  },
  holidays: {
    bg: "bg-cat-holidays",
    bgTint: "bg-cat-holidays-tint",
    text: "text-cat-holidays-deep",
    border: "border-cat-holidays",
    ring: "ring-cat-holidays",
  },
  concept: {
    bg: "bg-cat-concept",
    bgTint: "bg-cat-concept-tint",
    text: "text-cat-concept-deep",
    border: "border-cat-concept",
    ring: "ring-cat-concept",
  },
};

/** Falls back to brand colours for anything not in the map (e.g. "all"). */
export function classesFor(slug: string): CategoryClasses {
  return (
    CATEGORY_CLASSES[slug] ?? {
      bg: "bg-brand",
      bgTint: "bg-brand-tint",
      text: "text-brand",
      border: "border-brand",
      ring: "ring-brand",
    }
  );
}

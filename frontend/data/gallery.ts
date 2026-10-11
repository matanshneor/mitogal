/**
 * The portfolio gallery manifest — now backed by Gal's real photographs.
 *
 * ── ADDING MORE PHOTOS ────────────────────────────────────────────────────
 * 1. Drop the file into  public/images/portfolio/
 * 2. Add an entry below with `src`, a `category` slug from data/services.ts,
 *    a descriptive `alt`, and an `aspect`
 * Items with no `src` render a coloured placeholder of identical size, so the
 * layout never shifts when a photo is added or removed.
 *
 * ── ALT TEXT ──────────────────────────────────────────────────────────────
 * These describe each photo at group level and are accurate, but they are not
 * as specific as they could be. Anyone who knows the individual jobs should
 * sharpen them — good alt text is both an accessibility win and the main way
 * Google understands an image-led portfolio.
 * ──────────────────────────────────────────────────────────────────────────
 */
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

const P = "/images/portfolio";

export const gallery: GalleryItem[] = [
  // ── חתונות ──────────────────────────────────────────────────────────────
  { id: "wed-2", category: "weddings", src: `${P}/wedding2.jpg`, aspect: "tall",
    alt: "עיצוב ומיתוג תפריטים לחתונה" },
  { id: "wed-3", category: "weddings", src: `${P}/wedding3.jpg`, aspect: "wide",
    alt: "מיתוג מעמד טבעות לחתונה" },
  { id: "wed-1", category: "weddings", src: `${P}/wedding1.jpg`, aspect: "wide",
    alt: "תפריט חתונה מודפס עם מונוגרם של בני הזוג, קשור בסרט אורגנזה ומונח על צלחת" },
  { id: "wed-4", category: "weddings", src: `${P}/wedding-gift1.jpg`, aspect: "tall",
    alt: "מתנה ממותגת לאורחי החתונה" },

  // ── הצעות נישואין ואירוסין ──────────────────────────────────────────────
  { id: "prp-1", category: "proposals", src: `${P}/engagement1.jpg`, aspect: "tall",
    alt: "עיצוב ומיתוג לאירוע אירוסין" },
  { id: "prp-2", category: "proposals", src: `${P}/engagement2.jpg`, aspect: "tall",
    alt: "פרטי עיצוב אישיים לאירוע אירוסין" },
  { id: "prp-3", category: "proposals", src: `${P}/love-day-heart-box.jpg`, aspect: "square",
    alt: "מארז מתוקים ממותג בקופסת לב ליום האהבה, עם עטיפות מודפסות ותמונות של בני הזוג" },
  { id: "prp-4", category: "proposals", src: `${P}/love-day2.jpg`, aspect: "tall",
    alt: "עיצוב רומנטי ומיתוג ליום האהבה" },
  // Square, not tall: the file is cropped to 737×835 (0.88), so a 3/4 tile
  // would trim the sides and clip the heart box. A square tile trims top and
  // bottom instead, which also removes the last sliver of the hand.

  // ── ימי הולדת ───────────────────────────────────────────────────────────
  { id: "bd-1", category: "birthdays", src: `${P}/birthday1.jpg`, aspect: "tall",
    alt: "אריזות חטיפים ממותגות ליום הולדת ראשון בעיצוב פו הדוב, עם שמות החוגגים" },
  { id: "bd-5", category: "birthdays", src: `${P}/birthday5.jpg`, aspect: "tall",
    alt: "אריזות וכיבוד ממותגים ליום הולדת" },
  { id: "bd-4", category: "birthdays", src: `${P}/birthday4.jpg`, aspect: "tall",
    alt: "עיצוב שולחן ומיתוג ליום הולדת" },
  { id: "bd-2", category: "birthdays", src: `${P}/birthday2.jpg`, aspect: "tall",
    alt: "מיתוג מודפס ליום הולדת" },
  { id: "bd-7", category: "birthdays", src: `${P}/birthday7.jpg`, aspect: "tall",
    alt: "פינת כיבוד ממותגת ליום הולדת" },
  { id: "bd-10", category: "birthdays", src: `${P}/birthday10.jpg`, aspect: "tall",
    alt: "מתנות ואריזות ממותגות לאורחי יום ההולדת" },
  { id: "bd-3", category: "birthdays", src: `${P}/birthday3.jpg`, aspect: "tall",
    alt: "פרטי עיצוב ממותגים למסיבת יום הולדת" },
  { id: "bd-6", category: "birthdays", src: `${P}/birthday6.jpg`, aspect: "tall",
    alt: "מיתוג בהתאמה אישית למסיבת יום הולדת" },
  { id: "bd-8", category: "birthdays", src: `${P}/birthday8.jpg`, aspect: "tall",
    alt: "פרטים מודפסים ליום הולדת בהתאמה אישית" },
  { id: "bd-9", category: "birthdays", src: `${P}/birthday9.jpg`, aspect: "tall",
    alt: "עיצוב ומיתוג למסיבת יום הולדת" },
  { id: "bd-11", category: "birthdays", src: `${P}/birthday11.jpg`, aspect: "tall",
    alt: "מיתוג מודפס בנושא שנבחר ליום ההולדת" },
  { id: "bd-12", category: "birthdays", src: `${P}/birthday12.jpg`, aspect: "tall",
    alt: "פרטי עיצוב ליום הולדת בהתאמה אישית" },

  // ── חגים ────────────────────────────────────────────────────────────────
  { id: "hol-3", category: "holidays", src: `${P}/holidays3.jpg`, aspect: "tall",
    alt: "עיצוב חגיגי ומודפס לאירוע חג" },
  { id: "hol-4", category: "holidays", src: `${P}/holidays4.jpg`, aspect: "tall",
    alt: "פרטי מיתוג לחג בהתאמה אישית" },
  { id: "hol-1", category: "holidays", src: `${P}/holidays1.jpg`, aspect: "tall",
    alt: "עיצוב ומיתוג לאירוע חג" },
  { id: "hol-2", category: "holidays", src: `${P}/holidays2.jpg`, aspect: "tall",
    alt: "מתנות חג ממותגות" },
  { id: "hol-5", category: "holidays", src: `${P}/hafrashat-hala.jpg`, aspect: "tall",
    alt: "עיצוב ומיתוג לאירוע הפרשת חלה" },

  // ── אירועי קונספט ───────────────────────────────────────────────────────
  { id: "con-3", category: "concept", src: `${P}/events4.jpg`, aspect: "tall",
    alt: "שולחן אירוע שלם בקונספט פיות יער — רקע מודפס, קופסאות מתנה, בקבוקים ומחברות באותה שפה עיצובית" },
  { id: "con-1", category: "concept", src: `${P}/company-events2.jpg`, aspect: "tall",
    alt: "עטיפות שוקולד ממותגות ליום האישה, עם איורים והקדשות אישיות בקונספט אחיד" },
  { id: "con-4", category: "concept", src: `${P}/event8.jpg`, aspect: "tall",
    alt: "מעמדי פטריות בחיתוך דיי־קאט לביצות הפתעה, מתוך קונספט פיות היער" },
  { id: "con-5", category: "concept", src: `${P}/events1.jpg`, aspect: "tall",
    alt: "בר מתוקים מדורג עם ממתקים בכוסות ובקעריות, משולב בירק" },
  { id: "con-6", category: "concept", src: `${P}/events6.jpg`, aspect: "tall",
    alt: "עיצוב אירוע בקונספט אחיד — פריטים ממותגים באותה שפה" },
  { id: "con-2", category: "concept", src: `${P}/company-events1.jpg`, aspect: "tall",
    alt: "פריטים מודפסים בקונספט עיצובי אחיד לאירוע" },
  { id: "con-7", category: "concept", src: `${P}/events7.jpg`, aspect: "tall",
    alt: "פריטי אירוע ממותגים בקונספט עיצובי אחד" },
  { id: "con-8", category: "concept", src: `${P}/events9.jpg`, aspect: "tall",
    alt: "עיצוב שולחן אירוע בקונספט מותאם אישית" },

  // ── מתנות ממותגות ───────────────────────────────────────────────────────
  { id: "gft-8", category: "gifts", src: `${P}/events2.jpg`, aspect: "tall",
    alt: "קופות צדקה ממותגות כמזכרת מהחאלקה, עם כתר מוזהב ותאריך האירוע" },
  { id: "gft-9", category: "gifts", src: `${P}/events3.jpg`, aspect: "tall",
    alt: "מתנת תודה לגננת — כוס תרמית עם שם מודפס לצד כרטיס אקריליק עם הקדשה" },
  { id: "gft-2", category: "gifts", src: `${P}/gift1.jpg`, aspect: "tall",
    alt: "מתנה ממותגת בהתאמה אישית" },
  { id: "gft-3", category: "gifts", src: `${P}/gift3.jpg`, aspect: "tall",
    alt: "מתנה מעוצבת עם הקדשה אישית" },
  { id: "gft-4", category: "gifts", src: `${P}/gift4.jpg`, aspect: "tall",
    alt: "אריזת מתנה ממותגת" },
  { id: "gft-5", category: "gifts", src: `${P}/gift5.jpg`, aspect: "tall",
    alt: "מתנה ממותגת מודפסת" },
  { id: "gft-6", category: "gifts", src: `${P}/gift6.jpg`, aspect: "tall",
    alt: "סט מתנות ממותגות" },
  { id: "gft-7", category: "gifts", src: `${P}/gift7.jpg`, aspect: "tall",
    alt: "מתנה מעוצבת בהתאמה אישית" },
  { id: "gft-1", category: "gifts", src: `${P}/gift2.jpg`, aspect: "tall",
    alt: "שלט אקריליק מודפס בצורת קשת על מעמד עץ, מתנת תודה עם תמונה קבוצתית" },
  { id: "gft-10", category: "gifts", src: `${P}/events10.jpg`, aspect: "tall",
    alt: "שלט אקריליק בצורת קשת עם מזמור לתודה ותמונת הילד, על מעמד עץ וקשור בסרט" },

  /*
   * Every photo in public/images/portfolio/ is now placed — the `events*`
   * files were assigned by Gal, not guessed.
   *
   * One thing left: the alt text on con-6, con-7 and con-8 (events6/7/9)
   * describes them at group level rather than by their actual contents.
   * Sharpen those three when someone who knows the jobs can look at them —
   * precise alt text is both an accessibility win and how Google reads an
   * image-led portfolio.
   */
];

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

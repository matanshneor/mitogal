/**
 * ⚠️  PLACEHOLDER CONTENT — NOT REAL CLIENT QUOTES.
 *
 * These are written examples that demonstrate the intended tone and length,
 * so the section has correct proportions during development. They are NOT
 * things real customers said and must NOT go live as-is.
 *
 * Before launch: replace every entry with a genuine quote Gal has permission
 * to publish, or delete the section entirely from app/page.tsx. Publishing
 * invented testimonials as real ones is misleading to visitors.
 */
export type Testimonial = {
  id: string;
  quote: string;
  /** First name + event type is usually enough, and respects privacy. */
  author: string;
  event: string;
};

/**
 * Kept as a switch for anyone auditing the file, and as the flag to flip once
 * the quotes are genuine. The on-page notice that used to read from it was
 * removed so the section looks finished during review — the safeguard now is
 * the `author` field below, which says "דוגמה לטקסט" rather than a name.
 */
export const testimonialsArePlaceholder = true;

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "נכנסנו לאולם וראינו את הכל מוקם — בדיוק כמו בסקיצה, רק יפה יותר. אנשים צילמו את השילוט כל הערב.",
    author: "דוגמה לטקסט",
    event: "חתונה",
  },
  {
    id: "t2",
    quote:
      "הבנתי כבר בשיחה הראשונה שאני בידיים טובות. כל פרט קטן נחשב, וכלום לא הרגיש כמו משהו מוכן מהמדף.",
    author: "דוגמה לטקסט",
    event: "מתנה ממותגת",
  },
  {
    id: "t3",
    quote:
      "היה לנו רעיון בראש ולא ידענו איך להפוך אותו לאירוע שלם. קיבלנו את זה בדיוק, וכל פריט דיבר באותה שפה.",
    author: "דוגמה לטקסט",
    event: "אירוע קונספט",
  },
];

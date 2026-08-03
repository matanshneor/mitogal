/**
 * The four-step custom process.
 *
 * Note: Mitogal does NOT do on-site setup — the work ends when the finished
 * items are handed over. Step 04 is deliberately worded to cover both
 * delivery and pickup, since the exact arrangement varies; do not narrow it
 * to "we deliver" or "you collect" without checking with Gal first, and never
 * re-introduce an "we come and install it" step.
 */
export type ProcessStep = {
  /** Rendered as an oversized gold serif numeral. */
  number: string;
  title: string;
  body: string;
};

export const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "שיחת היכרות",
    body: "מדברים על האירוע, על האנשים, הסגנון והאווירה שאתם מדמיינים. מעלים רעיונות ומחליטים על השפה העיצובית.",
  },
  {
    number: "02",
    title: "עיצוב הקונספט",
    body: "אני מיישמת את הרעיונות ושולחת סקיצות. עוברים עליהן יחד, מדייקים צבעים, גופנים וניסוחים, עד שהכל מרגיש נכון.",
  },
  {
    number: "03",
    title: "הפקה והדפסה",
    body: "שלב הייצור: הדפסה, חיתוך, התאמה ואריזה. כל פריט עובר בדיקת איכות לפני שהוא נסגר ויוצא אליכם.",
  },
  {
    number: "04",
    title: "מסירה",
    body: "מתאמים מסירה שנוחה לכם. הכל עובר לידיים שלכם ארוז ומסודר, מוכן ליום האירוע.",
  },
];

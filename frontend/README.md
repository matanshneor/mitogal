# מיתוגל — אתר תדמית ולידים

אתר נחיתה בעברית (RTL, mobile-first) עבור **מיתוגל** — עיצוב ומיתוג לאירועים של גל אהרוני.
המטרה: להמיר גולש שהגיע מהאינסטגרם לפנייה בוואטסאפ תוך גלילה אחת.

**Next.js 16 · React 19 · Tailwind v4 · Framer Motion · TypeScript**

באוויר: https://mitogal.up.railway.app · ניהול: https://mitogal.up.railway.app/admin

---

## הרצה

```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # בנייה לייצור
npm run lint
npm run check:images   # מאמת שתיקיית התמונות והמניפסט מסונכרנים
```

`check:images` רץ אוטומטית לפני כל `build`. הוא **מפיל את הבנייה** אם תמונה
מופיעה במניפסט ולא קיימת בתיקייה, או להפך — קיימת בתיקייה ולא מוצגת בשום מקום
באתר. זה נוסף אחרי שתמונה אחת נעלמה מהאתר בשקט: הקובץ נשאר על הדיסק, הרשומה
נמחקה בטעות, ואף אחד לא ידע.

---

## שלושת הדברים שתרצה לשנות

### 1. מספר טלפון, אינסטגרם וכתובת האתר

הכל יושב במקום **אחד בלבד** — [`lib/site.config.ts`](lib/site.config.ts).
אין מספר טלפון מקודד בשום קומפוננטה. שינוי שם מתעדכן בכפתור הצף, בטופס,
בפוטר, בכותרת, ב-JSON-LD ובכל קישורי הוואטסאפ בבת אחת.

> `url` מוגדר כרגע ל-`https://mitogal.up.railway.app`. כשמחברים דומיין משלכם —
> לעדכן אותו. הוא משמש ל-OpenGraph, ל-canonical ול-sitemap.

### 2. תמונות

כל 43 המשבצות בגלריה כבר מציגות עבודות אמיתיות של גל. להוספת תמונה:

1. שים את הקובץ ב-`public/images/portfolio/`
2. הוסף שורה ב-[`data/gallery.ts`](data/gallery.ts)
3. כתוב `alt` שמתאר את התמונה בפועל

```ts
{ id: "wed-09", category: "weddings", src: `${P}/wedding-09.jpg`, aspect: "tall",
  alt: "שלט כניסה מעוצב לחתונה עם שמות בני הזוג" },
```

`check:images` יפיל את הבנייה אם שכחת אחד משני הצעדים הראשונים.

הפורטרט של גל ב-[`About.tsx`](components/sections/About.tsx) עדיין משבצת זמנית.

### 3. Google Analytics ו-Meta Pixel

```bash
cp .env.example .env.local
```
ומלא את `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_META_PIXEL_ID`. בלי המשתנים האלה שום
סקריפט אנליטיקס לא נטען ואין אזהרות.

באותו קובץ גם `NEXT_PUBLIC_API_URL`, כתובת הבקנד. הוא **חובה**: בלעדיו הטופס
לא שומר פניות ו-`/admin` לא עובד.

---

## איך הטופס עובד

בלחיצה על "שליחה בוואטסאפ" קורים שני דברים באותו רגע:

1. הפנייה נשלחת לשרת ([`../backend`](../backend)) ונשמרת במסד הנתונים.
   גל רואה אותה ב-`/admin`, גם אם המבקר לא לחץ "שלח" בוואטסאפ.
2. נפתחת הודעת וואטסאפ מוכנה (`waLeadLink()` ב-[`lib/site.config.ts`](lib/site.config.ts)).

השמירה לא מעכבת את פתיחת הוואטסאפ ולא חוסמת אותו אם השרת לא זמין.
הקוד ב-[`lib/api.ts`](lib/api.ts). בטופס יש גם שדה נסתר נגד בוטים (honeypot).

---

## מבנה

```
app/
  layout.tsx                    RTL shell, פונטים, metadata, JSON-LD
  page.tsx                      דף הנחיתה
  gallery/[category]/page.tsx   תבנית אחת → 6 דפי קטגוריה סטטיים
  admin/page.tsx                ניהול פניות (סיסמה, לא באינדקס)
  sitemap.ts / robots.ts        נגזרים מ-data/services.ts
components/
  layout/    Header · Footer · WhatsAppFab · SkipLink · Analytics
  sections/  Hero · Services · Portfolio · Process · About · Testimonials · Contact
  gallery/   FilterContext · GalleryGrid
  admin/     AdminDashboard
  ui/        SectionHeading · MediaTile · Reveal · Button · InstagramIcon
data/        services · gallery · process · testimonials
lib/         site.config.ts · api.ts
```

### הוספת קטגוריה חדשה

שורה אחת ב-[`data/services.ts`](data/services.ts) — ומתקבלים אוטומטית:
משבצת בגריד, צ'יפ סינון בגלריה, אפשרות בטופס, דף `/gallery/<slug>` מלא
עם metadata משלו, קישור בפוטר, ורשומה ב-sitemap.

---

## דפלוי

ב-Railway, כשירות נפרד מהבקנד. ההוראות המלאות ב-[README הראשי](../README.md).

---

## ⚠️ עדיין פתוח

| מה | איפה |
|---|---|
| **המלצות אמיתיות** — הציטוטים הם טקסט לדוגמה. הייחוס תחת כל אחד אומר "דוגמה לטקסט", אז שום דבר לא מתחזה להמלצה אמיתית — אבל **אסור לתת להם שמות אמיתיים בלי ציטוט אמיתי** | `data/testimonials.ts` — החלף והפוך את `testimonialsArePlaceholder` ל-`false`, או הסר את הסקשן מ-`app/page.tsx` |
| **טקסט "אודות"** — טיוטה שנכתבה לפי הביו באינסטגרם, לא המילים של גל | `components/sections/About.tsx` (מסומן ב-TODO) |
| **טקסט חלופי (alt) כללי מדי** — בשלוש תמונות: con-6, con-7, con-8 | `data/gallery.ts` (מסומן בהערה בסוף הקובץ) |
| **פורטרט של גל** — הפלייסהולדר היחיד שנשאר | `components/sections/About.tsx` |
| **דומיין משלכם** (רשות) — כרגע `mitogal.up.railway.app` | [README הראשי](../README.md), סעיף "דומיין משלכם" |

---

## עיצוב

**"בית דפוס".** גל מדפיסה, חותכת, מקפלת ואורזת — עטיפות שוקולד, שלטי
אקריליק, תפריטים, אריזות מתנה. האתר בנוי מעולם החומרים הזה: נייר, דיו
רווי, פינות דיי־קאט וקשתות.

הטוקנים חיים ב-`@theme` בתוך [`app/globals.css`](app/globals.css) — אין
`tailwind.config.js`.

### צבע

צבע המותג `#6ED7D8` **נדגם מהלוגו של גל עצמה** (האות G ב-"Gal"), לא הומצא.
הוא בהיר, ולכן הוא צבע **מילוי בלבד — תמיד עם טקסט דיו** (10.4:1). הגרסה
`-deep` (`#3C7677`) היא זו שנושאת טקסט לבן ומשמשת כצבע טקסט על נייר.

לכל קטגוריה יש **צבע משלה** שצובע את הכרטיס שלה, את צ'יפ הסינון שלה ואת
תמונת השיתוף של הדף שלה. כל אחד קיים בשלוש דרגות: `vivid` (מילוי + טקסט
דיו), `-deep` (טקסט קטן / לבן על צבע) ו-`-tint` (רקעים).

> **כל 26 צמדי הצבעים נבדקו מול WCAG AA ועוברים.** אם מוסיפים גוון — לבדוק
> ניגודיות לפני. זו הנקודה שבה עיצובים צבעוניים נשברים.

### כללי אצבע

- **Fredoka לכותרות, Assistant לגוף.** אף פעם לא הפוך.
- **קשת** (`arch`) שמורה לתמונות מפתח — ה-hero והפורטרט. היא קשת הבלונים, והיא מופיעה גם בעבודות של גל עצמה.
- **צללים נושאים גוון**, אף פעם לא אפור ניטרלי.
- **RTL:** בקוד משתמשים רק ב-`ps-`/`pe-`/`ms-`/`me-`/`text-start`/`text-end`. החריג היחיד הוא הכפתור הצף, שמקובע פיזית ל-`left-4`.

### נכסי מותג

| קובץ | שימוש |
|---|---|
| `brand/logo-original.jpeg` | הקובץ המקורי של גל — מקור לכל השאר |
| `public/logo-wordmark.png` | חיתוך צר לטקסט, לכותרת ולפוטר |
| `public/logo.png` | הסימן המלא עם האקוורל, לתמונות השיתוף |
| `app/icon.svg` | פאביקון |
| `brand/Assistant-Bold.ttf` | פונט עברי סטטי — נדרש ליצירת תמונות השיתוף בלבד |

# מיתוגל

האתר של **מיתוגל**, עיצוב ומיתוג לאירועים של גל אהרוני.

```
frontend/   האתר עצמו: Next.js 16 · React 19 · Tailwind v4     → פרטים ב-frontend/README.md
backend/    השרת: Node 22 · Express 5 · Postgres               → שומר פניות, מגיש את /admin
```

שני השירותים עולים ל-Railway כשני שירותים נפרדים באותו פרויקט, יחד עם מסד נתונים Postgres.

## באוויר

| | כתובת |
|---|---|
| האתר | https://mitogal.up.railway.app |
| ניהול פניות | https://mitogal.up.railway.app/admin |
| השרת | https://mitogal-api.up.railway.app (בדיקה: `/health`) |
| Railway | פרויקט `mitogal`: שירותים `frontend`, `backend`, `Postgres` |

**כל דחיפה ל-`main` עולה לאוויר לבד** תוך כמה דקות. מתעדכן רק השירות שהקבצים
שלו השתנו (`watchPatterns` ב-`railway.json`). שינוי ב-README הראשי לא מעלה כלום.

> ⚠️ **לא למחוק את שירות `Postgres`**. כל הפניות שמורות בו, ואין להן גיבוי אחר.

---

## תחזוקה

### החלפת הסיסמה של /admin

1. Railway → `backend` → **Variables** → `ADMIN_PASSWORD` → ערך חדש (לפחות 10 תווים)
2. **Deploy** לשינויים. אם השירות לא עלה מחדש לבד: **Deployments → Redeploy**

עד שהשרת עולה מחדש, הסיסמה הישנה ממשיכה לעבוד. מי שכבר מחובר נשאר מחובר עד
שהחיבור שלו פג (12 שעות). כדי לנתק את כולם מיד, מחליפים גם את `SESSION_SECRET`.

### שינוי הכתובת `*.up.railway.app`

Railway → השירות → **Settings → Networking** → עריכת הדומיין. אחרי שינוי:

- **כתובת השרת השתנתה?** צריך **Redeploy ל-frontend**, כי הכתובת נצרבת באתר בזמן הבנייה.
- **כתובת האתר השתנתה?** צריך Redeploy ל-backend (בשביל `CORS_ORIGINS`), ולעדכן את `url` ב-[`frontend/lib/site.config.ts`](frontend/lib/site.config.ts).

המשתנים עצמם מתעדכנים לבד, כי הם מפנים ל-`RAILWAY_PUBLIC_DOMAIN`.

---

## מה הבקנד עושה

| נתיב | מי משתמש | מה הוא עושה |
|---|---|---|
| `POST /api/leads` | הטופס באתר | שומר פנייה. מוגבל ל-10 פניות ל-10 דקות לכל IP, ובוטים נחסמים בשדה נסתר |
| `POST /api/admin/login` | עמוד `/admin` | בודק סיסמה ומחזיר חיבור ל-12 שעות. 5 ניסיונות שגויים חוסמים ל-15 דקות |
| `GET /api/admin/leads` | עמוד `/admin` | 500 הפניות האחרונות |
| `PATCH /api/admin/leads/:id` | עמוד `/admin` | מסמן פנייה כ"טופלה" או מחזיר אותה ל"חדשה" |
| `GET /health` | Railway | בודק שהשרת ומסד הנתונים פועלים |

הטבלה נוצרת אוטומטית בהפעלה הראשונה. אין צורך להריץ מיגרציות.

---

## הרצה מקומית

צריך Postgres מקומי. אפשר למשל עם Docker:
`docker run -e POSTGRES_PASSWORD=dev -p 5432:5432 postgres:17`

```bash
# טרמינל 1: בקנד
cd backend
cp .env.example .env        # למלא ADMIN_PASSWORD ו-SESSION_SECRET
npm install
npm run dev                 # http://localhost:4000

# טרמינל 2: פרונטנד
cd frontend
cp .env.example .env.local  # NEXT_PUBLIC_API_URL=http://localhost:4000
npm install
npm run dev                 # http://localhost:3000  ·  ניהול: /admin
```

---

## הקמה מאפס ב-Railway

הפרויקט כבר מוקם. הסעיף הזה נועד למקרה שצריך להקים אותו מחדש, למשל בחשבון אחר.

### 1. פרויקט ומסד נתונים

1. דוחפים את הריפו לגיטהאב.
2. ב-Railway: **New Project → Deploy from GitHub repo**, ובוחרים את `mitogal`.
3. בתוך הפרויקט: **+ Create → Database → PostgreSQL**.

> **את הריפו מחברים רק מהאתר של Railway** (**Settings → Source → Connect Repo**).
> חיבור דרך שורת הפקודה (`railway environment edit`) נראה מחובר בהגדרות, אבל
> Railway לא מקבל הודעה על דחיפות לגיטהאב, והאתר לא מתעדכן לבד.

### 2. שירות הבקנד

שירות חדש מהריפו. ב-**Settings** שלו:

| הגדרה | ערך |
|---|---|
| Service name | `backend` |
| Root Directory | `/backend` |
| Config File Path | `/backend/railway.json` |
| Networking | **Generate Domain** |

ב-**Variables**:

```
DATABASE_URL     = ${{Postgres.DATABASE_URL}}
CORS_ORIGINS     = https://${{frontend.RAILWAY_PUBLIC_DOMAIN}}
ADMIN_PASSWORD   = <הסיסמה של גל, לפחות 10 תווים>
SESSION_SECRET   = <מחרוזת אקראית: openssl rand -base64 48>
```

### 3. שירות הפרונטנד

עוד שירות מאותו ריפו:

| הגדרה | ערך |
|---|---|
| Service name | `frontend` |
| Root Directory | `/frontend` |
| Config File Path | `/frontend/railway.json` |
| Networking | **Generate Domain** |

ב-**Variables**:

```
NEXT_PUBLIC_API_URL = https://${{backend.RAILWAY_PUBLIC_DOMAIN}}
```

ואם רוצים אנליטיקס: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`.

> ⚠️ משתני `NEXT_PUBLIC_*` נצרבים לתוך האתר **בזמן הבנייה**. אחרי שמשנים
> אותם צריך **Redeploy** לפרונטנד, ושינוי בלבד לא יספיק.

### 4. בדיקה

- `https://<backend-domain>/health` צריך להחזיר `{"ok":true}`
- ממלאים את הטופס באתר ונכנסים ל-`/admin`. הפנייה צריכה להופיע שם.

### 5. דומיין משלכם

ב-frontend: **Settings → Networking → Custom Domain**. אחר כך:

1. מוסיפים את הדומיין ל-`CORS_ORIGINS` של הבקנד, מופרד בפסיק:
   `https://mitogal.co.il,https://www.mitogal.co.il`
2. מעדכנים את `url` ב-[`frontend/lib/site.config.ts`](frontend/lib/site.config.ts).
   הוא משמש לתמונות השיתוף, ל-canonical ול-sitemap.
3. Redeploy ל-backend, כדי שהשינוי ב-`CORS_ORIGINS` ייכנס לתוקף.

---

## אבטחה, בקצרה

- הסיסמה לא נשמרת בדפדפן. נשמר רק טוקן חתום שפג אחרי 12 שעות, והוא נמחק כשסוגרים את הלשונית.
- החלפת `SESSION_SECRET` מנתקת את כל מי שמחובר.
- הבקנד מקבל בקשות רק מהכתובות שב-`CORS_ORIGINS`.
- `/admin` חסום למנועי חיפוש (`robots.txt` ו-`noindex`).

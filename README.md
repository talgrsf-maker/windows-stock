# מלאי חלונות ממ״ד

מערכת React/Vite בעברית וב־RTL לניהול מלאי רציף של חלונות ממ״ד ורכיבי ייצור. היישום פועל מיד במצב דמו מקומי, עם שכבת Repository מוכנה למעבר עתידי ל־Supabase.

## התקנה והרצה

נדרשים Node.js 20+ ו־npm.

```bash
npm install
copy .env.example .env
npm run dev
```

פתחו את הכתובת שמדפיס Vite. לבדיקות ולהפקת build:

```bash
npm test
npm run build
```

## מצב דמו

`VITE_DATA_MODE=local` הוא ברירת המחדל. הנתונים נשמרים ב־localStorage בדפדפן ואפשר לאפס אותם במסך הגדרות (מנהל מערכת בלבד). במסך הכניסה בוחרים אחד ממשתמשי הדמו ללא סיסמה:

- `viewer@example.com` — צפייה
- `bending@example.com` — דיווח ייצור רכיבים
- `windows@example.com` — הרכבת והוצאת חלונות
- `admin@example.com` — כל ההרשאות

## Google Sheets — מסד נתונים משותף ללא שרת נפרד

המסלול המומלץ להפעלה בסיסית מול מספר טלפונים הוא Google Sheets + Apps Script. קוד השרת וההוראות נמצאים ב־[google-apps-script/README.md](google-apps-script/README.md). לאחר ההקמה קבעו בקובץ `.env` את `VITE_DATA_MODE=google_sheets`, והגדירו ב־Vercel את כתובת ה־Web App וה־token כמשתני שרת. התיקייה `api/` היא פרוקסי קטן שמאפשר את החיבור מהדפדפן בלי לחשוף את ה־token.

## Supabase

1. צרו פרויקט Supabase.
2. הריצו ב־SQL Editor לפי הסדר: `supabase/schema.sql`, `supabase/policies.sql`, `supabase/seed.sql`.
3. העתיקו את `.env.example` ל־`.env`, מלאו `VITE_SUPABASE_URL` ו־`VITE_SUPABASE_ANON_KEY`, ושנו ל־`VITE_DATA_MODE=supabase`.
4. הפעילו Realtime עבור אירועי המלאי.

אין להשתמש ב־`service_role` בדפדפן. סכמת SQL כוללת RPC אטומי לייצור חלון; יש להשלים את ריפוזיטורי Supabase ואת RPCs הנוספים לפני הפעלת מצב Supabase בפועל.

## PWA ופריסה

היישום כולל manifest ו־service worker בסיסי, כך שניתן להוסיף אותו למסך הבית מהדפדפן בטלפון. לפריסת Vercel: העלו את המאגר, הגדירו את משתני הסביבה בפרויקט, והשתמשו ב־Build Command: `npm run build`.

## מבנה ומודל נתונים

- `src/domain/inventory` — חישובי מלאי, יעדים, חוסרים ו־BOM ללא React.
- `src/repositories` — ממשק Repository, מימוש localStorage ושלד Supabase.
- `src/services` — יצירת אירועים בלתי־משתנים.
- `src/app` — מסכי ממשק.
- `supabase` — סכימה, RLS וזריעת נתונים.

המלאי נגזר מה־baseline האחרון ומכל האירועים שאחריו. ייצור רכיב מוסיף רכיב; הרכבת חלון מוסיפה מוצר ומורידה את ה־BOM שנשמר כ־snapshot באירוע; הוצאה מורידה חלון; ביטול יוצר אירוע הפוך — הוא אינו מוחק היסטוריה.

החלטות עסקיות שנותרו ניתנות לשינוי: ערכי ה־BOM ההתחלתיים, זמני העבודה לכל רכיב, הגדרות אחריות הרכיבים, ויעדי המלאי.

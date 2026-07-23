# Google Sheets backend

הקובץ `Code.gs` הוא שרת Google Apps Script המתחבר לגיליון Google Sheet שהוא יוצר. הוא שומר מוצרים, רכיבים, BOM, baseline ואירועי מלאי בגליונות נפרדים. כל כתיבת אירוע נעשית בתוך `LockService`, ולכן שני דיווחים באותו רגע לא יכתבו את אותה שורה במקביל.

## הקמה

1. התחברו לחשבון Google שמנהל המערכת ישלוט בו.
2. פתחו [script.new](https://script.new), תנו שם לפרויקט, החליפו את תוכן `Code.gs` בתוכן הקובץ הזה ושמרו.
3. ב־Project Settings > Script properties הוסיפו נכס בשם `API_TOKEN` עם סיסמה אקראית ארוכה. שמרו אותה — היא נדרשת גם בקובץ `.env` של האתר.
4. בחרו בפונקציה `setup` ולחצו Run. אשרו את הרשאות Google. בלוגים תופיע כתובת הגיליון שנוצר; שמרו אותה ואל תשתפו עריכה בגיליון עם עובדים רגילים.
5. Deploy > New deployment > Web app. בחרו **Execute as: Me**. ב־Who has access בחרו את האפשרות המצומצמת ביותר שמאפשרת לעובדים שלכם להיכנס (למשל משתמשים בחשבון Workspace שלכם). העתיקו את כתובת ה־`/exec`.

## חיבור האתר ופרסום

Apps Script אינו מאפשר לדפדפן חיצוני לקרוא תגובות API באופן אמין (CORS), לכן האתר משתמש ב־Vercel כפרוקסי קטן וחינמי. זה גם מונע מה־token להיחשף בטלפון.

ב־Vercel > Project > Settings > Environment Variables הגדירו:

```env
GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
GOOGLE_APPS_SCRIPT_TOKEN=אותו_API_TOKEN
APP_ACCESS_PASSWORD=סיסמת-הכניסה-של-העובדים
```

בקובץ `.env` המקומי צריך רק `VITE_DATA_MODE=google_sheets`. מצב זה יעבוד לאחר הפריסה ל־Vercel, משום שהפרוקסי נמצא בתיקייה `api/`. לפרסום: העלו את התיקייה ל־GitHub, ייבאו את המאגר ב־Vercel, הוסיפו את שלושת משתני השרת לעיל ופרסמו. בדקו תחילה דיווח אחד ממחשב ושני מטלפון.

## אבטחה

ה־token הוא פתרון מינימלי למערכת פנימית; הוא מגיע לדפדפן ולכן אינו מחליף מערכת התחברות מלאה. לפריסה לצוות רחב, העדיפו הגבלת גישה לחשבונות Google של העסק (Google Workspace) או עברו בהמשך ל־Supabase Auth. משתמשי הדמו הם כרגע בחירת תפקיד במסך הכניסה, ולא התחברות Google אמיתית.

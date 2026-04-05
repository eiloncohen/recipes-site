# 🍳 המטבח שלי – אתר מתכונים אישי

אתר מתכונים אישי מלא עם שרת Node.js, שמירה בקובץ JSON, ועיצוב יפה בעברית.

---

## 🚀 הרצה מקומית

### דרישות מוקדמות
- [Node.js](https://nodejs.org/) גרסה 16 ומעלה

### התקנה

```bash
# שכפל את הפרויקט
git clone https://github.com/<YOUR-USERNAME>/recipes-site.git
cd recipes-site

# התקן תלויות
npm install

# הרץ את השרת
npm start
```

פתח את הדפדפן בכתובת: [http://localhost:3000](http://localhost:3000)

### מצב פיתוח (hot-reload)

```bash
npm run dev
```

---

## 📁 מבנה הפרויקט

```
recipes-site/
├── server.js          # שרת Express עם כל ה-API
├── recipes.json       # קובץ שמירת המתכונים
├── package.json
├── render.yaml        # הגדרות פריסה ל-Render.com
├── .gitignore
├── README.md
└── public/
    ├── index.html     # עמוד ראשי
    ├── style.css      # עיצוב
    └── script.js      # לוגיקת צד לקוח
```

---

## 🔌 API Routes

| Method | Route | תיאור |
|--------|-------|-------|
| GET | `/recipes` | קבל את כל המתכונים |
| GET | `/recipes/:id` | קבל מתכון לפי ID |
| POST | `/recipes` | הוסף מתכון חדש |
| PUT | `/recipes/:id` | עדכן מתכון קיים |
| DELETE | `/recipes/:id` | מחק מתכון |

### דוגמת POST /recipes

```json
{
  "title": "פסטה ברוטב עגבניות",
  "description": "פסטה קלה ומהירה",
  "category": "עיקרית",
  "prepTime": "20 דקות",
  "ingredients": ["חבילת פסטה", "2 עגבניות", "מלח"],
  "instructions": ["מבשלים פסטה", "מכינים רוטב", "מערבבים"]
}
```

---

## 🌐 פריסה ל-GitHub + Render (חינם)

### שלב 1 – העלאה ל-GitHub

```bash
# בתיקיית הפרויקט
git init
git add .
git commit -m "first commit: recipes site"

# צור repo חדש ב-GitHub ואז:
git remote add origin https://github.com/<YOUR-USERNAME>/recipes-site.git
git branch -M main
git push -u origin main
```

### שלב 2 – פריסה ב-Render.com (חינם)

1. היכנס ל [render.com](https://render.com) עם חשבון GitHub
2. לחץ **New → Web Service**
3. בחר את ה-repo שלך
4. Render יזהה אוטומטית את `render.yaml`
5. לחץ **Deploy** – תוך 2 דקות האתר עולה!

> ⚠️ **שים לב:** ב-Render חינמי, קובץ `recipes.json` נמחק בכל deploy.
> לשמירה קבועה – ראה [שדרוג למסד נתונים](#-שדרוג-עתידי) למטה.

---

## ✨ פיצ'רים

- ➕ הוספת מתכון חדש דרך טופס נוח
- ✏️ עריכת מתכון קיים
- 🗑 מחיקת מתכון
- 🔍 חיפוש מתכונים בזמן אמת
- 📂 סינון לפי קטגוריה
- 📱 עיצוב רספונסיבי למובייל
- 🌐 ממשק עברי מלא (RTL)

---

## 🔮 שדרוג עתידי

- **מסד נתונים**: החלפת `recipes.json` ב-MongoDB Atlas (חינם)
- **תמונות**: העלאת תמונה לכל מתכון (Cloudinary)
- **חיפוש מתקדם**: לפי מצרכים, זמן הכנה
- **אימות משתמשים**: login עם Google

---

## 🛠 טכנולוגיות

- **Backend:** Node.js + Express
- **Frontend:** HTML5 + CSS3 + Vanilla JavaScript
- **נתונים:** JSON file
- **פונטים:** Rubik + Noto Serif Hebrew (Google Fonts)

# גיא ועץ — אתר תדמית ומערכת ניהול לעסק עבודות עץ

אתר Full-Stack לעסק המתמחה בבניית פרגולות, דקים וגגות רעפים. האתר כולל דף תדמית ציבורי עם גלריית פרויקטים ומחירון דינמי, לצד פאנל ניהול מאובטח למנהל העסק.

**כתובת האתר:** https://woodmaster-project-1.onrender.com

---

## תכולת המערכת

**אתר ציבורי:**
- דף בית עם Hero section וגלריית פרויקטים
- סינון פרויקטים לפי קטגוריה (פרגולות / דקים / גגות)
- מחירון דינמי הנטען ממסד הנתונים
- דף שירותים ודף צור קשר עם טופס פנייה
- עיצוב Responsive תואם מובייל

**פאנל ניהול (Admin):**
- כניסה מאובטחת עם JWT
- ניהול לידים: צפייה, שינוי סטטוס ומחיקה
- ניהול פרויקטים: הוספה, עריכה ומחיקה עם העלאת תמונות
- ניהול מחירון: הוספה, עריכה ומחיקה של פריטים
- התראות בזמן אמת על לידים חדשים דרך Socket.IO

---

## טכנולוגיות

| צד | טכנולוגיה |
|----|-----------|
| **Frontend** | React 19, TypeScript, Tailwind CSS 4, Vite 8 |
| **State Management** | Zustand |
| **Real-time** | Socket.IO Client |
| **Backend** | Node.js 20, Express 5, TypeScript |
| **Database** | MongoDB Atlas + Mongoose |
| **Auth** | JWT (jsonwebtoken) |
| **File Upload** | Multer |
| **Real-time** | Socket.IO |
| **Deployment** | Render |

---

## משתני סביבה

צור קובץ `.env` בתיקיית `server/`:

```env
PORT=8080
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/guy_vaetz
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

---

## הרצה מקומית

### דרישות מקדימות
- Node.js 20+
- חשבון MongoDB Atlas (או MongoDB מקומי)

### 1. התקנת תלויות

```bash
# תלויות Frontend (בתיקיית השורש)
npm install

# תלויות Backend
cd server
npm install
```

### 2. הגדרת משתני סביבה

צור קובץ `server/.env` עם הערכים שלמעלה.

### 3. הרצה

פתח שני טרמינלים:

**טרמינל 1 — Frontend:**
```bash
npm run dev
```
האתר יעלה על: `http://localhost:5173`

**טרמינל 2 — Backend:**
```bash
cd server
npm run dev
```
השרת יעלה על: `http://localhost:8080`

> **שים לב:** בסביבת פיתוח מקומית, ה-Frontend קורא ל-`https://woodmaster-project-1.onrender.com` כברירת מחדל. לבדיקה מלאה מול השרת המקומי, שנה את BACKEND_URL ב-`src/components/AdminDashboard.tsx` ו-`src/components/Contact.tsx` ל-`http://localhost:8080`.

---

## Deploy ל-Render

Build Command:
```
npm run render-build
```

Start Command:
```
node server/dist/index.js
```

משתני סביבה להגדרה ב-Render Dashboard: `MONGO_URI`, `JWT_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`

---

## מבנה הפרויקט

```
woodmaster-project/
├── src/                        # Frontend (React)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── ProjectGallery.tsx
│   │   ├── Contact.tsx
│   │   ├── Pricing.tsx
│   │   ├── Services.tsx
│   │   ├── Testimonials.tsx
│   │   └── AdminDashboard.tsx
│   ├── store/
│   │   └── useLeadStore.ts     # Zustand store ללידים
│   └── App.jsx
├── server/                     # Backend (Node.js)
│   ├── index.ts                # שרת ראשי + כל ה-API routes
│   └── package.json
├── public/                     # קבצים סטטיים
└── package.json
```

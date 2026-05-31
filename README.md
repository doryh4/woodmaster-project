# גיא ועץ - פלטפורמה לניהול ועבודות עץ

מערכת מלאה (Full-Stack) שנבנתה עבור עסק לבניית פרגולות, דקים וגגות רעפים. המערכת כוללת אתר תדמיתי ומחירון דינמי, לצד פאנל ניהול מאובטח המציג לידים בזמן אמת.

הפרויקט כולו מבוסס TypeScript בשני הצדדים (Frontend ו-Backend).

## טכנולוגיות בשימוש
- Frontend: React, TypeScript, Tailwind CSS, Vite, Socket.IO-client
- Backend: Node.js, Express, TypeScript, Mongoose, MongoDB, JWT, Multer, Socket.IO

## הוראות הרצה מקומיות

### 1. הגדרת השרת (Backend)
- היכנס לתיקיית backend בטרמינל: cd backend
- התקן תלויות: npm install
- ודא שקיים קובץ .env עם המשתנים: PORT, MONGO_URI, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
- הרץ את השרת: npm run dev

### 2. הגדרת האתר (Frontend)
- פתח טרמינל חדש בתיקיית השורש הראשית
- התקן תלויות: npm install
- הרץ את האתר: npm run dev
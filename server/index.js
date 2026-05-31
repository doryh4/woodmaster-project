const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer'); 
const path = require('path');     
const bcrypt = require('bcryptjs'); // חדש! להצפנת בדיקת סיסמאות
const jwt = require('jsonwebtoken'); // חדש! ליצירת מפתחות אבטחה
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); 

// חשיפת תיקיית ה-uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// פונקציית Seeding להזנת המחירון הקיים במידה והוא ריק
const seedPricingData = async () => {
  try {
    const count = await Price.countDocuments();
    if (count === 0) {
      const initialPrices = [
        { serviceName: "פרגולת עץ אורן", category: "פרגולות", priceRange: "450 - 650", unit: 'מ"ר' },
        { serviceName: "פרגולת עץ גושני", category: "פרגולות", priceRange: "800 - 1,200", unit: 'מ"ר' },
        { serviceName: "דק איפאה", category: "דקים", priceRange: "700 - 950", unit: 'מ"ר' },
        { serviceName: "דק סינתטי", category: "דקים", priceRange: "550 - 750", unit: 'מ"ר' },
        { serviceName: "חידוש דק/פרגולה", category: "דקים", priceRange: "80 - 150", unit: 'מ"ר' }
      ];
      await Price.insertMany(initialPrices);
      console.log('🌱 המחירון הקיים סונכרן בהצלחה לתוך בסיס הנתונים!');
    }
  } catch (err) {
    console.error('❌ שגיאה בסנכרון המחירון הראשוני:', err);
  }
};

// חיבור ל-MongoDB והפעלת ה-Seeding
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB: guy_vaetz');
    await seedPricingData(); // מריץ את הבדיקה וההזנה האוטומטית
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// --- הגדרת מודלים ---
const projectSchema = new mongoose.Schema({
  title: String, category: String, location: String, imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

const leadSchema = new mongoose.Schema({
  customerName: String, phone: String, jobType: String, notes: String,
  status: { type: String, default: 'חדש' }, createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model('Lead', leadSchema);

// מודל עבור המחירון ב-MongoDB
const priceSchema = new mongoose.Schema({
  serviceName: String,
  category: String,
  priceRange: String,
  unit: { type: String, default: 'מ"ר' },
  createdAt: { type: Date, default: Date.now }
});
const Price = mongoose.model('Price', priceSchema);

// --- הגדרת Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });


// --- מידלוור אבטחה: בדיקת טוקן ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // לוקח את הטוקן מתוך "Bearer TOKEN"

  if (!token) return res.status(401).json({ message: 'גישה נדחתה: אין מפתח אבטחה' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'מפתח אבטחה פג תוקף או שגוי' });
    req.user = user;
    next(); // הכל תקין, המשך לפעולה המבוקשת
  });
};


// --- נתיבי API ציבוריים (פתוחים לכולם) ---

// 1. קבלת כל הפרויקטים לגלריה באתר הראשי
app.get('/api/projects', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 2. שמירת ליד חדש מטופס צור קשר באתר הראשי
app.post('/api/contact', async (req, res) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    res.status(201).json({ message: 'הפנייה התקבלה בהצלחה!' });
  } catch (err) { res.status(400).json({ message: 'שגיאה בשליחת הטופס' }); }
});

// קבלת כל פריטי המחירון (ציבורי - משמש גם את האתר וגם את פאנל הניהול)
app.get('/api/prices', async (req, res) => {
  try {
    const prices = await Price.find().sort({ createdAt: -1 });
    res.json(prices);
  } catch (err) { res.status(500).json({ message: err.message }); }
});


// --- נתיב התחברות (Login Route) ---
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  // בדיקה מול נתוני ה-env שלך
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }

  // יצירת טוקן מאובטח שתקף ל-24 שעות
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});


// --- נתיבי ניהול מוגנים ---

// 3. העלאת תמונת פרויקט (מוגן)
app.post('/api/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'לא נבחר קובץ' });
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// 4. קבלת כל הלידים (מוגן)
app.get('/api/admin/leads', authenticateToken, async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// 5. עדכון סטטוס של ליד (מוגן)
app.patch('/api/admin/leads/:id', authenticateToken, async (req, res) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updatedLead);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון' }); }
});

// 6. מחיקת ליד (מוגן)
app.delete('/api/admin/leads/:id', authenticateToken, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'הליד נמחק' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקה' }); }
});

// 7. הוספת פרויקט חדש (מוגן)
app.post('/api/admin/projects', authenticateToken, async (req, res) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(400).json({ message: 'שגיאה בהוספה' }); }
});

// 8. מחיקת פרויקט (מוגן)
app.delete('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'הפרויקט נמחק' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקה' }); }
});

// 9. עדכון פרויקט קיים (מוגן)
app.put('/api/admin/projects/:id', authenticateToken, async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון' }); }
});


// --- נתיבי ניהול מחירון מוגנים ---

// 10. הוספת פריט מחירון חדש (מוגן)
app.post('/api/admin/prices', authenticateToken, async (req, res) => {
  try {
    const newPrice = new Price(req.body);
    await newPrice.save();
    res.status(201).json(newPrice);
  } catch (err) { res.status(400).json({ message: 'שגיאה בהוספת פריט למחירון' }); }
});

// 11. עדכון פריט מחירון קיים (מוגן)
app.put('/api/admin/prices/:id', authenticateToken, async (req, res) => {
  try {
    const updatedPrice = await Price.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPrice);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון המחירון' }); }
});

// 12. מחיקת פריט מחירון (מוגן)
app.delete('/api/admin/prices/:id', authenticateToken, async (req, res) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ message: 'הפריט נמחק מהמחירון' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקת הפריט' }); }
});


// הפעלת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
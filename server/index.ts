import express, { Request, Response, NextFunction } from 'express';
import mongoose, { Document } from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';
import { Server, Socket } from 'socket.io';

dotenv.config();

const app = express();

// יצירת שרת HTTP מעל Express
const server = http.createServer(app);

// הגדרת שרת Socket.IO עם הרשאות CORS מתאימות ל-React
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"], // הכתובות של ה-React שלך
    methods: ["GET", "POST"]
  }
});

// מאזין לחיבורי קליינטים
io.on('connection', (socket: Socket) => {
  console.log(`🔌 משתמש מחובר ל-Websocket: ${socket.id}`);
  
  socket.on('disconnect', () => {
    console.log('❌ משתמש התנתק מה-Websocket');
  });
});

// Middlewares
app.use(cors());
app.use(express.json());

// חשיפת תיקיית ה-uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- הגדרת Interfaces (טיפוסים) למודלים של Mongo ---
interface IProject extends Document {
  title: string;
  category: string;
  location: string;
  imageUrl: string;
  createdAt: Date;
}

interface ILead extends Document {
  customerName: string;
  phone: string;
  jobType: string;
  notes: string;
  status: string;
  createdAt: Date;
}

interface IPrice extends Document {
  serviceName: string;
  category: string;
  priceRange: string;
  unit: string;
  createdAt: Date;
}

// --- הגדרת מודלים ---
const projectSchema = new mongoose.Schema<IProject>({
  title: String, category: String, location: String, imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model<IProject>('Project', projectSchema);

const leadSchema = new mongoose.Schema<ILead>({
  customerName: String, phone: String, jobType: String, notes: String,
  status: { type: String, default: 'חדש' }, createdAt: { type: Date, default: Date.now }
});
const Lead = mongoose.model<ILead>('Lead', leadSchema);

const priceSchema = new mongoose.Schema<IPrice>({
  serviceName: String,
  category: String,
  priceRange: String,
  unit: { type: String, default: 'מ"ר' },
  createdAt: { type: Date, default: Date.now }
});
const Price = mongoose.model<IPrice>('Price', priceSchema);

// פונקציית Seeding להזנת המחירון הקיים במידה והוא ריק
const seedPricingData = async (): Promise<void> => {
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
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
      console.log('✅ Connected to MongoDB: guy_vaetz');
      await seedPricingData();
    })
    .catch(err => console.error('❌ MongoDB connection error:', err));
} else {
  console.error('❌ שגיאה: MONGO_URI אינו מוגדר בקובץ ה-.env');
}

// --- הגדרת Multer ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- הרחבת הטיפוס של בקשת Express כדי שתתמוך ב-req.user המותאם שלך ---
interface AuthenticatedRequest extends Request {
  user?: any;
}

// --- מידלוור אבטחה: בדיקת טוקן ---
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'גישה נדחתה: אין מפתח אבטחה' });

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'שגיאת שרת: מפתח השרת חסר' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'מפתח אבטחה פג תוקף או שגוי' });
    req.user = user;
    next();
  });
};

// --- נתיבי API ציבוריים ---

app.get('/api/projects', async (req: Request, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.post('/api/contact', async (req: Request, res: Response) => {
  try {
    const newLead = new Lead(req.body);
    await newLead.save();
    
    // עדכון חם בזמן אמת לפאנל הניהול
    io.emit('newLead', newLead);
    
    res.status(201).json({ message: 'הפנייה התקבלה בהצלחה!' });
  } catch (err) { res.status(400).json({ message: 'שגיאה בשליחת הטופס' }); }
});

app.get('/api/prices', async (req: Request, res: Response) => {
  try {
    const prices = await Price.find().sort({ createdAt: -1 });
    res.json(prices);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

// --- נתיב התחברות (Login Route) ---
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'שם משתמש או סיסמה שגויים' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ message: 'שגיאת שרת פנימית' });
  }
  const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

// --- נתיבי ניהול מוגנים ---
app.post('/api/admin/upload', authenticateToken, upload.single('image'), (req: AuthenticatedRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'לא נבחר קובץ' });
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

app.get('/api/admin/leads', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (err: any) { res.status(500).json({ message: err.message }); }
});

app.patch('/api/admin/leads/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(updatedLead);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון' }); }
});

app.delete('/api/admin/leads/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'הליד נמחק' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקה' }); }
});

app.post('/api/admin/projects', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newProject = new Project(req.body);
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(400).json({ message: 'שגיאה בהוספה' }); }
});

app.delete('/api/admin/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'הפרויקט נמחק' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקה' }); }
});

app.put('/api/admin/projects/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון' }); }
});

// --- נתיבי ניהול מחירון מוגנים ---
app.post('/api/admin/prices', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const newPrice = new Price(req.body);
    await newPrice.save();
    res.status(201).json(newPrice);
  } catch (err) { res.status(400).json({ message: 'שגיאה בהוספת פריט למחירון' }); }
});

app.put('/api/admin/prices/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedPrice = await Price.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedPrice);
  } catch (err) { res.status(400).json({ message: 'שגיאה בעדכון המחירון' }); }
});

app.delete('/api/admin/prices/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    await Price.findByIdAndDelete(req.params.id);
    res.json({ message: 'הפריט נמחק מהמחירון' });
  } catch (err) { res.status(500).json({ message: 'שגיאה במחיקת הפריט' }); }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
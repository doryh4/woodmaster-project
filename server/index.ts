import path from 'path';
import fs from 'fs';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import multer from 'multer';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/guy_vaetz';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) => console.error('MongoDB connection failed:', err.message));

const projectSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  jobType: String,
  notes: String,
  status: { type: String, default: 'חדש' },
  createdAt: { type: Date, default: Date.now }
});

const priceSchema = new mongoose.Schema({
  serviceName: { type: String, required: true },
  category: String,
  priceRange: String,
  unit: { type: String, default: 'מ"ר' }
});

const Project = mongoose.model('Project', projectSchema);
const Lead = mongoose.model('Lead', leadSchema);
const PriceItem = mongoose.model('PriceItem', priceSchema);

const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

const authMiddleware = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}${path.extname(file.originalname)}`)
  })
});

app.get('/api/projects', async (_req: any, res: any) => {
  try {
    res.json(await Project.find({}));
  } catch {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

app.get('/api/prices', async (_req: any, res: any) => {
  try {
    res.json(await PriceItem.find({}));
  } catch {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.post('/api/contact', async (req: any, res: any) => {
  try {
    const lead = new Lead({ ...req.body, status: 'חדש' });
    await lead.save();
    io.emit('newLead', lead.toObject());
    res.json({ success: true, lead });
  } catch {
    res.status(500).json({ error: 'Failed to save contact' });
  }
});

app.post('/api/admin/login', (req: any, res: any) => {
  const { username, password } = req.body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'פרטי התחברות שגויים' });
  }
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
});

app.get('/api/admin/leads', authMiddleware, async (_req: any, res: any) => {
  try {
    res.json(await Lead.find({}).sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

app.patch('/api/admin/leads/:id', authMiddleware, async (req: any, res: any) => {
  try {
    res.json(await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

app.delete('/api/admin/leads/:id', authMiddleware, async (req: any, res: any) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete lead' });
  }
});

app.post('/api/admin/projects', authMiddleware, async (req: any, res: any) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.json(project);
  } catch {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

app.put('/api/admin/projects/:id', authMiddleware, async (req: any, res: any) => {
  try {
    res.json(await Project.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/admin/projects/:id', authMiddleware, async (req: any, res: any) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

app.post('/api/admin/upload', authMiddleware, upload.single('image'), (req: any, res: any) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

app.get('/api/admin/prices', authMiddleware, async (_req: any, res: any) => {
  try {
    res.json(await PriceItem.find({}));
  } catch {
    res.status(500).json({ error: 'Failed to fetch prices' });
  }
});

app.post('/api/admin/prices', authMiddleware, async (req: any, res: any) => {
  try {
    const price = new PriceItem(req.body);
    await price.save();
    res.json(price);
  } catch {
    res.status(500).json({ error: 'Failed to create price item' });
  }
});

app.put('/api/admin/prices/:id', authMiddleware, async (req: any, res: any) => {
  try {
    res.json(await PriceItem.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch {
    res.status(500).json({ error: 'Failed to update price item' });
  }
});

app.delete('/api/admin/prices/:id', authMiddleware, async (req: any, res: any) => {
  try {
    await PriceItem.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete price item' });
  }
});

app.get('/api/seed-now', async (_req: any, res: any) => {
  try {
    const sampleProjects = [
      { title: 'פרגולת גפנים מעץ דאגלס מוברש', category: 'פרגולות', location: 'זכרון יעקב', imageUrl: '/project1.jpg' },
      { title: 'דק איפאה יוקרתי', category: 'דקים', location: 'ירושלים', imageUrl: '/project2.jpg' },
      { title: 'דק כניסה לחצר', category: 'דקים', location: 'בנימינה', imageUrl: '/project3.jpg' },
      { title: 'פרגולה לחצר', category: 'פרגולות', location: 'אבן ספיר', imageUrl: '/project4.jpg' },
      { title: 'פרגולה בשילוב רעפים', category: 'פרגולות', location: 'נווה אילן', imageUrl: '/project5.jpg' },
      { title: 'גג רעפים חדש', category: 'גגות', location: 'בנימינה', imageUrl: '/project6.jpg' }
    ];
    await Project.deleteMany({});
    await Project.insertMany(sampleProjects);
    res.send('Database seeded successfully');
  } catch {
    res.status(500).send('Error seeding data');
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/{*path}', (_req: any, res: any) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const portValue = Number(process.env.PORT) || 8080;
server.listen(portValue, '0.0.0.0', () => {
  console.log(`Server running on port ${portValue}`);
});

process.on('SIGTERM', () => {
  server.close(() => mongoose.connection.close().then(() => process.exit(0)));
});

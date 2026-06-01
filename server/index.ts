import 'crypto';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// --- חיבור יחיד ותקין ל-MongoDB ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/guy_vaetz';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ Connection failed:', err));

// --- הגדרת המודל (חייב להופיע כאן כדי שהשרת יכיר את מבנה הפרויקט) ---
const projectSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// --- Socket.IO ---
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// --- Routes ---
app.get('/', (req : any, res : any) => {
  res.send('Woodmaster Server is UP and Running!');
});

// הנתיב שמושך נתונים אמיתיים ממסד הנתונים
app.get('/api/projects', async (req : any, res : any) => {
  try {
    const projects = await Project.find({}); 
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// --- הרצה ---
const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => {
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});
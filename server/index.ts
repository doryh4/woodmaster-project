import 'crypto';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- חיבור ל-MongoDB (נפרד מהשרת) ---
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB error:', err));
}

mongoose.connect(process.env.MONGO_URI || '')
  .then(() => console.log('✅ Connected to MongoDB successfully!'))
  .catch((err) => console.error('❌ Connection failed:', err)); // זה יכתוב לנו את השגיאה!

// --- הגדרת Socket.IO ויתר ה-API שלך ---
const io = new Server(server, { cors: { origin: "*", methods: ["GET", "POST"] } });

// [כאן יבואו כל ה-app.get/post שלך...]
// חשוב: לא לשנות שום לוגיקה פה, רק להעתיק את ה-routes שלך

// --- התיקון הקריטי להרצה ב-Railway ---
const PORT = Number(process.env.PORT) || 8080;

// שימוש ב-listen שמחכה לחיבור בצורה יציבה
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

// טיפול בכיבוי יזום כדי שלא נקבל SIGTERM
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    // התיקון: הסרנו את ה-'false'
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});
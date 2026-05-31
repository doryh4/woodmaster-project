const mongoose = require('mongoose');
require('dotenv').config();

// חיבור למסד הנתונים
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/guy_vaetz')
  .then(() => console.log('Connected to MongoDB for seeding...'))
  .catch(err => console.error('Connection error:', err));

// הגדרת המבנה (חייב להתאים ל-index.js)
const projectSchema = new mongoose.Schema({
  title: String,
  category: String,
  location: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

// רשימת הפרויקטים המעודכנת שלך
const realProjects = [
  { 
    title: "פרגולת גפנים מעץ דאגלס מוברש", 
    category: "פרגולות", 
    location: "זכרון יעקב",
    imageUrl: "/project1.jpg"
  },
  { 
    title: "דק איפאה יוקרתי", 
    category: "דקים", 
    location: "ירושלים",
    imageUrl: "/project2.jpg" 
  },
  { 
    title: "דק כניסה לחצר", 
    category: "דקים", 
    location: "בנימינה",
    imageUrl: "/project3.jpg" 
  },
  { 
    title: "פרגולה לחצר", 
    category: "פרגולות", 
    location: "אבן ספיר",
    imageUrl: "/project4.jpg"
  },
  { 
    title: "פרגולה בשילוב רעפים", 
    category: "פרגולות", 
    location: "נווה אילן",
    imageUrl: "/project5.jpg" 
  },
  { 
    title: "גג רעפים חדש", 
    category: "גגות", 
    location: "בנימינה",
    imageUrl: "/project6.jpg" 
  }
];

// פונקציה שמנקה את מה שיש ומכניסה את המידע החדש
const seedDB = async () => {
  try {
    await Project.deleteMany({}); // מוחק שאריות אם היו
    await Project.insertMany(realProjects);
    console.log('✅ All 6 projects have been successfully inserted into MongoDB!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close(); // סגירת החיבור בסיום
  }
};

seedDB();
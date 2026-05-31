import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProjectGallery from './components/ProjectGallery';
import Contact from './components/Contact';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import Services from './components/Services';
import AdminDashboard from './components/AdminDashboard'; // פאנל הניהול החדש

// רכיב דף הבית שמרכז את התצוגה הראשית
const Home = () => (
  <>
    <section className="relative min-h-[70vh] flex items-center justify-center bg-stone-800 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/hero-bg.png" alt="רקע עבודות עץ" className="w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-stone-900/80 via-stone-900/40 to-stone-900"></div>
      </div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-[1.1]">
          בנייה בעץ <span className="text-orange-500">ברמה אחרת</span>
        </h2>
        <p className="text-xl md:text-2xl text-stone-200 max-w-3xl mx-auto mb-12">
          מומחים בתכנון והקמת פרגולות, דקים ועבודות עץ בהתאמה אישית.
        </p>
        <div className="flex flex-col sm:flex-row gap-5 justify-center">
          <a href="#gallery-preview" className="bg-orange-600 hover:bg-orange-700 text-white px-12 py-4 rounded-full font-bold text-lg transition-all">
            צפו בעבודות שלנו
          </a>
        </div>
      </div>
    </section>
    
    <div id="gallery-preview">
      <ProjectGallery />
    </div>
    <Testimonials />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50 font-sans text-right" dir="rtl">
        <Navbar />

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* הניתוב החדש לפאנל הניהול */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        <footer className="bg-stone-900 text-stone-500 py-12 border-t border-stone-800 text-center">
  <div className="container mx-auto px-4">
    <img src="/logo.jpg" alt="Logo" className="h-16 mx-auto mb-6 opacity-80 rounded" />
    <p className="text-sm italic text-stone-400">גיא ועץ - אומנות הבנייה והעיצוב בעץ</p>
    <div className="w-24 h-px bg-stone-700 mx-auto my-6"></div>
    
    {/* קונטיינר גמיש שמסדר את זכויות היוצרים והקישור אחד מתחת לשני עם מרווח יפה */}
    <div className="flex flex-col items-center gap-2">
      <p className="text-xs">© 2026 כל הזכויות שמורות</p>
      
      {/* כפתור כניסת מנהל דיסקרטי */}
      <a 
        href="/admin" 
        className="text-[10px] text-stone-600 hover:text-stone-300 transition-colors duration-200 mt-1 flex items-center gap-1 font-medium select-none"
        title="כניסה למערכת ניהול גיא ועץ"
      >
        ⚙️ כניסת מנהל
      </a>
    </div>
  </div>
</footer>

        {/* טלפון צף לנייד */}
        <a href="tel:0500000000" className="fixed bottom-6 left-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-2xl md:hidden animate-bounce">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 005.47 5.47l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
        </a>
      </div>
    </Router>
  );
}

export default App;
import React, { useState, useEffect } from 'react';

// 1. הגדרת המבנה של פרויקט שמגיע מה-DB
interface Project {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  location: string;
}

function ProjectGallery(): React.JSX.Element {
  const [filter, setFilter] = useState<string>('הכל');
  
  // 2. תמונה שנבחרה יכולה להיות string (נתיב התמונה) או null כששום תמונה לא פתוחה
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 3. ה-State של הפרויקטים מוגדר כמערך של פרויקטים
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // משיכת הנתונים מה-Backend בזמן טעינת המסך
  useEffect(() => {
    fetch('http://localhost:5000/api/projects')
      .then((res) => res.json())
      .then((data: Project[]) => {
        setProjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        setLoading(false);
      });
  }, []);

  const filteredProjects = filter === 'הכל' 
    ? projects 
    : projects.filter((p) => p.category === filter);

  const categories: string[] = ['הכל', 'פרגולות', 'דקים', 'גגות'];

  if (loading) {
    return (
      <div className="text-center py-20 text-stone-600 font-bold" dir="rtl">
        טוען פרויקטים מהמסד נתונים...
      </div>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h3 className="text-4xl font-extrabold text-stone-900 mb-6">הפרויקטים שלנו</h3>
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full font-bold transition-all ${
                  filter === cat 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 text-right" dir="rtl">
          {filteredProjects.map((project) => (
            <div 
              key={project._id}
              className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border border-stone-200"
              onClick={() => setSelectedImage(project.imageUrl)}
            >
              <div className="h-64 overflow-hidden relative">
                <img src={project.imageUrl} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white border-2 border-white px-4 py-2 rounded-lg font-bold">הגדל תמונה</span>
                </div>
              </div>
              <div className="p-5">
                <span className="text-orange-600 text-xs font-black uppercase">{project.category}</span>
                <h4 className="text-xl font-bold text-stone-900 mt-1">{project.title}</h4>
                <p className="text-stone-500 text-sm">{project.location}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <p className="text-center text-stone-500 mt-10" dir="rtl">בקרוב יעלו פרויקטים נוספים בקטגוריה זו.</p>
        )}

        {/* מנגנון ה-Lightbox */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-white text-4xl font-light">&times;</button>
            <img src={selectedImage} className="max-w-full max-h-[90vh] rounded shadow-2xl" alt="מבט מוגדל" />
          </div>
        )}
      </div>
    </section>
  );
}

export default ProjectGallery;
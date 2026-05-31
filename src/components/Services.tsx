import React from 'react';

// 1. הגדרת המבנה של שירות בודד
interface ServiceItem {
  title: string;
  types: string[]; // מערך של מחרוזות טקסט
  description: string;
}

// 2. הוצאת המערך מחוץ לקומפוננטה והגדרת הטיפוס שלו כמערך של ServiceItem
const SERVICES_DATA: ServiceItem[] = [
  {
    title: "פרגולות",
    types: ["פרגולות תלויות", "פרגולות על עמודים", "הצללות רפפה"],
    description: "תכנון והקמה של פרגולות מעץ אורן, גושני או רב-שכבתי עמיד למזג האוויר הישראלי."
  },
  {
    title: "דקים",
    types: ["דק איפאה", "דק אורן", "דק סינתטי"],
    description: "התקנת דקים ברמת גימור מושלמת, כולל תשתית נסתרת וטיפול מונע נזקי שמש."
  },
  {
    title: "גגות רעפים",
    types: ["הקמת גגות חדשים", "חידוש והחלפת רעפים", "בידוד גגות"],
    description: "מומחיות בבניית קונסטרוקציות גגות ואיטום מלא למניעת נזילות, תוך שימוש בחומרים האיכותיים ביותר."
  }
];

function Services(): React.JSX.Element {
  return (
    <div className="pt-24 pb-20 bg-white min-h-screen text-right" dir="rtl">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-stone-900 mb-16">סוגי העבודות שלנו</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {SERVICES_DATA.map((service, index) => (
            <div key={index} className="p-8 border-r-4 border-orange-600 bg-stone-50 rounded-l-2xl shadow-sm flex flex-col h-full">
              <h3 className="text-3xl font-black text-stone-800 mb-4">{service.title}</h3>
              <p className="text-stone-600 text-lg mb-6 leading-relaxed flex-grow">{service.description}</p>
              <ul className="space-y-3">
                {service.types.map((type, tIdx) => (
                  <li key={tIdx} className="flex items-center gap-2 font-bold text-stone-700">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    {type}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services;
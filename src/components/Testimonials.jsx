import React from 'react';

function Testimonials() {
  const reviews = [
    {
      id: 1,
      name: "יוסי כהן",
      project: "פרגולת עץ בגינה",
      text: "עבודה מקצועית ביותר! הצוות הגיע בזמן, סיים את העבודה צ'יק צ'ק והשאיר את הגינה נקייה. הפרגולה נראית מדהים.",
      stars: 5
    },
    {
      id: 2,
      name: "מיכל לוי",
      project: "דק איפאה מסביב לבריכה",
      text: "היושרה והדיוק של גיא ועץ פשוט מרשימים. הכל בוצע בדיוק לפי התוכנית והמחיר היה הוגן מאוד.",
      stars: 5
    },
    {
      id: 3,
      name: "אבי גבאי",
      project: "חידוש גג רעפים",
      text: "אחרי שנים של נזילות, סוף סוף יש לנו שקט. מקצוענים אמיתיים שמבינים עניין. ממליץ בחום!",
      stars: 5
    }
  ];

  return (
    <section className="py-20 bg-stone-100">
      <div className="container mx-auto px-4">
        <h3 className="text-3xl md:text-4xl font-bold text-center mb-16 text-stone-800">לקוחות ממליצים</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-between">
              <div>
                <div className="flex text-orange-400 mb-4">
                  {[...Array(review.stars)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-stone-600 italic mb-6 leading-relaxed">"{review.text}"</p>
              </div>
              <div>
                <h4 className="font-bold text-stone-900">{review.name}</h4>
                <p className="text-orange-600 text-sm">{review.project}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
import React, { useState, useEffect } from 'react';

// 1. הגדרת הטיפוס של פריט במחירון כפי שהוא מגיע מה-DB
interface PriceItem {
  _id: string;
  serviceName: string;
  priceRange: string;
  unit?: string; // סימן השאלה אומר שהשדה אופציונלי (יכול להיות undefined)
}

function Pricing(): React.JSX.Element {
  // 2. הגדרת הטיפוס של ה-State כמערך של PriceItem
  const [priceList, setPriceList] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // משיכת המחירון המעודכן מה-Backend בזמן טעינת המסך
  useEffect(() => {
    fetch('https://woodmaster-project.onrender.com/api/prices')
      .then((res) => res.json())
      .then((data: PriceItem[]) => {
        setPriceList(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching prices:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pt-24 pb-20 bg-stone-50 min-h-screen">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-4xl font-bold text-center text-stone-900 mb-4">מחירון עבודות עץ</h2>
        <p className="text-center text-stone-600 mb-12">המחירים הם הערכה בלבד ומשתנים בהתאם למורכבות העבודה ותנאי השטח.</p>
        
        {loading ? (
          <div className="text-center py-10 text-stone-600 font-bold" dir="rtl">
            טוען מחירון מעודכן...
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-200">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-stone-800 text-white">
                  <th className="p-5">סוג העבודה</th>
                  <th className="p-5">טווח מחיר</th>
                  <th className="p-5 text-center">יחידה</th>
                </tr>
              </thead>
              <tbody>
                {priceList.map((row) => (
                  <tr key={row._id} className="border-b border-stone-100 hover:bg-orange-50 transition">
                    <td className="p-5 font-bold text-stone-800">{row.serviceName}</td>
                    <td className="p-5 text-orange-600 font-semibold">{row.priceRange} ש"ח</td>
                    <td className="p-5 text-center text-stone-500">{row.unit || 'למ"ר'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {priceList.length === 0 && (
              <p className="text-center text-stone-500 py-8">אין פריטים במחירון כרגע.</p>
            )}
          </div>
        )}
        
        <div className="mt-10 p-6 bg-orange-100 rounded-xl text-orange-800 text-sm">
          * המחירים כוללים חומרים ועבודה אלא אם צוין אחרת. המחיר הסופי ייקבע לאחר פגישת ייעוץ.
        </div>
      </div>
    </div>
  );
}

export default Pricing;
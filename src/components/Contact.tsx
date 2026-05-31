import React, { useState, FormEvent, ChangeEvent } from 'react';
// ייבוא ספריית הלקוח של Socket.IO
import { io } from 'socket.io-client';

// הגדרת כתובת השרת
const BACKEND_URL = 'http://localhost:5000';

// דרישה 1: הגדרת Interface עבור נתוני הטופס ב-TypeScript
interface ContactFormData {
  customerName: string;
  phone: string;
  jobType: string;
  notes: string;
}

function Contact() {
  // הגדרת הסטייט עם הטיפוס ה-TypeScript המתאים
  const [formData, setFormData] = useState<ContactFormData>({
    customerName: '',
    phone: '',
    jobType: 'פרגולה',
    notes: ''
  });
  
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // דרישה 1: הגדרת טיפוס לאירוע ה-Submit של הטופס (FormEvent)
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      // 1. שליחת הנתונים ל-API של ה-Backend לשמירה במסד הנתונים
      const response = await fetch(`${BACKEND_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('✅ הפנייה התקבלה בהצלחה! נחזור אליך בהקדם.');

        // דרישה 2: חיבור בזמן אמת - שליחת הודעה ל-Socket.IO כדי שהמנהל יראה את הליד מיד!
        // אנחנו מעבירים את הנתונים שהשרת החזיר (כולל ה-ID והתאריך שנוצרו ב-DB)
        const socket = io(BACKEND_URL);
        socket.emit('newLeadSubmitted', data.lead || formData);
        
        // ניתוק שקט של ה-socket לאחר השליחה
        setTimeout(() => socket.disconnect(), 1000);

        // איפוס הטופס
        setFormData({ customerName: '', phone: '', jobType: 'פרגולה', notes: '' });
      } else {
        setStatusMessage('❌ שגיאה בשליחת הטופס. אנא נסה שוב.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setStatusMessage('❌ שגיאה בתקשורת עם השרת. אנא ודא שהשרת רץ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // דרישה 1: פונקציית עזר קטנה כדי לטפל בשינויים בקלט בצורה נקייה ב-TS
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-2xl text-right" dir="rtl">
        <h2 className="text-4xl font-bold text-center text-stone-900 mb-4">דברו איתנו</h2>
        <p className="text-center text-stone-600 mb-12">השאירו פרטים ונתחיל לתכנן את הפרויקט הבא שלכם.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6 bg-stone-50 p-8 rounded-2xl shadow-sm border border-stone-200">
          {statusMessage && (
            <div className={`p-4 rounded-lg font-bold text-center ${statusMessage.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {statusMessage}
            </div>
          )}

          <div>
            <label className="block text-stone-700 font-bold mb-2">שם מלא *</label>
            <input 
              type="text" 
              name="customerName"
              required
              value={formData.customerName}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">טלפון *</label>
            <input 
              type="tel" 
              name="phone"
              required
              value={formData.phone}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={handleInputChange}
            />
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">סוג העבודה המבוקשת</label>
            <select 
              name="jobType"
              value={formData.jobType}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              onChange={handleInputChange}
            >
              <option value="פרגולה">פרגולה</option>
              <option value="דק">דק</option>
              <option value="גג רעפים">גג רעפים</option>
              <option value="אחר">אחר</option>
            </select>
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">הערות נוספות</label>
            <textarea 
              name="notes"
              rows={4}
              value={formData.notes}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={handleInputChange}
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 rounded-lg transition shadow-lg text-xl disabled:bg-stone-400"
          >
            {isSubmitting ? 'שולח...' : 'שלח הצעה'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;
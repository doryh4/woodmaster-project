import React, { useState } from 'react';

function Contact() {
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    jobType: 'פרגולה',
    notes: ''
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage('');

    try {
      // שליחת הנתונים ל-API של ה-Backend שהקמנו
      const response = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('✅ הפנייה התקבלה בהצלחה! נחזור אליך בהקדם.');
        // איפוס הטופס לאחר שליחה מוצלחת
        setFormData({ customerName: '', phone: '', jobType: 'פרגולה', notes: '' });
        e.target.reset();
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
              required
              value={formData.customerName}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => setFormData({...formData, customerName: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">טלפון *</label>
            <input 
              type="tel" 
              required
              value={formData.phone}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">סוג העבודה המבוקשת</label>
            <select 
              value={formData.jobType}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white"
              onChange={(e) => setFormData({...formData, jobType: e.target.value})}
            >
              <option>פרגולה</option>
              <option>דק</option>
              <option>גג רעפים</option>
              <option>אחר</option>
            </select>
          </div>
          
          <div>
            <label className="block text-stone-700 font-bold mb-2">הערות נוספות</label>
            <textarea 
              rows="4"
              value={formData.notes}
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
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
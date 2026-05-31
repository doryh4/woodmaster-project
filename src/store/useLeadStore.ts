import { create } from 'zustand';

// 1. הגדרת המבנה (Interface) של ליד בודד במערכת
export interface Lead {
  _id?: string;          // מזהה ייחודי (אופציונלי, יגיע מה-MongoDB)
  customerName: string;  // שם הלקוח
  phone: string;         // מספר טלפון
  jobType: string;       // סוג העבודה (פרגולה, דק וכו')
  notes?: string;        // הערות נוספות (אופציונלי)
  status?: string;       // סטטוס הליד (למשל: 'חדש', 'טופל') - אופציונלי
  createdAt?: string;    // תאריך יצירה - אופציונלי
}

// 2. הגדרת הטיפוס (Interface) של החנות והפעולות שלה
interface LeadStoreState {
  leads: Lead[];                        // מערך של לידים
  setLeads: (leads: Lead[]) => void;    // פונקציה שמקבלת מערך לידים ולא מחזירה דבר
  addLead: (newLead: Lead) => void;     // פונקציה שמקבלת ליד בודד ולא מחזירה דבר
}

// 3. יצירת החנות עם הטיפוס שהגדרנו עבור Zustand
const useLeadStore = create<LeadStoreState>((set) => ({
  // המצב הגלובלי - רשימת הלידים ההתחלתית היא ריקה ומיושרת לטיפוס Lead
  leads: [],

  // עדכון כל הרשימה (למשל אחרי שליפה מה-API במנהל)
  setLeads: (leads) => set({ leads }),

  // הוספת ליד חדש בודד לראש הרשימה בזמן אמת (מתאים ל-Socket.io)
  addLead: (newLead) => set((state) => ({ 
    leads: [newLead, ...state.leads] 
  })),
}));

export default useLeadStore;
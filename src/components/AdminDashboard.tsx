import React, { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
// 1. ייבוא ספריית הלקוח של Socket.IO
import { io, Socket } from 'socket.io-client';
// ייבוא החנות הגלובלית של Zustand והטיפוס של ליד בודד
import useLeadStore, { Lead } from '../store/useLeadStore';

// הגדרת כתובת השרת הבסיסית כדי שהתמונות ייטענו ממנו כראוי
const BACKEND_URL = 'https://woodmaster-project.onrender.com/';

// הגדרת Interfaces עבור הישויות האחרות בקובץ
interface Project {
  _id: string;
  title: string;
  category: string;
  location: string;
  imageUrl: string;
}

interface NewProjectState {
  title: string;
  category: string;
  location: string;
  imageUrl: string;
}

interface PriceItem {
  _id: string;
  serviceName: string;
  category: string;
  priceRange: string;
  unit: string;
}

interface NewPriceState {
  serviceName: string;
  category: string;
  priceRange: string;
  unit: string;
}

function AdminDashboard() {
  // סטייט לשמירת טוקן האבטחה
  const [token, setToken] = useState<string | null>(localStorage.getItem('adminToken') || null);
  
  // שדות עבור מסך ההתחברות
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>('');

  // ניווט
  const [activeTab, setActiveTab] = useState<string>('leads'); 
  
  // צריכת הנתונים והפונקציות מהמצב הגלובלי של Zustand
  const leads = useLeadStore((state) => state.leads);
  const setGlobalLeads = useLeadStore((state) => state.setLeads);
  const addGlobalLead = useLeadStore((state) => state.addLead);

  const [projects, setProjects] = useState<Project[]>([]); 
  const [prices, setPrices] = useState<PriceItem[]>([]); // סטייט עבור פריטי המחירון
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // סטייט לעריכת פרויקטים
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [newProject, setNewProject] = useState<NewProjectState>({ title: '', category: 'פרגולות', location: '', imageUrl: '' });
  const [projectStatus, setProjectStatus] = useState<string>('');

  // סטייט לעריכה והוספה של מחירון
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<NewPriceState>({ serviceName: '', category: 'פרגולות', priceRange: '', unit: 'מ"ר' });
  const [priceStatus, setPriceStatus] = useState<string>('');

  // 2. חיבור והקשבה ל-Socket.IO בזמן אמת
  useEffect(() => {
    if (!token) return; // מתחברים רק אם המנהל מחובר למערכת

    // התחברות לשרת ה-Backend עם הגדרת טיפוס
    const socket: Socket = io(BACKEND_URL);

    // הקשבה לאירוע של ליד חדש שנכנס באתר הציבורי
    socket.on('newLead', (newLead: Lead) => {
      console.log('🔥 ליד חדש התקבל בזמן אמת!', newLead);
      
      // הוספת הליד החדש לראש הרשימה במצב הגלובלי (Zustand)
      addGlobalLead(newLead);

      // אופציונלי: השמעת צליל התראה קטן בשביל האפקט
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-600.wav');
        audio.play();
      } catch (e) {
        console.log('Audio play blocked or unsupported');
      }
    });

    // ניקוי החיבור כשהקומפוננטה יורדת מהמסך
    return () => {
      socket.disconnect();
    };
  }, [token, addGlobalLead]);

  // פונקציית התחברות לשרת (Login)
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('adminToken', data.token); 
      } else {
        setLoginError(data.message || 'פרטי התחברות שגויים');
      }
    } catch (err) {
      setLoginError('שגיאה בתקשורת עם השרת');
    }
  };

  // פונקציית התנתקות (Logout)
  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
    
    setUsername('');
    setPassword('');
    setShowPassword(false);
    setLoginError('');
    
    cancelEdit();
    cancelPriceEdit();
  };

  // פונקציית עזר לביצוע בקשות Fetch מאובטחות
  const fetchWithAuth = (url: string, options: RequestInit = {}): Promise<Response> => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      }
    }).then(async res => {
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        throw new Error('פג תוקף החיבור, אנא התחבר מחדש');
      }
      return res;
    });
  };

  // טעינת מידע מהשרת בהתאם ללשונית הפעילה
  useEffect(() => {
    if (!token) return;

    if (activeTab === 'leads') {
      fetchWithAuth(`${BACKEND_URL}/api/admin/leads`)
        .then(res => res.json())
        .then(data => setGlobalLeads(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    } else if (activeTab === 'add-project') {
      fetch(`${BACKEND_URL}/api/projects`) 
        .then(res => res.json())
        .then(data => setProjects(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    } else if (activeTab === 'prices') {
      fetch(`${BACKEND_URL}/api/prices`) 
        .then(res => res.json())
        .then(data => setPrices(Array.isArray(data) ? data : []))
        .catch(err => console.error(err));
    }
  }, [activeTab, token, setGlobalLeads]);

  // ==========================================
  //          לוגיקת ניהול לידים
  // ==========================================
  const handleStatusChange = async (id: string | undefined, currentStatus: string | undefined) => {
    if (!id) return;
    const nextStatus = currentStatus === 'חדש' ? 'טופל' : 'חדש';
    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        setGlobalLeads(leads.map(lead => lead._id === id ? { ...lead, status: nextStatus } : lead));
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteLead = async (id: string | undefined) => {
    if (!id) return;
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הליד הזה?')) return;
    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/leads/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setGlobalLeads(leads.filter(lead => lead._id !== id));
      }
    } catch (err) { console.error(err); }
  };

  // ==========================================
  //          לוגיקת ניהול פרויקטים
  // ==========================================
  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את הפרויקט הזה לצמיתות מהאתר?')) return;
    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/projects/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(projects.filter(project => project._id !== id));
        setProjectStatus('✅ הפרויקט נמחק בהצלחה מהאתר!');
        if (editingProjectId === id) cancelEdit();
        setTimeout(() => setProjectStatus(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const startEditProject = (project: Project) => {
    setEditingProjectId(project._id);
    setNewProject({ title: project.title, category: project.category, location: project.location, imageUrl: project.imageUrl });
    setProjectStatus('✏️ עורך כעת את: ' + project.title);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingProjectId(null);
    setNewProject({ title: '', category: 'פרגולות', location: '', imageUrl: '' });
    setProjectStatus('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProjectStatus('מעלה תמונה לשרת...');
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setNewProject(prev => ({ ...prev, imageUrl: data.imageUrl }));
        setProjectStatus('✅ התמונה הועלתה בהצלחה לשרת!');
      }
    } catch (err) {
      setProjectStatus('❌ שגיאה בהעלאת התמונה.');
    }
  };

  const handleProjectSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProject.imageUrl) return;

    if (editingProjectId) {
      setProjectStatus('מעדכן פרויקט...');
      try {
        const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/projects/${editingProjectId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });
        const data = await res.json();
        if (res.ok) {
          setProjectStatus('✅ הפרויקט עודכן בהצלחה!');
          setProjects(projects.map(p => p._id === editingProjectId ? data : p));
          cancelEdit();
        }
      } catch (err) { setProjectStatus('❌ שגיאה בעדכון.'); }
    } else {
      setProjectStatus('שומר פרויקט...');
      try {
        const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProject)
        });
        const data = await res.json();
        if (res.ok) {
          setProjectStatus('✅ הפרויקט נוסף בהצלחה לגלריה!');
          setProjects(prev => [data, ...prev]);
          setNewProject({ title: '', category: 'פרגולות', location: '', imageUrl: '' });
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      } catch (err) { setProjectStatus('❌ שגיאה בשמירה.'); }
    }
  };

  // ==========================================
  //        לוגיקת ניהול ועריכת מחירון
  // ==========================================
  const startEditPrice = (priceItem: PriceItem) => {
    setEditingPriceId(priceItem._id);
    setNewPrice({
      serviceName: priceItem.serviceName,
      category: priceItem.category,
      priceRange: priceItem.priceRange,
      unit: priceItem.unit || 'מ"ר'
    });
    setPriceStatus('✏️ עורך כעת את: ' + priceItem.serviceName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelPriceEdit = () => {
    setEditingPriceId(null);
    setNewPrice({ serviceName: '', category: 'פרגולות', priceRange: '', unit: 'מ"ר' });
    setPriceStatus('');
  };

  const handleDeletePrice = async (id: string) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את פריט המחירון הזה?')) return;
    try {
      const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/prices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPrices(prices.filter(p => p._id !== id));
        setPriceStatus('✅ הפריט נמחק בהצלחה מהמחירון!');
        if (editingPriceId === id) cancelPriceEdit();
        setTimeout(() => setPriceStatus(''), 3000);
      }
    } catch (err) { console.error(err); }
  };

  const handlePriceSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingPriceId) {
      setPriceStatus('מעדכן מחירון...');
      try {
        const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/prices/${editingPriceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPrice)
        });
        const data = await res.json();
        if (res.ok) {
          setPriceStatus('✅ המחירון עודכן בהצלחה!');
          setPrices(prices.map(p => p._id === editingPriceId ? data : p));
          cancelPriceEdit();
        }
      } catch (err) { setPriceStatus('❌ שגיאה בעדכון הפריט.'); }
    } else {
      setPriceStatus('מוסיף פריט למחירון...');
      try {
        const res = await fetchWithAuth(`${BACKEND_URL}/api/admin/prices`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPrice)
        });
        const data = await res.json();
        if (res.ok) {
          setPriceStatus('✅ הפריט נוסף בהצלחה למחירון!');
          setPrices(prev => [data, ...prev]);
          setNewPrice({ serviceName: '', category: 'פרגולות', priceRange: '', unit: 'מ"ר' });
        }
      } catch (err) { setPriceStatus('❌ שגיאה בשמירת הפריט.'); }
    }
  };

  const getFullImageUrl = (url: string): string => {
    if (!url) return 'https://via.placeholder.com/150';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return url.startsWith('/') ? `${BACKEND_URL}${url}` : `${BACKEND_URL}/${url}`;
  };

  // --- מצב 1: מסך התחברות (Login Form) ---
  if (!token) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center py-12 px-4 text-right" dir="rtl">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-md border p-8">
          <h2 className="text-2xl font-black text-stone-900 text-center mb-2">כניסת מנהל מערכת</h2>
          <p className="text-sm text-stone-500 text-center mb-6">גיא ועץ - ניהול תוכן ולידים</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 text-red-700 text-sm font-bold rounded border border-red-200 text-center">
                ❌ {loginError}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">שם משתמש</label>
              <input 
                type="text" required value={username}
                placeholder="הקלד שם משתמש"
                className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-stone-900"
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1">סיסמה</label>
              <div className="relative flex items-center">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={password}
                  placeholder="הקלד סיסמה"
                  className="w-full p-2.5 pl-10 pr-3 border rounded-lg outline-none focus:ring-2 focus:ring-stone-900 text-left placeholder:text-right" 
                  onChange={e => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 text-stone-400 hover:text-stone-700 p-1"
                  title={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full bg-stone-900 text-white font-bold py-3 rounded-lg hover:bg-stone-800 transition"
            >
              התחבר למערכת
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- מצב 2: פאנל הניהול המלא ---
  return (
    <div className="min-h-screen bg-stone-100 py-12 px-4 text-right" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        
        {/* כותרת עליונה וכפתור התנתקות */}
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-stone-300">
          <h2 className="text-3xl font-black text-stone-900">
            פאנל ניהול - גיא ועץ
          </h2>
          <button 
            onClick={handleLogout}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs rounded transition flex items-center gap-1"
          >
            ↩️ התנתק
          </button>
        </div>

        {/* ניווט בין לשוניות */}
        <div className="flex justify-center flex-wrap gap-3 mb-8">
          <button 
            onClick={() => setActiveTab('leads')}
            className={`px-5 py-2 rounded-lg font-bold transition text-sm md:text-base ${activeTab === 'leads' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border'}`}
          >
            ניהול לידים ({leads.length})
          </button>
          <button 
            onClick={() => setActiveTab('add-project')}
            className={`px-5 py-2 rounded-lg font-bold transition text-sm md:text-base ${activeTab === 'add-project' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border'}`}
          >
            ניהול פרויקטים ({projects.length})
          </button>
          <button 
            onClick={() => setActiveTab('prices')}
            className={`px-5 py-2 rounded-lg font-bold transition text-sm md:text-base ${activeTab === 'prices' ? 'bg-stone-900 text-white' : 'bg-white text-stone-600 border'}`}
          >
            📊 עריכת מחירון ({prices.length})
          </button>
        </div>

        {/* לשונית 1: ניהול לידים */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 bg-stone-50 border-b">
              <h3 className="text-xl font-bold text-stone-800">לידים נכנסים מנתוני האתר</h3>
            </div>
            <div className="divide-y divide-stone-200">
              {leads.length === 0 ? (
                <p className="p-6 text-center text-stone-500">אין לידים כרגע במסד הנתונים.</p>
              ) : (
                leads.map(lead => (
                  <div key={lead._id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-stone-50 transition">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-lg font-bold text-stone-900">{lead.customerName}</h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${lead.status === 'חדש' ? 'bg-green-100 text-green-800' : 'bg-stone-200 text-stone-600'}`}>
                          {lead.status}
                        </span>
                      </div>
                      <p className="text-stone-700 font-medium">📱 טלפון: <a href={`tel:${lead.phone}`} className="text-orange-600 hover:underline">{lead.phone}</a></p>
                      <p className="text-stone-600 text-sm">🛠️ סוג עבודה: {lead.jobType}</p>
                      {lead.notes && <p className="text-stone-500 text-sm mt-2 bg-stone-100 p-2 rounded border border-dashed">{lead.notes}</p>}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleStatusChange(lead._id, lead.status)}
                        className={`px-4 py-1.5 rounded font-bold text-sm transition ${lead.status === 'חדש' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}
                      >
                        {lead.status === 'חדש' ? 'סמן כטופל' : 'החזר לחדש'}
                      </button>
                      <button 
                        onClick={() => handleDeleteLead(lead._id)}
                        className="px-4 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded font-bold text-sm transition"
                      >
                        מחק ליד
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* לשונית 2: הוספה וניהול פרויקטים */}
        {activeTab === 'add-project' && (
          <div className="space-y-8 max-w-xl mx-auto">
            <div className={`bg-white rounded-xl shadow-sm border p-8 transition-colors ${editingProjectId ? 'border-orange-300 bg-orange-50/10' : ''}`}>
              <h3 className="text-xl font-bold text-stone-800 mb-6">
                {editingProjectId ? '✏️ עריכת פרטי פרויקט' : 'פרטי הפרויקט החדש'}
              </h3>
              <form onSubmit={handleProjectSubmit} className="space-y-4">
                {projectStatus && (
                  <div className={`p-3 rounded text-center font-bold ${projectStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'}`}>
                    {projectStatus}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">שם / תיאור הפרויקט</label>
                  <input 
                    type="text" required value={newProject.title}
                    placeholder="לדוגמה: פרגולת קשתות מעץ אורן"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-stone-900"
                    onChange={e => setNewProject({...newProject, title: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">קטגוריה</label>
                  <select 
                    value={newProject.category}
                    className="w-full p-2 border rounded outline-none bg-white focus:ring-2 focus:ring-stone-900"
                    onChange={e => setNewProject({...newProject, category: e.target.value})}
                  >
                    <option>פרגולות</option>
                    <option>דקים</option>
                    <option>גגות</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">מיקום (עיר/יישוב)</label>
                  <input 
                    type="text" required value={newProject.location}
                    placeholder="לדוגמה: זכרון יעקב"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-stone-900"
                    onChange={e => setNewProject({...newProject, location: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-2">תמונת הפרויקט</label>
                  <input 
                    ref={fileInputRef}
                    type="file" accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2
                      ${newProject.imageUrl 
                        ? 'border-green-400 bg-green-50/50' 
                        : 'border-stone-300 bg-stone-50 hover:bg-stone-100 hover:border-stone-400'
                      }`}
                  >
                    {newProject.imageUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={getFullImageUrl(newProject.imageUrl)} alt="תצוגה מקדימה" className="w-24 h-24 object-cover rounded-lg shadow-md border border-green-200" />
                        <span className="text-xs text-green-700 font-bold">לחץ כאן להחלפת תמונה</span>
                      </div>
                    ) : (
                      <>
                        <svg className="w-10 h-10 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className="text-sm font-semibold text-stone-600">לחץ כאן לבחירת תמונה</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    disabled={!newProject.imageUrl || projectStatus === 'מעלה תמונה לשרת...'}
                    className={`font-bold py-3 rounded transition disabled:bg-stone-300 disabled:cursor-not-allowed
                      ${editingProjectId ? 'w-2/3 bg-orange-600 hover:bg-orange-700 text-white' : 'w-full bg-stone-900 text-white hover:bg-stone-800'}`}
                  >
                    {editingProjectId ? 'עדכן פרויקט' : 'פרסם פרויקט לגלריה'}
                  </button>
                  {editingProjectId && (
                    <button type="button" onClick={cancelEdit} className="w-1/3 bg-stone-200 text-stone-700 font-bold py-3 rounded hover:bg-stone-300 transition">
                      ביטול
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* רשימת פרויקטים קיימים */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4 pb-2 border-b">פרויקטים קיימים באתר ({projects.length})</h3>
              {projects.length === 0 ? (
                <p className="text-stone-500 text-center text-sm py-4">אין פרויקטים להצגה.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pl-2">
                  {projects.map(project => (
                    <div key={project._id} className={`flex items-center justify-between p-3 rounded-lg border transition ${editingProjectId === project._id ? 'border-orange-400 bg-orange-50/40' : 'bg-stone-50 hover:bg-stone-100'}`}>
                      <div className="flex items-center gap-3">
                        <img 
                          src={getFullImageUrl(project.imageUrl)} 
                          alt="" 
                          className="w-12 h-12 object-cover rounded border bg-white" 
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150'; }} 
                        />
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{project.title}</h4>
                          <p className="text-xs text-stone-500">{project.category} • {project.location}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditProject(project)} className="p-2 text-stone-600 hover:bg-stone-200 rounded-lg transition" title="ערוך פרויקט">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeleteProject(project._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="מחק פרויקט">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* לשונית 3: ניהול ועריכת מחירון */}
        {activeTab === 'prices' && (
          <div className="space-y-8 max-w-xl mx-auto">
            {/* טופס הוספה / עריכת פריט מחירון */}
            <div className={`bg-white rounded-xl shadow-sm border p-8 transition-colors ${editingPriceId ? 'border-orange-300 bg-orange-50/10' : ''}`}>
              <h3 className="text-xl font-bold text-stone-800 mb-6">
                {editingPriceId ? '✏️ עריכת פריט במחירון' : 'הוספת פריט חדש למחירון'}
              </h3>
              <form onSubmit={handlePriceSubmit} className="space-y-4">
                {priceStatus && (
                  <div className={`p-3 rounded text-center font-bold ${priceStatus.includes('❌') ? 'bg-red-100 text-red-800' : 'bg-stone-100 text-stone-800'}`}>
                    {priceStatus}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">שם השירות / סוג העבודה</label>
                  <input 
                    type="text" required value={newPrice.serviceName}
                    placeholder="לדוגמה: בניית דק מעץ איפאה"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-stone-900"
                    onChange={e => setNewPrice({...newPrice, serviceName: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">קטגוריה</label>
                    <select 
                      value={newPrice.category}
                      className="w-full p-2 border rounded outline-none bg-white focus:ring-2 focus:ring-stone-900"
                      onChange={e => setNewPrice({...newPrice, category: e.target.value})}
                    >
                      <option>פרגולות</option>
                      <option>דקים</option>
                      <option>גגות</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-1">יחידת מידה</label>
                    <input 
                      type="text" required value={newPrice.unit}
                      placeholder='לדוגמה: מ"ר, קוב, גלובלי'
                      className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-stone-900"
                      onChange={e => setNewPrice({...newPrice, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-stone-700 mb-1">טווח מחיר (בש"ח)</label>
                  <input 
                    type="text" required value={newPrice.priceRange}
                    placeholder="לדוגמה: 450 - 600"
                    className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-stone-900 text-right" 
                    onChange={e => setNewPrice({...newPrice, priceRange: e.target.value})}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button 
                    type="submit" 
                    className={`font-bold py-3 rounded transition 
                      ${editingPriceId ? 'w-2/3 bg-orange-600 hover:bg-orange-700 text-white' : 'w-full bg-stone-900 text-white hover:bg-stone-800'}`}
                  >
                    {editingPriceId ? 'עדכן פריט מחירון' : 'הוסף למחירון האתר'}
                  </button>
                  {editingPriceId && (
                    <button type="button" onClick={cancelPriceEdit} className="w-1/3 bg-stone-200 text-stone-700 font-bold py-3 rounded hover:bg-stone-300 transition">
                      ביטול
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* תצוגת רשימת המחירון הקיים */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-lg font-bold text-stone-800 mb-4 pb-2 border-b">פריטים קיימים במחירון ({prices.length})</h3>
              {prices.length === 0 ? (
                <p className="text-stone-500 text-center text-sm py-4">אין פריטים במחירון כרגע.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pl-2">
                  {prices.map(priceItem => (
                    <div key={priceItem._id} className={`flex items-center justify-between p-3 rounded-lg border transition ${editingPriceId === priceItem._id ? 'border-orange-400 bg-orange-50/40' : 'bg-stone-50 hover:bg-stone-100'}`}>
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{priceItem.serviceName}</h4>
                        <p className="text-xs text-stone-500">{priceItem.category} • {priceItem.priceRange} ₪ ל-{priceItem.unit}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEditPrice(priceItem)} className="p-2 text-stone-600 hover:bg-stone-200 rounded-lg transition" title="ערוך פריט">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </button>
                        <button onClick={() => handleDeletePrice(priceItem._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="מחק פריט">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
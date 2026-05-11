import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { Send, Trash2, Megaphone, BellRing } from 'lucide-react';

export default function AnnouncementsAdmin() {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const fetchAnnouncements = async () => {
    try {
      const res = await fetch('/api/admin/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnnouncements(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const publishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ title, content })
      });
      if (res.ok) {
        const newAnn = await res.json();
        setAnnouncements([newAnn, ...announcements]);
        setTitle('');
        setContent('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!window.confirm("Delete this broadcast?")) return;
    try {
      await fetch(`/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setAnnouncements(announcements.filter(a => a._id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <header className="mb-10 flex items-center justify-between">
         <h1 className="text-3xl font-black tracking-tighter dark:text-white">
           Announcements
         </h1>
       </header>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full overflow-y-auto pb-24 md:pb-0">
      {/* Broadcast Form */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 lg:col-span-1 h-fit shrink-0">
         <div className="flex items-center gap-3 mb-8 text-indigo-500">
           <Megaphone size={24} />
           <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-white">New Broadcast</h2>
         </div>
         <form onSubmit={publishAnnouncement} className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Headline</label>
              <input 
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Critical Update..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 font-bold dark:text-white outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Message Payload</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="Details of the announcement..."
                rows={6}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-2xl p-4 font-medium dark:text-white outline-none transition resize-none"
              />
            </div>
            <button 
              type="submit" 
              disabled={!title || !content}
              className="w-full flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white p-4 rounded-2xl font-bold tracking-wide transition shadow-xl shadow-indigo-500/20 disabled:shadow-none"
            >
              <Send size={18} /> Transmit
            </button>
         </form>
      </div>

      {/* Broadcast Ledger */}
      <div className="lg:col-span-2 flex flex-col min-h-[500px] lg:h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden">
         <div className="p-8 border-b border-slate-100 dark:border-slate-800 shrink-0">
           <h2 className="text-xl font-black uppercase tracking-widest text-slate-800 dark:text-white">Broadcast Ledger</h2>
         </div>
         
         <div className="flex-1 overflow-y-auto p-8 space-y-4">
           {loading ? (
             <div className="text-center font-bold tracking-widest uppercase text-slate-400">Loading Lexicon...</div>
           ) : announcements.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <BellRing size={48} className="mb-4 opacity-50" />
                <h3 className="text-xl font-black tracking-tighter text-slate-300">No Broadcasts Active</h3>
             </div>
           ) : (
             announcements.map(ann => (
               <div key={ann._id} className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-start justify-between group transition-colors hover:border-indigo-500/50">
                  <div className="pr-4">
                     <div className="flex items-center gap-3 mb-2">
                       <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                       <h3 className="text-lg font-black dark:text-white tracking-tight">{ann.title}</h3>
                     </div>
                     <p className="text-slate-500 font-medium leading-relaxed mb-4">{ann.content}</p>
                     <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                       {new Date(ann.created_at).toLocaleString()}
                     </div>
                  </div>
                  <button 
                    onClick={() => deleteAnnouncement(ann._id)}
                    className="p-3 bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 rounded-xl transition shrink-0 opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
               </div>
             ))
           )}
         </div>
      </div>
    </div>
    </div>
  );
}

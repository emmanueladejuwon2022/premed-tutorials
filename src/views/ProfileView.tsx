import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { User, Bell, ShieldAlert, LogOut } from 'lucide-react';

export default function ProfileView() {
  const { user, logout } = useAuth();
    const [name, setName] = useState(user?.name || '');
   const [password, setPassword] = useState('');
   const [saving, setSaving] = useState(false);

   const handleSave = () => {
     setSaving(true);
     setTimeout(() => {
       setSaving(false);
       alert("Profile updated successfully");
     }, 1000);
   };

   return (
    <div className="max-w-4xl mx-auto text-slate-900 dark:text-white pb-12 px-1">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold mb-1 uppercase tracking-tighter">Candidate <span className="text-slate-400">Profile.</span></h1>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Manage authentication artifacts and account preferences.</p>
         </div>
         <button onClick={handleSave} disabled={saving} className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-none hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg disabled:opacity-50 text-[10px] uppercase tracking-widest">
            {saving ? 'UPDATING...' : 'SAVE CHANGES'}
         </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-6">
            <div className="p-8 bg-white dark:bg-[#050505] border border-slate-900 dark:border-slate-800 rounded-none shadow-sm">
               <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-400">
                 <User size={16} /> Identity Information
               </h2>
               <div className="space-y-6">
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Legal Name</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-4 text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-all" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Matriculation ID</label>
                      <input type="text" readOnly value={user?.matricNo} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-4 text-xs text-slate-500 font-mono cursor-not-allowed uppercase" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Department</label>
                      <input type="text" readOnly value={user?.department} className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-4 text-xs text-slate-500 cursor-not-allowed uppercase" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2">Security Key</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="ENTER NEW ACCESS KEY..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none px-4 py-4 text-xs font-bold tracking-widest text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-all" />
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white dark:bg-[#050505] border border-slate-200 dark:border-slate-800 rounded-none shadow-sm">
               <h2 className="text-xs font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-slate-400">
                 <Bell size={16} /> Automated Alerts
               </h2>
               <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                     <div>
                       <div className="font-bold text-[10px] uppercase tracking-widest">Interface Theme</div>
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Automatic system sync</div>
                     </div>
                     <div className="w-10 h-5 bg-slate-200 dark:bg-slate-800 rounded-none relative flex items-center px-1">
                        <div className={`w-3 h-3 transition-all ${document.documentElement.classList.contains('dark') ? 'bg-slate-900 dark:bg-white translate-x-5' : 'bg-slate-500'}`}></div>
                     </div>
                  </label>
                  <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                     <div>
                       <div className="font-bold text-[10px] uppercase tracking-widest">Enrollment Alerts</div>
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Notify of new assessments</div>
                     </div>
                     <input type="checkbox" className="accent-slate-900 w-4 h-4 rounded-none" defaultChecked />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-none border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900 transition-all">
                     <div>
                       <div className="font-bold text-[10px] uppercase tracking-widest">Published Grades</div>
                       <div className="text-[8px] text-slate-500 uppercase font-bold tracking-tighter">Alert on official publishing</div>
                     </div>
                     <input type="checkbox" className="accent-slate-900 w-4 h-4 rounded-none" defaultChecked />
                  </label>
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="p-8 bg-white dark:bg-[#050505] border border-slate-200 dark:border-slate-800 rounded-none text-center shadow-sm">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mx-auto mb-6 overflow-hidden grayscale">
                 <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="w-full h-full object-cover" />
               </div>
               <button className="text-[9px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Replace Visual Artifact</button>
            </div>

            <div className="p-8 bg-white dark:bg-[#050505] border-t-4 border-rose-900 dark:border-rose-400 rounded-none shadow-sm">
               <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 flex items-center gap-3 text-rose-500">
                 <ShieldAlert size={16} /> Restricted Actions
               </h2>
               <button onClick={logout} className="w-full py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/20 font-bold text-[10px] uppercase tracking-widest border border-rose-200 dark:border-rose-900/30 transition-all">
                 Terminate Session
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}

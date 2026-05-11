import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { Search, Edit2, Trash2, Shield, Calendar, Award, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StudentRegistry() {
  const { token } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userResults, setUserResults] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async (q: string = '') => {
    try {
      const res = await fetch(`/api/admin/users?q=${q}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const viewUserDetails = async (user: any) => {
    setSelectedUser(user);
    try {
      const res = await fetch(`/api/admin/users/${user._id}/results`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserResults(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const terminateIdentity = async (user: any) => {
    if (!window.confirm(`Are you sure you want to terminate ${user.name}? This cannot be undone.`)) return;
    try {
      await fetch(`/api/admin/users/${user._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setUsers(users.filter(u => u._id !== user._id));
      if (selectedUser?._id === user._id) setSelectedUser(null);
    } catch(e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
       <header className="mb-10 flex items-center justify-between">
         <h1 className="text-3xl font-black tracking-tighter dark:text-white">
           Student Registry
         </h1>
       </header>

      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative max-w-xl">
          <input 
            type="text" 
            placeholder="Search identities by name or matric number..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border-2 border-transparent focus:border-indigo-500 rounded-2xl py-4 pl-14 pr-6 font-bold tracking-wide outline-none transition-all dark:text-white"
          />
          <button type="submit" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors">
            <Search size={24} />
          </button>
        </div>
      </form>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 font-bold tracking-widest uppercase">Loading Registry...</div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {users.map(user => (
              <div key={user._id} className="bg-slate-50 dark:bg-slate-950 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                 <div>
                   <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center font-black text-indigo-500 shadow-sm text-xl border border-indigo-100 dark:border-slate-800">
                        {user.name?.charAt(0)}
                      </div>
                      <span className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-black uppercase tracking-widest rounded-full">
                        {user.department || 'General'}
                      </span>
                   </div>
                   <h3 className="text-xl font-black tracking-tight dark:text-white mb-1">{user.name}</h3>
                   <div className="text-sm font-bold text-slate-500 font-mono">{user.matric_no}</div>
                 </div>
                 
                 <div className="mt-8 flex items-center gap-3">
                   <button 
                     onClick={() => viewUserDetails(user)}
                     className="flex-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-100 transition"
                   >
                      View Dossier
                   </button>
                   <button onClick={() => terminateIdentity(user)} className="p-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-xl transition">
                     <Trash2 size={18} />
                   </button>
                 </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Slide-over Profile */}
      <AnimatePresence>
         {selectedUser && (
           <>
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setSelectedUser(null)} />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] bg-white dark:bg-slate-900 shadow-2xl z-[70] border-l border-slate-200 dark:border-slate-800 flex flex-col">
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 shrink-0 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-500 text-white rounded-full flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/30">
                      {selectedUser.name?.charAt(0)}
                    </div>
                    <div>
                      <h2 className="text-xl font-black uppercase tracking-widest dark:text-white">{selectedUser.name}</h2>
                      <div className="text-sm font-bold text-slate-500 font-mono mt-1">{selectedUser.matric_no}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUser(null)} className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700"><X size={20} /></button>
               </div>
               <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/50">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6">Evaluation History</h3>
                  <div className="space-y-4">
                     {userResults.length === 0 ? (
                       <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-400 font-bold tracking-widest uppercase">
                         No evaluations found.
                       </div>
                     ) : (
                       userResults.map(result => (
                         <div key={result._id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                 <div className="text-sm font-black dark:text-white line-clamp-1">{result.course_id?.title || 'Unknown Module'}</div>
                                 <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{result.course_id?.code}</div>
                              </div>
                              <div className="text-2xl font-black text-indigo-500">{result.percentage}%</div>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
                               <Calendar size={14} />
                               {new Date(result.created_at).toLocaleDateString()}
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </div>
             </motion.div>
           </>
         )}
      </AnimatePresence>
    </div>
  );
}

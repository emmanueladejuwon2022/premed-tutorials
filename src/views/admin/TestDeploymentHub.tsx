import React, { useState } from 'react';
import { BookOpen, Edit2, Plus, Clock, FileQuestion, Users, Trash2, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../components/AuthContext';

export default function TestDeploymentHub({ courses, setKbCourse, fetchCourses }: { courses: any[], setKbCourse: (c: any) => void, fetchCourses: () => void }) {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    title: '', code: '', description: '', duration: 60, question_limit: 50, status: 'published',
    scheduled_date: '', end_date: ''
  });

  const handleOpenModal = (course?: any) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        title: course.title, 
        code: course.code, 
        description: course.description || '', 
        duration: course.duration || 60, 
        question_limit: course.question_limit || 50,
        status: course.status || 'published',
        scheduled_date: course.scheduled_date ? new Date(course.scheduled_date).toISOString().slice(0, 16) : '',
        end_date: course.end_date ? new Date(course.end_date).toISOString().slice(0, 16) : ''
      });
    } else {
      setEditingCourse(null);
      setFormData({ title: '', code: '', description: '', duration: 60, question_limit: 50, status: 'published', scheduled_date: '', end_date: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/admin/courses/${editingCourse._id}` : '/api/admin/courses';
      const method = editingCourse ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        fetchCourses();
      }
    } catch(e) { console.error(e); }
  };

  const handleDelete = async (id: string, name: string) => {
    if(!window.confirm(`Delete module ${name}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchCourses();
        alert('Module deleted successfully.');
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to delete module'}`);
      }
    } catch(e) { 
      console.error(e);
      alert('Network error while deleting module.');
    }
  };

  return (
    <div className="flex-1 flex flex-col pt-8 md:pt-0">
       <header className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
         <h1 className="text-xl md:text-2xl font-black tracking-tighter dark:text-white mt-10 md:mt-0">
           Deployment Hub
         </h1>
         <button onClick={() => handleOpenModal()} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold tracking-wide shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all active:scale-95 text-xs">
           <Plus size={16} /> Deploy Module
         </button>
       </header>

       {courses.length === 0 ? (
         <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[2.5rem]">
            <div className="text-center text-slate-400 p-8">
               <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
               <h3 className="text-xl font-bold dark:text-white mb-2">No Modules Deployed</h3>
               <p className="text-sm">Click "Deploy Module" to set up your first test.</p>
            </div>
         </div>
       ) : (
         <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-24 md:pb-0 scrollbar-hide">
           <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
             {courses.map((course, idx) => (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               key={course._id} 
               className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col gap-4"
             >
                <div className="flex items-start gap-4">
                   <div className="shrink-0 w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-indigo-500 border border-slate-100 dark:border-slate-700">
                      <BookOpen size={20} />
                   </div>
                   <div className="flex-1 min-w-0">
                     <div className="flex justify-between items-start">
                       <span className="inline-block px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest rounded-full mb-1">{course.code}</span>
                       <button onClick={() => handleDelete(course._id, course.title)} className="text-slate-300 hover:text-red-500 transition-colors">
                         <Trash2 size={14} />
                       </button>
                     </div>
                     <h3 className="text-base font-black tracking-tight dark:text-white line-clamp-1 leading-tight">{course.title}</h3>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-slate-50 dark:border-slate-800/50 py-3">
                   <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{course.duration}M</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <FileQuestion size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{course.questionsCount || 0}Q</span>
                   </div>
                   <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {course.scheduled_date ? new Date(course.scheduled_date).toLocaleDateString() : 'NO SKED'}
                      </span>
                   </div>
                   <div className="flex items-center gap-1.5 ml-auto">
                      <div className={`w-1.5 h-1.5 rounded-full ${course.status === 'published' ? "bg-emerald-500" : "bg-amber-500"}`} />
                      <span className={`text-[10px] font-black uppercase tracking-wider ${course.status === 'published' ? "text-emerald-500" : "text-amber-500"}`}>
                        {course.status === 'published' ? "ACTIVE" : "DRAFT"}
                      </span>
                   </div>
                </div>

                <div className="flex items-center gap-2">
                   <button 
                     onClick={() => setKbCourse(course)}
                     className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2 rounded-xl font-bold tracking-wide hover:opacity-90 active:scale-[0.98] transition-all text-[10px]"
                   >
                      Manage Q-Bank
                   </button>
                   <button 
                     onClick={async () => {
                       const newStatus = course.status === 'published' ? 'draft' : 'published';
                       try {
                         await fetch(`/api/admin/courses/${course._id}`, {
                           method: 'PUT',
                           headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                           body: JSON.stringify({ status: newStatus })
                         });
                         fetchCourses();
                       } catch(e){}
                     }}
                     className={`w-9 h-9 flex items-center justify-center rounded-xl transition-colors border ${course.status === 'published' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}`}
                   >
                      <Users size={14} />
                   </button>
                   <button onClick={() => handleOpenModal(course)} className="w-9 h-9 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-100 dark:border-slate-700 transition-colors">
                     <Edit2 size={14} />
                   </button>
                </div>
             </motion.div>
             ))}
           </div>
         </div>
       )}

       <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={() => setIsModalOpen(false)} />
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.15 }} className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-slate-900 rounded-[1.25rem] shadow-2xl z-[70] border border-slate-200 dark:border-slate-800 p-4 md:p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-black dark:text-white uppercase tracking-widest">{editingCourse ? 'Edit' : 'Deploy'} Module</h2>
        <button onClick={() => setIsModalOpen(false)} className="p-1 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
          <X size={16} />
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-4 gap-2">
          <div className="col-span-1">
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Code</label>
            <input required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="MED101" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-1.5 text-[11px] font-bold dark:text-white outline-none transition" />
          </div>
          <div className="col-span-3">
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Title</label>
            <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Anatomy Basics" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-1.5 text-[11px] font-bold dark:text-white outline-none transition" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Duration</label>
            <input type="number" required min="1" value={formData.duration} onChange={e => setFormData({...formData, duration: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-1.5 text-[11px] font-bold dark:text-white outline-none transition" />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Q-Limit</label>
            <input type="number" required min="1" value={formData.question_limit} onChange={e => setFormData({...formData, question_limit: parseInt(e.target.value)})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-1.5 text-[11px] font-bold dark:text-white outline-none transition" />
          </div>
          <div>
            <label className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Status</label>
            <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 rounded-lg p-1.5 text-[11px] font-bold dark:text-white outline-none transition">
              <option value="published">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
        
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">Start Time</label>
                <input type="datetime-local" value={formData.scheduled_date} onChange={e => setFormData({...formData, scheduled_date: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-md p-1 text-[10px] font-medium dark:text-white outline-none transition" />
            </div>
            <div>
                <label className="block text-[8px] font-black uppercase tracking-widest text-slate-500 mb-1">End Time</label>
                <input type="datetime-local" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 rounded-md p-1 text-[10px] font-medium dark:text-white outline-none transition" />
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white p-2.5 rounded-xl text-xs font-bold tracking-wide mt-1 transition shadow-lg shadow-indigo-600/20 active:scale-95">
          {editingCourse ? 'Save Changes' : 'Deploy Module'}
        </button>
      </form>
    </motion.div>
          </>
        )}
       </AnimatePresence>
    </div>
  );
}

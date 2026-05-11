import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import * as LucideIcons from 'lucide-react';
import { Search, AlertTriangle, ShieldCheck, X } from 'lucide-react';

interface ToastOptions {
  message: string;
  type?: 'error' | 'info';
}

export default function StudentDashboard({ onStartTest }: { onStartTest: (course: any) => void }) {
  const { token } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [toast, setToast] = useState<ToastOptions | null>(null);

  useEffect(() => {
    // Check onboarding
    const hasSeen = localStorage.getItem('FCF_HasSeenOnboarding');
    if (!hasSeen) {
      setShowOnboarding(true);
    }

    const fetchCourses = () => {
      fetch('/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setCourses(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
    };

    fetchCourses();
    const interval = setInterval(fetchCourses, 10000); // Sync every 10s
    return () => clearInterval(interval);
  }, [token]);

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDismissOnboarding = () => {
    localStorage.setItem('FCF_HasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleCourseClick = (course: any) => {
    if (course.questionsCount === 0) {
      setToast({ message: 'There are no questions assigned to this test yet.', type: 'error' });
      return;
    }

    const now = new Date();
    const scheduled = new Date(course.scheduled_date);
    const end = new Date(course.end_date);

    if (!course.force_start) {
      if (now < scheduled) {
        setToast({ message: `Access denied. Exam is scheduled for ${scheduled.toLocaleString()}.`, type: 'info' });
        return;
      }
      if (now > end) {
        setToast({ message: 'Exam period has expired.', type: 'error' });
        return;
      }
    }

    // Reset local topics setting before passing
    localStorage.removeItem('FCF_ChosenTopics');
    onStartTest(course);
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-20 left-1/2 z-50 transform pointer-events-none"
          >
             <div className={`px-6 py-4 rounded-lg border flex items-center gap-3 backdrop-blur-xl shadow-2xl font-sans ${
               toast.type === 'error' ? 'bg-red-50 dark:bg-red-950/80 border-red-200 dark:border-red-900 text-red-800 dark:text-red-100' : 'bg-slate-900/95 dark:bg-zinc-900/95 border-slate-700 text-slate-100'
             }`}>
                {toast.type === 'error' ? <AlertTriangle size={20} className="text-red-600 dark:text-red-500" /> : <ShieldCheck size={20} className="text-slate-400" />}
                <span className="font-bold text-xs uppercase tracking-wider">{toast.message}</span>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          >
            <motion.div 
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="w-full max-w-lg bg-white dark:bg-[#0a0a0a] rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden font-sans"
            >
               <div className="p-8">
                 <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-6">
                    <ShieldCheck size={32} className="text-slate-700 dark:text-slate-400" />
                 </div>
                 <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Examination Protocols</h2>
                 <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Please acknowledge the formal CBT protocols before proceeding.</p>
                 
                 <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-400 mt-1.5 shrink-0" />
                      <p className="text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">Continuous Proctoring Mandate</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-400 mt-1.5 shrink-0" />
                      <p className="text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">Environment Lock Protocol</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-slate-400 mt-1.5 shrink-0" />
                      <p className="text-slate-700 dark:text-slate-400 text-xs font-bold uppercase tracking-tight">Disqualification Logic Integration</p>
                    </div>
                 </div>
               </div>
               
               <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                  <button 
                    onClick={handleDismissOnboarding}
                    className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs uppercase tracking-[0.2em] rounded-md hover:bg-black dark:hover:bg-white transition-colors"
                  >
                    Acknowledge Rules
                  </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-10 flex flex-col md:flex-row gap-4 md:items-end md:justify-between px-1">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
             </div>
             <span className="text-[9px] uppercase font-black tracking-widest text-emerald-500">Active Syncing</span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-1 leading-none tracking-tighter uppercase italic">CBT <br className="hidden lg:block"/> <span className="text-slate-500">Module Portal.</span></h1>
           <p className="text-slate-400 dark:text-slate-600 font-sans text-xs uppercase tracking-widest font-bold">Select an authorized examination module to initiate testing protocol.</p>
        </div>

        <div className="w-full md:w-72 shrink-0">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 dark:group-focus-within:text-white transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Module Code Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-5 py-3.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-slate-900 focus:border-slate-900 focus:outline-none text-slate-900 dark:text-white text-xs font-bold uppercase tracking-wide placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all shadow-sm relative z-10"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
             <div key={i} className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl animate-pulse shadow-sm"></div>
          ))}
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredCourses.map(course => {
               // Resolve dynamic icon
               const IconComponent = (LucideIcons as any)[course.icon] || LucideIcons.FileText;
               const isExpired = !course.force_start && (new Date() > new Date(course.end_date));
               
               return (
                 <motion.button
                   layout
                   initial={{ opacity: 0, scale: 0.95 }}
                   animate={{ opacity: isExpired ? 0.6 : 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 0.95 }}
                   key={course._id}
                   onClick={() => handleCourseClick(course)}
                   className="group relative text-left bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden hover:border-slate-900 dark:hover:border-slate-700 transition-all flex flex-col shadow-sm"
                 >
                    <div className="p-6 flex-1 flex flex-col relative z-10">
                       <div className="flex items-start justify-between mb-8">
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:bg-slate-100 dark:group-hover:bg-slate-800 transition-colors">
                             <IconComponent size={24} />
                          </div>
                          
                          <div className={`px-3 py-1 border rounded-md text-[9px] font-black uppercase tracking-widest ${
                            course.is_mock 
                              ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600' 
                              : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                          }`}>
                            {course.is_mock ? 'Mock' : 'Standard'}
                          </div>
                       </div>

                       <div className="mt-auto">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-2 font-mono">
                            {course.code}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight uppercase tracking-tighter">
                            {course.title}
                          </h3>
                       </div>
                    </div>

                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                           <LucideIcons.ListChecks size={14} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                             {course.questionsCount} Questions
                           </span>
                        </div>
                        <div className="flex items-center gap-2">
                           <LucideIcons.Calendar size={14} className="text-slate-400" />
                           <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight max-w-[120px] truncate">
                             {new Date(course.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                           </span>
                        </div>
                    </div>
                 </motion.button>
               )
            })}
          </AnimatePresence>
          {filteredCourses.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-600">
               <Search size={48} className="mx-auto mb-4 opacity-50" />
               <p className="font-serif text-xl">No assessments found matching your query.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}

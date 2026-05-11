import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Clock, History, Award } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function TestHistoryView() {
  const { token } = useAuth();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = () => {
      fetch('/api/student/results', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
          setResults(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    fetchHistory();
    const interval = setInterval(fetchHistory, 30000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-500">
      <div className="animate-pulse flex items-center gap-2"><History /> Loading history...</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto text-slate-900 dark:text-white pb-12">
       <div className="mb-6 px-1">
         <h1 className="text-3xl font-bold mb-1 uppercase tracking-tighter">Assessment <span className="text-slate-400">Archives.</span></h1>
         <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Official student transcript and examination performance record.</p>
       </div>

       {results.length === 0 ? (
         <div className="py-20 text-center border border-slate-200 dark:border-slate-800 rounded-none bg-white dark:bg-[#050505] border-dashed">
            <History size={48} className="mx-auto text-slate-100 dark:text-slate-900 mb-6" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">No archival data found</h3>
            <p className="text-[10px] text-slate-500 mt-3 uppercase tracking-tighter">Complete a Computer Based Test to generate records.</p>
         </div>
       ) : (
         <div className="grid md:grid-cols-2 gap-4">
            {results.map((result: any, i: number) => (
               <motion.div 
                 initial={{ opacity: 0, y: 15 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.05 }}
                 key={result._id} 
                 className="bg-white dark:bg-slate-950 border-l-4 border-slate-900 dark:border-slate-800 border-y border-r border-slate-200 dark:border-slate-900 p-6 rounded-none flex flex-col hover:bg-slate-50 dark:hover:bg-slate-900 transition-all shadow-sm group relative overflow-hidden"
               >
                  <div className="flex items-start justify-between mb-4 relative z-10">
                     <div className="flex items-center gap-3">
                        <div className={`text-2xl font-bold tracking-tighter ${result.percentage >= 70 ? 'text-slate-900 dark:text-white' : result.percentage >= 50 ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'}`}>
                           {result.grade}
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-slate-900 dark:text-white uppercase tracking-wider">{result.percentage}% MARKS</div>
                          <div className="text-[7px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em] font-bold leading-none">SCORE RATING</div>
                        </div>
                     </div>
                     {result.course_id?.is_mock && (
                       <div className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[7px] font-bold uppercase tracking-widest text-slate-500">MOCK ASSESSMENT</div>
                     )}
                  </div>

                  <div className="relative z-10 mb-4">
                     <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mb-0.5">{result.course_id?.code}</div>
                     <h3 className="text-base font-bold leading-tight text-slate-900 dark:text-white line-clamp-1">{result.course_id?.title}</h3>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-slate-400 dark:text-slate-500 relative z-10">
                     <div className="flex items-center gap-2">
                        <Award size={12} className="text-slate-300 dark:text-slate-700" />
                        <span className="text-[10px] font-bold uppercase tracking-tight">{result.score} Correct</span>
                     </div>
                     <div className="flex items-center gap-2 text-[10px] font-medium opacity-60">
                        <Clock size={12} />
                        <span>{new Date(result.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                     </div>
                  </div>

                  {/* Static Border Accent */}
                  <div className="absolute top-0 right-0 w-16 h-1 bg-slate-900 dark:bg-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </motion.div>
            ))}
         </div>
       )}
    </div>
  )
}

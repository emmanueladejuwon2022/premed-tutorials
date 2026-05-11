import React from 'react';
import { ShieldCheck, Video, Mic, Wifi, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function ReadinessCheckView({ onContinue, onCancel }: { onContinue: () => void, onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] p-4 flex flex-col pt-8 overflow-y-auto">
      <div className="max-w-3xl w-full mx-auto">
         <button onClick={onCancel} className="text-slate-500 font-bold mb-6 hover:text-slate-900 dark:hover:text-white transition text-sm">
           ← Cancel & Return
         </button>
 
         <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
               <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">System Check</h1>
              <p className="text-slate-500 text-sm font-medium">Verify your environment before proceeding.</p>
            </div>
         </div>
 
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {[
              { icon: Video, title: 'Webcam', status: 'Detected', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { icon: Mic, title: 'Microphone', status: 'Active', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { icon: Wifi, title: 'Network', status: 'Stable', color: 'text-emerald-500', bg: 'bg-emerald-500/10' }
            ].map((sys, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={idx} 
                className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center shadow-sm"
              >
                 <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${sys.bg} ${sys.color}`}>
                   <sys.icon size={24} />
                 </div>
                 <h3 className="font-bold text-sm text-slate-900 dark:text-white">{sys.title}</h3>
                 <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${sys.color}`}>{sys.status}</p>
              </motion.div>
            ))}
         </div>
 
         <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-8">
           <h2 className="text-xl font-black dark:text-white mb-4">Test Rules <span className="text-red-500">& Conditions</span></h2>
           <ul className="space-y-3 mb-6">
             {[
               "You must remain in the camera frame at all times.",
               "Switching tabs or minimizing the browser will be logged as an incident.",
               "No mobile devices or secondary screens are permitted.",
               "Audio must remain clearly audible to detect background voices.",
               "If you are disconnected, you have exactly 3 minutes to return."
             ].map((rule, idx) => (
               <li key={idx} className="flex gap-4 text-slate-600 dark:text-slate-400 font-medium text-sm">
                  <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-500/20 text-red-500 flex items-center justify-center shrink-0 font-bold text-[10px]">{idx + 1}</div>
                  <p>{rule}</p>
               </li>
             ))}
           </ul>

           <motion.button 
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.98 }}
             onClick={onContinue}
             className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl py-5 font-black text-lg flex items-center justify-center gap-3"
           >
              I Accept, Continue <ArrowRight size={20} />
           </motion.button>
         </div>
      </div>
    </div>
  );
}

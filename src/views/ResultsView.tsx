import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, CheckCircle, AlertCircle } from 'lucide-react';

export default function ResultsView({ result, course, questions, onExit }: { result: any, course: any, questions: any[], onExit: () => void }) {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-[100] overflow-y-auto p-4 md:p-8">
      <motion.div 
        key="results"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-8 md:p-12 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row gap-16 items-center mb-16">
          {/* Circular Progress */}
          <div className="flex flex-col items-center gap-8 shrink-0">
             <div className={`w-56 h-56 rounded-full flex items-center justify-center border-[10px] relative ${
               result.percentage >= 70 ? 'border-emerald-100 dark:border-emerald-900/30 text-emerald-500' :
               result.percentage >= 50 ? 'border-indigo-100 dark:border-indigo-900/30 text-indigo-500' :
               'border-rose-100 dark:border-rose-900/30 text-rose-500'
             }`}>
                <div className="flex flex-col items-center">
                  <span className="text-7xl font-black font-serif tracking-tighter leading-none">{result.grade}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-60 mt-2">Grade</span>
                </div>
                <svg className="absolute inset-[-10px] w-[calc(100%+20px)] h-[calc(100%+20px)] rotate-[-90deg]">
                  <circle 
                    cx="50%" cy="50%" r="48%" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="10"
                    strokeDasharray="301"
                    strokeDashoffset={301 - (301 * (result.percentage || 0) / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
             </div>
             <div className="text-center">
               <div className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{(result.percentage || 0).toFixed(1)}%</div>
               <div className="text-slate-400 font-bold uppercase tracking-widest text-xs mt-2">Performance Score</div>
             </div>
          </div>

          <div className="flex-1 space-y-8 w-full">
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white mb-3">Simulation Complete</h2>
              <p className="text-slate-500 text-lg font-medium">Your performance breakdown has been recorded in the central academic ledger.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Score</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{result.score} <span className="text-xl text-slate-400">/ {questions.length}</span></div>
               </div>
               <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Time Elapsed</div>
                  <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatTime(result.time_spent || 0)}</div>
               </div>
            </div>

            <button 
              onClick={onExit}
              className="w-full py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform flex items-center justify-center gap-3 shadow-xl"
            >
              Return to Dashboard <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Detailed Review Section */}
        <div className="pt-12 border-t border-slate-100 dark:border-slate-800 relative z-10 w-full mt-8">
          <h3 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-8 text-center uppercase tracking-widest">Detailed Analysis</h3>
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {result.review && result.review.map((item: any, idx: number) => {
              const isCorrect = item.studentAnswer === item.correctOptionIndex;
              const isSkipped = item.studentAnswer === null || item.studentAnswer === undefined;
              return (
                <div key={idx} className="p-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden transition-all hover:bg-white dark:hover:bg-slate-900 shadow-sm">
                   {/* Decorative side bar */}
                   <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-400' : 'bg-rose-500'}`} />
 
                   <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm ${isCorrect ? 'bg-emerald-500' : isSkipped ? 'bg-slate-400' : 'bg-rose-500'}`}>
                          {isCorrect ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                        </div>
                        <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">Question {idx + 1}</span>
                      </div>
                      {isSkipped && <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Skipped</span>}
                   </div>
                   
                   <p className="text-base font-medium leading-relaxed dark:text-white mb-6 pr-4">{item.text}</p>
                   
                   <div className="grid grid-cols-1 gap-2 mb-6">
                     {item.options.map((opt: string, oIdx: number) => {
                        const isStudentChoice = item.studentAnswer === oIdx;
                        const isActualCorrect = item.correctOptionIndex === oIdx;
                        
                        let bgClass = "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60";
                        let textClass = "text-slate-500 dark:text-slate-500";
                        
                        if (isActualCorrect) {
                           bgClass = "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20";
                           textClass = "text-emerald-700 dark:text-emerald-400 font-bold";
                        } else if (isStudentChoice && !isActualCorrect) {
                           bgClass = "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20";
                           textClass = "text-rose-700 dark:text-rose-400 font-bold";
                        }
                        
                        return (
                          <div key={oIdx} className={`p-3.5 rounded-xl border flex items-center gap-3 transition-opacity ${bgClass}`}>
                             <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${isActualCorrect || isStudentChoice ? 'bg-white/50 text-slate-900 dark:bg-black/20 dark:text-white' : 'bg-slate-50 dark:bg-slate-800'}`}>{String.fromCharCode(65 + oIdx)}</div>
                             <span className={`text-sm ${textClass}`}>{opt}</span>
                             {isStudentChoice && !isActualCorrect && <AlertCircle size={14} className="ml-auto text-rose-500 shrink-0" />}
                             {isActualCorrect && <CheckCircle size={14} className="ml-auto text-emerald-500 shrink-0" />}
                          </div>
                        )
                     })}
                   </div>
                   
                   {item.explanation && (
                     <div className="p-4 bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100/50 dark:border-indigo-500/10 rounded-xl">
                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-500 mb-1">Reasoning</div>
                        <p className="text-indigo-900 dark:text-indigo-200 text-xs font-medium leading-relaxed">{item.explanation}</p>
                     </div>
                   )}
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

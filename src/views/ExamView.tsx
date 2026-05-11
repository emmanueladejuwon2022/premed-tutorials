import React, { useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, FileText, ArrowRight, BookOpen, ShieldAlert } from 'lucide-react';
import ReadinessCheckView from './ReadinessCheckView';
import ChillFirstView from './ChillFirstView';
import TestCountdownView from './TestCountdownView';
import TestActiveView from './TestActiveView';
import ResultsView from './ResultsView';

export default function ExamView({ course, onExit }: { course: any, onExit: () => void }) {
  const { token } = useAuth();
  const [step, setStep] = useState<'config' | 'readiness' | 'chill' | 'countdown' | 'exam' | 'results'>('config');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [result, setResult] = useState<any>(null);

  const startTest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test/start', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ courseId: course._id, limit: course.questionLimit || course.questionsCount || 10 })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setQuestions(data.questions);
      setSessionId(data.sessionId);
      setStep('readiness');
    } catch (err: any) {
      console.error(err.message);
      alert('Error initializing test protocol.');
      onExit();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-[#000] z-[60] overflow-hidden flex items-center justify-center transition-colors duration-500">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 dark:bg-indigo-500/5 rounded-full blur-[120px]" />

      <AnimatePresence mode="wait">
        
        {step === 'config' && (
          <motion.div 
            key="config"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-xl bg-white dark:bg-slate-900 p-6 md:p-10 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none relative overflow-hidden z-10"
          >
            {/* Glass decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10">
              <div className="p-4 bg-indigo-600 rounded-2xl w-fit mb-6 shadow-xl shadow-indigo-600/20">
                <BookOpen size={28} className="text-white" />
              </div>
              
              <h2 className="text-3xl font-black mb-3 tracking-tighter text-slate-900 dark:text-white leading-tight">Test Protocol <br /><span className="text-indigo-600 dark:text-indigo-400">Initialization</span></h2>
              <p className="text-slate-500 dark:text-slate-400 text-base mb-8 font-medium">You are beginning for <span className="font-bold text-slate-900 dark:text-white">{course.title}</span>.</p>
            
              <div className="space-y-3 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-sm">
                       <Clock size={18} />
                    </div>
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-400">Duration</span>
                  </div>
                  <span className="font-black text-xl text-slate-900 dark:text-white">{course.duration}<span className="text-xs font-medium ml-1">Min</span></span>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 shadow-sm">
                       <FileText size={18} />
                    </div>
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-400">Questions</span>
                  </div>
                  <span className="font-black text-xl text-slate-900 dark:text-white">{course.questionLimit || course.questionsCount || 10}</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50/50 dark:bg-red-500/5 border border-red-100 dark:border-red-950 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950 flex items-center justify-center text-red-500 shadow-sm border border-red-100 dark:border-red-900">
                       <ShieldAlert size={18} />
                    </div>
                    <span className="font-bold text-sm text-red-600 dark:text-red-400">Proctoring</span>
                  </div>
                  <span className="font-black text-red-700 dark:text-red-400 uppercase text-[10px] tracking-widest px-2.5 py-1 bg-red-100 dark:bg-red-950 rounded-full">High</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={onExit}
                  className="w-full sm:w-1/3 py-4 text-slate-500 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-sm"
                >
                  Go Back
                </button>
                <button 
                  onClick={startTest}
                  disabled={loading}
                  className="w-full flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                  {loading ? 'Initializing...' : 'Proceed to Lab'}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
            {/* Glow decoration */}
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
          </motion.div>
        )}

        {step === 'readiness' && <ReadinessCheckView onContinue={() => setStep('chill')} onCancel={onExit} />}
        {step === 'chill' && <ChillFirstView onComplete={() => setStep('countdown')} />}
        {step === 'countdown' && <TestCountdownView onComplete={() => setStep('exam')} />}
        {step === 'exam' && <TestActiveView course={course} questions={questions} sessionId={sessionId} token={token || ''} onComplete={(r) => { setResult(r); setStep('results'); }} />}
        {step === 'results' && result && <ResultsView result={result} course={course} questions={questions} onExit={onExit} />}
      </AnimatePresence>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, Flag, FileText, ChevronLeft, ChevronRight, ShieldAlert, CheckCircle, LayoutGrid, X } from 'lucide-react';

export default function TestActiveView({ course, questions, sessionId, token, onComplete }: { course: any, questions: any[], sessionId: string, token: string, onComplete: (result: any) => void }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(course.duration * 60);
  const [incidentCount, setIncidentCount] = useState(0);
  const [showQuickSelect, setShowQuickSelect] = useState(false);
  const [adminWarning, setAdminWarning] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const logIncident = async (type: string, details: string) => {
    setIncidentCount(prev => prev + 1);
    let snapshotBase64 = undefined;
    if (videoRef.current && videoRef.current.videoWidth > 0) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        snapshotBase64 = canvas.toDataURL('image/jpeg', 0.5);
      }
    }

    try {
      await fetch('/api/security/incident', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ 
          sessionId, 
          violation: type, 
          details, 
          snapshot_at_time: snapshotBase64 
        })
      });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (incidentCount >= 3) {
      alert('Examination terminated by system due to excessive security violations.');
      handleSubmit();
    }
  }, [incidentCount]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const initWebcam = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
           videoRef.current.srcObject = stream;
           videoRef.current.play();
        }
      } catch (e) {
        logIncident('HARDWARE_DISCONNECT', 'Webcam access denied or hardware missing.');
      }
    };
    initWebcam();

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    const takeSnapshot = async () => {
       if (videoRef.current && videoRef.current.videoWidth > 0 && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         if (!stream.active) {
            logIncident('HARDWARE_DISCONNECT', 'Webcam stream suspended or disconnected.');
            return;
         }
         const canvas = document.createElement('canvas');
         canvas.width = videoRef.current.videoWidth;
         canvas.height = videoRef.current.videoHeight;
         const ctx = canvas.getContext('2d');
         if (ctx) {
           ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
           const base64 = canvas.toDataURL('image/jpeg', 0.5);
           await fetch('/api/security/snapshot', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
             body: JSON.stringify({ sessionId, current_snapshot: base64 })
           }).catch(() => {});
         }
       } else {
         logIncident('HARDWARE_DISCONNECT', 'Webcam inactive during snapshot check.');
       }
    };
    const interval = setInterval(takeSnapshot, 30000);
    return () => clearInterval(interval);
  }, [sessionId, token]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logIncident('TAB_SWITCH', 'User switched tabs or minimized the window.');
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const handleBlur = () => {
      logIncident('TAB_SWITCH', 'Window focus lost.');
    };
    window.addEventListener('blur', handleBlur);

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logIncident('UNAUTHORIZED_ACTION', 'Right-click context menu attempt blocked.');
    };
    document.addEventListener('contextmenu', handleContextMenu);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.metaKey || (e.ctrlKey && e.key === 'r') || e.key === 'PrintScreen') {
        e.preventDefault();
        logIncident('UNAUTHORIZED_ACTION', `OS-level shortcut blocked: ${e.key}`);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/test/session-status/${sessionId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.status === 'terminated_by_admin' || data.status === 'terminated_by_system' || data.status === 'terminated') {
          alert('EXAMINATION DISQUALIFIED: MALPRACTICE DETECTED BY ADMINISTRATOR.');
          window.location.reload(); 
          return;
        }

        if (data.warnings && data.warnings.length > 0) {
          const latest = data.warnings[data.warnings.length - 1];
          setAdminWarning(latest);
        }

        if (data.answer_overrides) {
          setAnswers(prev => {
             const merged = { ...prev };
             let changed = false;
             for(let qid of Object.keys(data.answer_overrides)) {
                if (merged[qid] !== data.answer_overrides[qid]) {
                   merged[qid] = data.answer_overrides[qid];
                   changed = true;
                }
             }
             return changed ? merged : prev;
          });
        }
      } catch (e) {}
    };

    const statusInterval = setInterval(checkStatus, 5000); 

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(statusInterval);
    };
  }, [sessionId, token]);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/test/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ sessionId, answers, forced: true })
      });
      const data = await res.json();
      onComplete(data);
    } catch (err: any) {
      console.error('Error submitting test: ', err);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // Timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else {
      handleSubmit();
    }
  }, [timeLeft]);

  if(!questions || questions.length === 0) return <div>Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#000] text-slate-900 dark:text-white font-sans overflow-hidden fixed top-0 left-0 w-full z-[100] transition-colors duration-500">
      {/* Hidden Live Video Element */}
      <video ref={videoRef} autoPlay playsInline muted className="hidden" />
      {/* Sidebar Navigation - Responsive Drawer/Panel */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 md:z-auto
        w-80 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
        flex flex-col p-6 shrink-0 shadow-2xl md:shadow-none transition-transform duration-300 ease-in-out
        ${showQuickSelect ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="text-[10px] font-bold text-slate-900 dark:text-slate-200 uppercase tracking-[0.2em] mb-1 px-1">SECURITY MONITORING ACTIVE</div>
            <div className="text-base font-bold tracking-tight leading-tight px-1 truncate max-w-[200px] uppercase font-mono">{course.code}: <span className="text-slate-500">{course.title}</span></div>
          </div>
          <button onClick={() => setShowQuickSelect(false)} className="md:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 px-1">Sequence Panel</div>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => {
                  setCurrentIdx(idx);
                  if (window.innerWidth < 768) setShowQuickSelect(false);
                }}
                className={`h-9 rounded-md text-[10px] font-bold transition-all border ${
                  idx === currentIdx ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 scale-105 z-10' :
                  answers[questions[idx]._id] !== undefined ? 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100' :
                  flags[questions[idx]._id] ? 'bg-zinc-100 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-zinc-500' :
                  'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
          <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">Incidents Logged</div>
              <div className={`font-mono text-xl font-bold ${incidentCount > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400'}`}>{incidentCount}</div>
            </div>
            <ShieldAlert size={20} className={incidentCount > 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-300'} />
          </div>
          <button 
            onClick={() => { 
              const unanswered = questions.length - Object.keys(answers).length;
              const msg = unanswered > 0 
                ? `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit Examination?`
                : 'Confirm submission of your examination?';
              if(window.confirm(msg)) handleSubmit(); 
            }}
            className="w-full py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-white transition-all active:scale-[0.98]"
          >
            Finalize Examination
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {showQuickSelect && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setShowQuickSelect(false)}
        />
      )}

      {/* Main Question Area */}
      <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#000] relative overflow-hidden transition-colors">
        <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-900 flex items-center justify-between px-4 md:px-6 bg-white dark:bg-slate-950 relative z-10">
           {/* Progress Bar */}
           <div className="absolute top-0 left-0 h-1 bg-slate-100 dark:bg-slate-900 w-full">
              <div 
                className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300" 
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              />
           </div>
           
           <div className="flex items-center gap-2 md:gap-3">
             <button 
                onClick={() => setShowQuickSelect(true)} 
                className="md:hidden p-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-900 rounded-md"
             >
                <LayoutGrid size={18} />
             </button>
             <div className="hidden sm:block p-1.5 bg-slate-100 dark:bg-slate-900 rounded-md text-slate-400">
               <FileText size={18} />
             </div>
             <div className="font-bold text-sm tracking-tight text-slate-900 dark:text-white truncate uppercase font-mono">QUESTION {currentIdx + 1} <span className="text-slate-400 ml-1">/ {questions.length}</span></div>
           </div>
           
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5 px-4 py-1.5 bg-slate-50 dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-800">
                <Clock size={14} className={timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-slate-400'} />
                <span className={`font-mono text-sm font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
             </div>
             <button 
              onClick={() => setFlags({...flags, [questions[currentIdx]._id]: !flags[questions[currentIdx]._id]})}
              className={`p-2 rounded-md transition-all active:scale-95 border ${flags[questions[currentIdx]._id] ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'}`}
             >
               <Flag size={14} fill={flags[questions[currentIdx]._id] ? "currentColor" : "none"} />
             </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col max-w-3xl mx-auto w-full z-10">
          <AnimatePresence>
            {adminWarning && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-8"
              >
                <div className="bg-rose-500/10 border-2 border-rose-500/20 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-start gap-4 shadow-lg shadow-rose-500/5">
                   <div className="p-2 bg-rose-500 rounded-lg text-white">
                      <ShieldAlert size={20} />
                   </div>
                   <div>
                      <div className="text-[10px] uppercase font-black tracking-widest mb-1">Examination Security Alert</div>
                      <p className="text-sm font-bold leading-tight">{adminWarning}</p>
                   </div>
                   <button 
                    onClick={() => setAdminWarning(null)} 
                    className="ml-auto p-2 hover:bg-rose-500/10 rounded-lg transition-colors"
                   >
                     <X size={16} />
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mb-6">
             {questions[currentIdx].diagramUrl && (
               <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 flex justify-center shadow-sm">
                 <img 
                  src={questions[currentIdx].diagramUrl} 
                  className="max-h-64 object-contain rounded-md" 
                  alt="Diagram"
                  referrerPolicy="no-referrer"
                 />
               </div>
             )}
             <div className="space-y-4">
                <div className="inline-block px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[8px] font-bold uppercase tracking-[0.2em] rounded-sm border border-slate-200 dark:border-slate-800">CANDIDATE EXAMINATION MODULE</div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white uppercase">{questions[currentIdx].text}</h2>
             </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {questions[currentIdx].options.map((option: string, idx: number) => {
              const isSelected = answers[questions[currentIdx]._id] === idx;
              return (
                <button 
                  key={idx}
                  onClick={() => setAnswers({...answers, [questions[currentIdx]._id]: idx})}
                  className={`w-full p-4 text-left rounded-md border transition-all flex items-center justify-between group active:scale-[0.99] ${
                    isSelected 
                      ? 'bg-slate-900 dark:bg-slate-100 border-slate-900 dark:border-slate-100 text-white dark:text-slate-900 shadow-md' 
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-md flex items-center justify-center font-bold text-[10px] transition-colors border ${isSelected ? 'bg-white/10 border-white/20 text-white dark:text-slate-900' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm font-bold uppercase tracking-tight">{option}</span>
                  </div>
                  {isSelected && <CheckCircle size={18} className="text-white dark:text-slate-900" />}
                </button>
              );
            })}
          </div>
        </main>

        <footer className="h-16 shrink-0 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between px-6 bg-white dark:bg-slate-950 z-20 transition-colors">
           <button 
            disabled={currentIdx === 0}
            onClick={() => setCurrentIdx(currentIdx - 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30 shadow-sm"
           >
             <ChevronLeft size={16} /> <span className="font-bold text-[10px] uppercase tracking-[0.2em]">Previous</span>
           </button>
           
           <div className="flex gap-1.5">
             {questions.slice(Math.max(0, currentIdx - 2), Math.min(questions.length, currentIdx + 3)).map((_, i) => {
               const actualIdx = i + Math.max(0, currentIdx - 2);
               return (
                 <div key={actualIdx} className={`h-1.5 rounded-full transition-all duration-300 ${actualIdx === currentIdx ? 'bg-slate-900 dark:bg-slate-100 w-8' : 'bg-slate-200 dark:bg-slate-800 w-2'}`} />
               );
             })}
           </div>

           <button 
            onClick={() => currentIdx === questions.length - 1 ? handleSubmit() : setCurrentIdx(currentIdx + 1)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-md bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:bg-black dark:hover:bg-white transition-all shadow-sm active:scale-95"
           >
             <span className="text-[10px] uppercase tracking-[0.2em]">{currentIdx === questions.length - 1 ? 'Final Submit' : 'Next Question'}</span> <ChevronRight size={16} />
           </button>
        </footer>
        
      </div>
    </div>
  );
}

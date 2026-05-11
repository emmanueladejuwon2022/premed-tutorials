import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind } from 'lucide-react';

export default function ChillFirstView({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'breathe_in' | 'hold' | 'breathe_out'>('breathe_in');

  useEffect(() => {
    let timer1 = setTimeout(() => setPhase('hold'), 4000);
    let timer2 = setTimeout(() => setPhase('breathe_out'), 6000);
    let timer3 = setTimeout(() => setPhase('breathe_in'), 10000); // loops or finishes

    const totalTimer = setTimeout(() => {
      onComplete();
    }, 12000); // 12 seconds of chill time

    return () => {
      clearTimeout(timer1); clearTimeout(timer2); clearTimeout(timer3); clearTimeout(totalTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-slate-900 z-[200] flex flex-col items-center justify-center p-6 text-center">
       <h1 className="text-3xl font-black text-white tracking-tight mb-4">Mind Prep</h1>
       <p className="text-slate-400 font-medium max-w-md mx-auto mb-16">
          Take a moment to ground yourself. Your best performance comes from relative calm.
       </p>

       <div className="relative w-64 h-64 flex items-center justify-center mb-16">
          <motion.div 
            animate={{ 
              scale: phase === 'breathe_in' ? 1.5 : phase === 'hold' ? 1.5 : 1,
              opacity: phase === 'hold' ? 0.8 : 0.5
            }}
            transition={{ duration: phase === 'hold' ? 2 : 4, ease: "easeInOut" }}
            className="absolute inset-0 bg-indigo-500 rounded-full blur-[40px] opacity-20"
          />
          <div className="relative z-10 w-24 h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 shadow-2xl">
             <Wind size={32} className="text-white" />
          </div>
       </div>

       <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-4xl font-black text-white tracking-widest uppercase"
          >
             {phase === 'breathe_in' ? 'Breathe In...' : phase === 'breathe_out' ? 'Breathe Out...' : 'Hold...'}
          </motion.div>
       </AnimatePresence>

       <button onClick={onComplete} className="absolute bottom-12 text-slate-500 hover:text-white font-bold transition">
         Skip →
       </button>
    </div>
  );
}

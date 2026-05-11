import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function TestCountdownView({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(3);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      onComplete();
    }
  }, [count, onComplete]);

  return (
    <div className="fixed inset-0 bg-indigo-600 z-[300] flex items-center justify-center p-6 text-center overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500 to-indigo-800 opacity-50" />
      
      <AnimatePresence mode="wait">
        <motion.div
           key={count}
           initial={{ scale: 0.5, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           exit={{ scale: 2, opacity: 0 }}
           transition={{ duration: 0.5, ease: "easeInOut" }}
           className="relative z-10"
        >
          {count > 0 ? (
            <div className="text-[12rem] font-black text-white leading-none tracking-tighter">
              {count}
            </div>
          ) : (
            <div className="text-8xl font-black text-white tracking-tighter uppercase">
              Begin.
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

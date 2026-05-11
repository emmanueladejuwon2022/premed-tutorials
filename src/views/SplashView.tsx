import React from 'react';
import { motion } from 'motion/react';
import { BrainCircuit, ArrowRight } from 'lucide-react';

export default function SplashView({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full relative z-10 flex flex-col items-center text-center"
      >
        <motion.div
           initial={{ scale: 0.9, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ delay: 0.3, type: "spring" }}
           className="w-20 h-20 bg-slate-900 rounded-lg shadow-xl shadow-slate-900/10 flex items-center justify-center mb-10"
        >
           <BrainCircuit size={40} className="text-white" />
        </motion.div>

        <h1 className="text-4xl font-bold tracking-tighter text-slate-900 mb-4 uppercase">
          Premed Tutorials
        </h1>
        <div className="w-12 h-1 bg-slate-900 mb-8" />
        <p className="text-sm text-slate-500 mb-12 font-bold uppercase tracking-widest leading-relaxed">
          Unified CBT Examination & Learning Management System <br/> for medical candidates.
        </p>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEnter}
          className="bg-slate-900 text-white rounded-md px-10 py-5 font-bold text-xs uppercase tracking-[0.3em] shadow-lg flex items-center gap-4 w-full justify-center group transition-all"
        >
           Authorized Access 
           <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </motion.div>
    </div>
  );
}

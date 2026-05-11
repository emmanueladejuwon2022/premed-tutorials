import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, BrainCircuit, ArrowRight } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function LoginRegistrationView() {
  const [isLogin, setIsLogin] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', matric_no: '', department: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...formData, role: isAdmin ? 'admin' : 'student'})
      });
      const data = await res.json();
      
      if (res.ok && data.token) {
        login(data.user, data.token);
      } else {
        alert(data.error || 'Failed to authenticate.');
        console.error(data.error);
      }
    } catch (err: any) {
      alert(err.message || 'Network error.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#000] flex items-center justify-center p-6 lg:p-12 relative overflow-hidden transition-colors duration-500 font-sans">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        
        {/* Left Side Presentation */}
        <div className="hidden lg:flex flex-col justify-center pr-12">
           <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center border border-slate-700 mb-10">
             <BrainCircuit size={32} className="text-white" />
           </div>
           <h1 className="text-5xl font-bold text-slate-900 dark:text-white tracking-tighter leading-tight mb-8 uppercase">
             Computer Based <br/> <span className="text-slate-400">Testing Portal.</span>
           </h1>
           <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500 leading-loose mb-12">
             Official CBT infrastructure for <br/> Premed Tutorials candidates and personnel.
           </p>

           <div className="flex gap-2">
             <div className="h-1 w-10 bg-slate-900 dark:bg-slate-400" />
             <div className="h-1 w-2 bg-slate-200 dark:bg-slate-800" />
             <div className="h-1 w-2 bg-slate-200 dark:bg-slate-800" />
           </div>
        </div>

        {/* Auth Form Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-[#050505] rounded-none border-l-4 lg:border-l-0 lg:border-t-4 border-slate-900 dark:border-slate-800 shadow-2xl p-8 md:p-12 relative"
        >
           <div className="flex justify-between items-center mb-10 relative z-10">
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tighter">
               {isLogin ? 'Authentication' : 'Registration'}
             </h2>
             <button 
               onClick={() => setIsAdmin(!isAdmin)}
               className={`text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 border transition-all ${isAdmin ? 'bg-slate-900 text-white border-slate-900' : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800'}`}
             >
               {isAdmin ? 'ADMIN ACCESS' : 'STUDENT'}
             </button>
           </div>

           <form onSubmit={handleSubmit} className="space-y-6">
             <AnimatePresence mode="wait">
               {!isLogin && (
                 <motion.div 
                   key="register-fields"
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: 'auto' }}
                   exit={{ opacity: 0, height: 0 }}
                   className="space-y-6 overflow-hidden"
                 >
                   <div>
                     <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Legal Full Name</label>
                     <div className="relative">
                       <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                       <input 
                         required={!isLogin}
                         type="text" 
                         value={formData.name}
                         onChange={e => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider focus:border-slate-900 dark:focus:border-slate-400 outline-none transition"
                         placeholder="e.g. John Doe" 
                       />
                     </div>
                   </div>

                   {!isAdmin && (
                     <div className="grid grid-cols-2 gap-5">
                       <div>
                         <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Matric No.</label>
                         <input 
                           required={!isLogin && !isAdmin}
                           type="text" 
                           value={formData.matric_no}
                           onChange={e => setFormData({...formData, matric_no: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none py-4 px-4 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider focus:border-slate-900 dark:focus:border-slate-400 outline-none transition"
                           placeholder="MED/..." 
                         />
                       </div>
                       <div>
                         <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Department</label>
                         <input 
                           required={!isLogin && !isAdmin}
                           type="text" 
                           value={formData.department}
                           onChange={e => setFormData({...formData, department: e.target.value})}
                           className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none py-4 px-4 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider focus:border-slate-900 dark:focus:border-slate-400 outline-none transition"
                           placeholder="Medicine" 
                         />
                       </div>
                     </div>
                   )}
                 </motion.div>
               )}
             </AnimatePresence>

             <div>
               <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">
                 {isAdmin ? 'Official Email' : (isLogin ? 'Identification (ID/Email)' : 'Personal Email')}
               </label>
               <div className="relative">
                 <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   required
                   type="text" 
                   value={formData.email}
                   onChange={e => setFormData({...formData, email: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider focus:border-slate-900 dark:focus:border-slate-400 outline-none transition"
                   placeholder={isAdmin ? "admin@premed.edu" : "Reg number or email"} 
                 />
               </div>
             </div>

             <div>
               <label className="block text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-3">Security Key</label>
               <div className="relative">
                 <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   required
                   type="password" 
                   value={formData.password}
                   onChange={e => setFormData({...formData, password: e.target.value})}
                   className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-none py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider focus:border-slate-900 dark:focus:border-slate-400 outline-none transition"
                   placeholder="••••••••" 
                 />
               </div>
             </div>

             <button type="submit" className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-none py-5 font-bold text-xs uppercase tracking-[0.3em] shadow-xl mt-4 flex items-center justify-center gap-3 group transition-all">
                {isLogin ? 'Initiate Session' : 'Register Profile'}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </form>

           <div className="mt-10 text-center">
             <button 
               onClick={() => setIsLogin(!isLogin)}
               className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
               {isLogin ? "No existing profile? Register" : "Already registered? Login"}
             </button>
           </div>
        </motion.div>
      </div>
    </div>
  );
}

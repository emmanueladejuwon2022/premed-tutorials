import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../components/AuthContext';

export default function LeaderboardView() {
  const { token, user } = useAuth();
  const [data, setData] = useState<{ leaderboard: any[], currentUserRank: number | null }>({ leaderboard: [], currentUserRank: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = () => {
      fetch('/api/student/leaderboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    };

    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 15000); // 15s for leaderboard
    return () => clearInterval(interval);
  }, [token]);

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-slate-500">
      <div className="animate-pulse flex items-center gap-2"><Trophy /> Loading rankings...</div>
    </div>
  );

  return (
    <div className="w-full max-w-xl mx-auto text-slate-900 dark:text-white pb-20">
      <div className="mb-4 sticky top-0 bg-slate-50/80 dark:bg-[#000]/80 backdrop-blur-xl pt-2 pb-2 z-40 border-b border-slate-100 dark:border-slate-900">
         <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-xl font-bold tracking-tighter uppercase italic">Institutional <span className="text-slate-500">Rankings.</span></h1>
            <div className="bg-slate-100 dark:bg-slate-900 rounded-md p-0.5 border border-slate-200 dark:border-slate-800 flex text-[8px] font-bold uppercase tracking-widest gap-0.5">
               <button className="px-2 py-1 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-sm shadow-sm">Universal</button>
               <button className="px-2 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">Departmental</button>
            </div>
         </div>
      </div>

      {/* Podium - More minimal and compact */}
      <div className="relative pt-8 pb-6 mb-4 mt-2">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] h-full bg-slate-500/5 blur-[60px] pointer-events-none rounded-full" />
        
        <div className="flex items-end justify-center gap-2 relative z-10 h-48">
          {data.leaderboard.slice(0, 3).map((student: any, i: number) => {
             const ranks = [
                { rank: 1, pos: 'order-2', height: 'h-36', bg: 'bg-slate-900 dark:bg-slate-100', border: 'border-slate-200 dark:border-slate-800', badge: 'text-slate-400', label: 'RANK 01' },
                { rank: 2, pos: 'order-1', height: 'h-28', bg: 'bg-slate-100 dark:bg-slate-900', border: 'border-slate-200 dark:border-slate-800', badge: 'text-slate-400', label: 'RANK 02' },
                { rank: 3, pos: 'order-3', height: 'h-24', bg: 'bg-slate-50 dark:bg-slate-900/50', border: 'border-slate-200 dark:border-slate-800', badge: 'text-slate-400', label: 'RANK 03' },
             ];
             
             const indexMap = [1, 0, 2]; // For podium display order logic if needed, but the array is sorted.
             // data.leaderboard[0] is 1st.
             const style = ranks[i];
             if (!style) return null;
             
             return (
               <motion.div 
                 key={student._id}
                 initial={{ opacity: 0, y: 30 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className={`flex flex-col items-center flex-1 max-w-[90px] ${style.pos}`}
               >
                  <div className="relative mb-2">
                    <div className={`w-12 h-12 rounded-full border-2 ${style.border} p-0.5 bg-white dark:bg-slate-950 shadow-lg flex items-center justify-center overflow-hidden z-10`}>
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover" />
                    </div>
                  </div>
                  
                  <div className="text-center w-full truncate mb-2">
                    <div className="font-black text-[10px] truncate uppercase tracking-tight">{student.name.split(' ')[0]}</div>
                    <div className="text-[9px] font-mono text-slate-500">{(student.strength || 0).toFixed(1)}</div>
                  </div>

                  <div className={`w-full rounded-t-lg ${style.bg} relative overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center ${style.height}`}>
                     <span className={`text-[10px] font-bold ${style.rank === 1 ? 'text-white dark:text-slate-900' : 'text-slate-500'}`}>{style.label}</span>
                  </div>
               </motion.div>
             )
          })}
        </div>
      </div>

      {data.currentUserRank && (
        <div className="mb-4 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shrink-0">
             <span className="font-bold text-xs">#{data.currentUserRank}</span>
          </div>
          <div className="flex-1">
             <div className="text-[9px] font-bold uppercase tracking-widest text-slate-500">AUTHORIZED CANDIDATE RANK</div>
          </div>
          <div className="flex items-center gap-1 text-slate-900 dark:text-white text-[9px] font-bold uppercase tracking-wider">
            <TrendingUp size={12} />
            <span>Merit Status</span>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-1.5">
        {data.leaderboard.slice(3).map((student: any, i: number) => {
           const actualRank = i + 4;
           const isCurrentUser = student.matricNo === user?.matricNo;
           
           return (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 + (i * 0.05) }}
               key={student._id} 
               className={`p-2.5 rounded-lg border flex items-center gap-3 transition-all ${
                 isCurrentUser 
                   ? 'bg-slate-50 dark:bg-slate-900 border-slate-900 dark:border-slate-800' 
                   : 'bg-white dark:bg-slate-950 border-slate-100 dark:border-slate-900 text-slate-600 dark:text-slate-400'
               }`}
             >
                <div className={`w-5 text-center font-bold text-[10px] ${isCurrentUser ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                  {actualRank}
                </div>
                
                <div className="w-8 h-8 bg-slate-50 dark:bg-black rounded-sm overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.name}&backgroundColor=transparent`} alt="avatar" className="w-full h-full object-cover grayscale" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-bold text-xs truncate uppercase tracking-tight ${isCurrentUser ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {student.name}
                  </div>
                  <div className="text-[8px] text-slate-400 uppercase font-bold tracking-widest truncate">
                    {student.department}
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                   <div className={`font-mono font-bold text-xs ${isCurrentUser ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                     {(student.strength || 0).toFixed(1)}
                   </div>
                </div>
             </motion.div>
           )
        })}
      </div>
    </div>
  )
}

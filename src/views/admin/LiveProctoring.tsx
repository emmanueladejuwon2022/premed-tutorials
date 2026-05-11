import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { Activity, ShieldAlert, Video, Eye, StopCircle, RefreshCw, AlertCircle, FileText, AlertTriangle, Send, X, Edit2, Download, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LiveProctoring() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  const [warnMsg, setWarnMsg] = useState('');
  const [overrideQid, setOverrideQid] = useState('');
  const [overrideOpt, setOverrideOpt] = useState('0');

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(() => {
      fetchSessions(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchSessions = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await fetch(`/api/admin/telemetry`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(Array.isArray(data) ? data : []);
        if (selectedSession) {
           const updated = data.find((s: any) => s._id === selectedSession._id);
           if (updated) setSelectedSession(updated);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAction = async (endpoint: string, payload?: any) => {
    if (!selectedSession) return;
    try {
      await fetch(`/api/admin/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      setWarnMsg('');
      setOverrideQid('');
      fetchSessions();
      if (endpoint.startsWith('terminate')) setSelectedSession(null);
    } catch (e) {
      console.error(e);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text("Official Examination Telemetry Log", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableData: any[] = [];
    
    sessions.forEach(s => {
       if(s.incidents && s.incidents.length > 0) {
          s.incidents.forEach((inc: any) => {
             tableData.push([
                s.user_id?.name || 'Unknown',
                s.user_id?.matric_no || 'N/A',
                new Date(inc.timestamp).toLocaleString(),
                inc.violation,
                inc.details || ''
             ]);
          });
       }
    });

    autoTable(doc, {
      startY: 30,
      head: [['Candidate', 'Matric No.', 'Timestamp', 'Violation', 'Details']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42] }
    });

    doc.save("security-log.pdf");
  };

  const allIncidents = sessions
    .flatMap(s => (s.incidents || []).map((i: any) => ({ ...i, session: s })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden font-sans text-slate-300">
       <header className="shrink-0 p-4 lg:p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#050505]">
         <div>
           <h1 className="text-xl lg:text-2xl font-bold tracking-tighter text-white uppercase flex items-center gap-3">
             <Terminal className="text-rose-500" /> War Room Telemetry
           </h1>
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1">Live Global Security Surveillance</p>
         </div>
         <div className="flex items-center gap-3">
           <button onClick={() => fetchSessions()} className={`p-2.5 bg-slate-800 border-slate-700 hover:bg-slate-700 rounded-md text-white transition-colors ${refreshing ? 'animate-spin text-rose-500' : ''}`}>
             <RefreshCw size={16} />
           </button>
           <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 text-slate-900 hover:bg-white font-bold text-[10px] uppercase tracking-widest transition-colors rounded-none shadow-lg">
             <Download size={14} /> Export Logs
           </button>
         </div>
       </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
         {/* Main Grid View */}
         <div className="flex-1 p-4 lg:p-6 overflow-y-auto custom-scrollbar">
            {loading && sessions.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <div className="w-16 h-16 border-4 border-slate-800 border-t-rose-500 rounded-full animate-spin mb-6"></div>
                  <div className="text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Surveillance Radar...</div>
               </div>
            ) : sessions.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-600">
                  <Activity size={48} className="mb-4 text-slate-800" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">No Target Feeds</h3>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Listening for active sessions...</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-max">
                  {sessions.map((session, idx) => {
                     const totalQ = session.course_id?.questions?.length || 0;
                     const answered = session.answers ? Object.keys(session.answers).length : 0;
                     const isActive = ['active', 're-connected'].includes(session.status);
                     const incCount = session.incidents ? session.incidents.length : 0;

                     return (
                       <motion.div 
                         initial={{ opacity: 0, y: 10 }}
                         animate={{ opacity: 1, y: 0 }}
                         transition={{ delay: idx * 0.05 }}
                         key={session._id} 
                         onClick={() => setSelectedSession(session)}
                         className="bg-[#0a0a0a] border border-slate-800 hover:border-slate-500 cursor-pointer overflow-hidden group shadow-xl transition-all"
                       >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-black relative border-b border-slate-800 overflow-hidden flex items-center justify-center">
                             {session.current_snapshot ? (
                                <img src={session.current_snapshot} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
                             ) : (
                                <div className="text-slate-800 flex flex-col items-center">
                                   <Video size={32} className="mb-2" />
                                   <span className="text-[8px] font-bold uppercase tracking-[0.2em]">NO SIGNAL</span>
                                </div>
                             )}
                             {isActive && (
                                <div className="absolute top-3 right-3 flex items-center gap-2">
                                   <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
                                </div>
                             )}
                             {incCount > 0 && (
                                <div className={`absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white font-black text-[9px] uppercase tracking-widest ${incCount >= 3 ? 'animate-bounce' : ''}`}>
                                   {incCount} Incidents
                                </div>
                             )}
                             {!isActive && (
                                <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                                   <div className="text-white font-bold text-[10px] uppercase tracking-[0.3em] px-4 py-2 bg-black border border-slate-700">{session.status.replace(/_/g, ' ')}</div>
                                </div>
                             )}
                          </div>
                          
                          {/* Telemetry Block */}
                          <div className="p-4 space-y-3">
                             <div className="flex items-start justify-between">
                               <div>
                                 <div className="text-xs font-bold text-white uppercase tracking-wider truncate">{session.user_id?.name || 'USER UNKNOWN'}</div>
                                 <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{session.user_id?.matric_no}</div>
                               </div>
                               <div className="text-right">
                                 <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{session.course_id?.code}</div>
                               </div>
                             </div>

                             {/* Progress Tracker */}
                             <div>
                                <div className="flex justify-between text-[8px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-1.5">
                                   <span>Completion</span>
                                   <span>{answered} / {totalQ || '?'}</span>
                                </div>
                                <div className="h-1 bg-slate-800 w-full overflow-hidden">
                                   <div className="h-full bg-slate-400" style={{ width: totalQ ? `${(answered/totalQ)*100}%` : '0%' }} />
                                </div>
                             </div>
                          </div>
                       </motion.div>
                     );
                  })}
               </div>
            )}
         </div>

         {/* Global Violation Feed */}
         <div className="w-full lg:w-80 shrink-0 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#050505] flex flex-col">
            <div className="p-4 border-b border-slate-800 shrink-0 flex items-center gap-3">
               <Activity className="text-rose-500" size={18} />
               <div className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">Global Threat Stream</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
               {allIncidents.length === 0 ? (
                  <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-center mt-10">No Anomalies Detected</div>
               ) : (
                  allIncidents.slice(0, 50).map((inc: any, i: number) => (
                     <div key={i} className="p-3 border-l-2 border-rose-500 bg-rose-500/5 cursor-pointer hover:bg-rose-500/10 transition-colors" onClick={() => setSelectedSession(inc.session)}>
                        <div className="flex items-center justify-between mb-1">
                           <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">{inc.violation}</span>
                           <span className="text-[8px] font-bold text-slate-500">{new Date(inc.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="text-[9px] font-bold text-slate-300 uppercase tracking-wider truncate mb-1">
                          {inc.session?.user_id?.name || 'Unknown'}
                        </div>
                        {inc.details && <div className="text-[8px] text-slate-500 uppercase tracking-widest truncate">{inc.details}</div>}
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Detailed Intervention Modal */}
         <AnimatePresence>
            {selectedSession && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col lg:flex-row"
               >
                  {/* Left: Enlarged View & Details */}
                  <div className="flex-1 flex flex-col">
                     <div className="p-4 shrink-0 flex items-center justify-between border-b border-slate-800 bg-[#050505]">
                        <div>
                           <div className="text-sm font-bold text-white uppercase tracking-wider">{selectedSession.user_id?.name} <span className="text-slate-500 ml-2 font-mono">[{selectedSession.user_id?.matric_no}]</span></div>
                           <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-slate-500 mt-1">Status: {selectedSession.status.replace(/_/g, ' ')}</div>
                        </div>
                        <button onClick={() => setSelectedSession(null)} className="p-2 bg-slate-800 hover:bg-rose-500 text-white rounded-md transition-colors">
                           <X size={20} />
                        </button>
                     </div>
                     <div className="flex-1 p-4 lg:p-8 flex items-center justify-center bg-black overflow-hidden relative">
                         {selectedSession.current_snapshot ? (
                            <img src={selectedSession.current_snapshot} className="max-w-full max-h-full object-contain border border-slate-800 shadow-2xl" />
                         ) : (
                            <div className="text-slate-700 font-bold tracking-widest uppercase flex flex-col items-center">
                               <Video size={64} className="mb-4" /> NO SIGNAL ESTABLISHED
                            </div>
                         )}
                         <div className="absolute bottom-8 left-8">
                             <button onClick={() => handleAction(`prune-session-logs/${selectedSession._id}`)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-[9px] uppercase tracking-widest border border-slate-600 transition-colors">
                                Prune Local Logs
                             </button>
                         </div>
                     </div>
                  </div>

                  {/* Right: Timeline & Actions */}
                  <div className="w-full lg:w-96 bg-[#050505] shrink-0 border-l border-slate-800 flex flex-col h-1/2 lg:h-full">
                     <div className="p-4 border-b border-slate-800 bg-slate-900 shrink-0">
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2">
                           <Edit2 size={14} className="text-slate-400" /> Remote Actions
                        </h3>
                     </div>
                     <div className="p-6 shrink-0 space-y-6 border-b border-slate-800">
                        {/* Warning */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Inject Warning Alert</label>
                           <div className="flex gap-2">
                              <input 
                                value={warnMsg}
                                onChange={e => setWarnMsg(e.target.value)}
                                className="flex-1 bg-black border border-slate-800 text-white text-[10px] uppercase font-bold tracking-wider px-3 focus:outline-none focus:border-slate-500" 
                                placeholder="E.g. Identify yourself"
                              />
                              <button onClick={() => handleAction(`warn-session/${selectedSession._id}`, { message: warnMsg })} className="px-4 bg-slate-100 text-black hover:bg-white transition-colors flex items-center justify-center">
                                 <Send size={14} />
                              </button>
                           </div>
                        </div>

                        {/* Override */}
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Override Response</label>
                           <div className="flex gap-2">
                              <input 
                                value={overrideQid}
                                onChange={e => setOverrideQid(e.target.value)}
                                className="w-1/2 bg-black border border-slate-800 text-white text-[10px] uppercase font-bold tracking-wider px-3 focus:outline-none focus:border-slate-500" 
                                placeholder="Q.ID / Index"
                              />
                              <select 
                                value={overrideOpt}
                                onChange={e => setOverrideOpt(e.target.value)}
                                className="flex-1 bg-black border border-slate-800 text-white text-[10px] uppercase font-bold tracking-wider px-3 focus:outline-none focus:border-slate-500"
                              >
                                 <option value="0">Opt A</option>
                                 <option value="1">Opt B</option>
                                 <option value="2">Opt C</option>
                                 <option value="3">Opt D</option>
                              </select>
                              <button onClick={() => handleAction(`session/${selectedSession._id}/override-answer`, { questionId: overrideQid, selectedOption: parseInt(overrideOpt) })} className="px-4 bg-slate-800 text-white hover:bg-slate-700 border border-slate-700 transition-colors flex items-center justify-center">
                                 <Send size={14} />
                              </button>
                           </div>
                        </div>

                        <button onClick={() => { if(window.confirm('IRREVERSIBLE ACTION. Terminate?')) handleAction(`terminate-session/${selectedSession._id}`); }} className="w-full py-4 bg-rose-500/10 hover:bg-rose-500 border border-rose-500/50 text-rose-500 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-lg transition-all">
                           Terminate Session
                        </button>
                     </div>

                     <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black">
                        <h4 className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 px-2">Incident Timeline</h4>
                        <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-3.5 before:w-px before:bg-slate-800 ml-2">
                           {(!selectedSession.incidents || selectedSession.incidents.length === 0) ? (
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600 pl-8">No records available.</div>
                           ) : (
                              selectedSession.incidents.map((inc: any, idx: number) => (
                                 <div key={idx} className="relative pl-8">
                                    <div className="absolute left-1.5 top-1.5 w-4 h-4 rounded-full bg-[#050505] border-2 border-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]"></div>
                                    <div className="bg-[#050505] border border-rose-500/20 p-3 shadow-md border-l-2 border-l-rose-500">
                                       <div className="text-[10px] font-black uppercase tracking-widest text-white">{inc.violation}</div>
                                       <div className="text-[8px] font-bold text-slate-500 mb-1">{new Date(inc.timestamp).toLocaleString()}</div>
                                       {inc.details && <div className="text-[9px] text-slate-400 tracking-wide uppercase">{inc.details}</div>}
                                    </div>
                                 </div>
                              ))
                           )}
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
    </div>
  );
}

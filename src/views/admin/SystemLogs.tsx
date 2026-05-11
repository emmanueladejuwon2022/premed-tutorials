import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import { ShieldAlert, Database, History, Download } from 'lucide-react';

export default function SystemLogs() {
  const { token } = useAuth();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIncidents();
  }, [token]);

  const fetchIncidents = async () => {
    try {
      const res = await fetch('/api/admin/incidents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setIncidents(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const clearLogs = async () => {
    if (!window.confirm("Archive all current incident logs?")) return;
    try {
      await fetch('/api/admin/incidents', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIncidents([]);
    } catch(e) {}
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-950 rounded-[2.5rem] border border-slate-800 text-slate-300">
       <div className="p-8 border-b border-slate-800 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <Database size={24} className="text-indigo-500" />
             <div>
               <h2 className="text-xl font-black uppercase tracking-widest text-white">System Logs</h2>
               <div className="text-xs font-mono text-slate-500 mt-1">/var/log/proctoring_incidents.log</div>
             </div>
          </div>
          <button onClick={clearLogs} className="px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-widest transition flex items-center gap-2">
            <History size={16} /> Archive
          </button>
       </div>

       <div className="flex-1 overflow-y-auto p-8 font-mono text-sm leading-relaxed">
         {loading ? (
           <div className="animate-pulse text-indigo-500">Connecting to stream...</div>
         ) : incidents.length === 0 ? (
           <div className="text-slate-600">No recent incidents detected. System nominal.</div>
         ) : (
           <div className="space-y-2">
              {incidents.map((incident, idx) => {
                const timestamp = new Date(incident.created_at).toISOString();
                const userName = incident.user_id?.name || 'Unknown_Entity';
                const courseCode = incident.session_id?.course_id?.code || 'SYS';
                
                return (
                  <div key={incident._id || idx} className="flex gap-4 p-2 hover:bg-slate-900 rounded-lg transition-colors border-l-4 border-transparent hover:border-indigo-500">
                     <span className="text-slate-500 shrink-0">[{timestamp}]</span>
                     <span className="text-indigo-400 font-bold shrink-0">[{courseCode}]</span>
                     <span className="text-amber-500 font-bold shrink-0">{userName}:</span>
                     <span className="text-slate-300">{`[${incident.type}] ${incident.details || incident.violation}`}</span>
                  </div>
                )
              })}
           </div>
         )}
       </div>
    </div>
  );
}

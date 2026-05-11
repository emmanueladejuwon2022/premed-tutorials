import React from 'react';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useAuth } from '../../components/AuthContext';

export default function MonitorStats({ stats, courses }: { stats: any, courses: any[] }) {
  const { token } = useAuth();
  const generateDossier = async () => {
    try {
      const pdf = new jsPDF();
      pdf.setFontSize(24);
      pdf.text("Administrative Interface - Premed Platform Dossier", 14, 22);
      pdf.setFontSize(14);
      pdf.text(`Generated at: ${new Date().toLocaleString()}`, 14, 32);

      let yPos = 40;
      
      // We will loop through courses and get their leaderboards
      for (const course of courses) {
        const res = await fetch(`/api/admin/leaderboard/${course._id}`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) continue;
        const results = await res.json();
        
        pdf.setFontSize(16);
        pdf.text(`Module: ${course.code} - ${course.title}`, 14, yPos);
        
        const tableData = results.map((r: any, idx: number) => [
          idx + 1,
          r.user_id?.name || 'Unknown',
          r.user_id?.matric_no || 'N/A',
          r.score,
          `${r.percentage}%`,
          r.grade
        ]);

        autoTable(pdf, {
          startY: yPos + 5,
          head: [['Rank', 'Candidate', 'Matric No.', 'Score', 'Percentage', 'Grade']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          margin: { top: 10 },
        });
        
        yPos = (pdf as any).lastAutoTable.finalY + 15;
      }
      
      pdf.save(`Premed_Dossier_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (e) {
      console.error(e);
      alert("Failed to generate dossier.");
    }
  };

  return (
    <div className="flex-1 flex flex-col">
       <header className="mb-10 flex items-center justify-between">
         <h1 className="text-3xl font-black tracking-tighter dark:text-white">
           Monitor & Stats
         </h1>
         <button onClick={generateDossier} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-bold tracking-wide shadow-md hover:scale-105 transition-transform text-sm">
           <Download size={18} /> Generate Dossier
         </button>
       </header>

       <div className="space-y-8">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Total Candidates</div>
              <div className="text-5xl font-black dark:text-white tracking-tighter">{stats?.total_users || 0}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Live Sessions</div>
              <div className="text-5xl font-black dark:text-white tracking-tighter text-emerald-500">{stats?.active_sessions || 0}</div>
           </div>
           <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Archived Evaluations</div>
              <div className="text-5xl font-black dark:text-white tracking-tighter">{stats?.total_tests || 0}</div>
           </div>
         </div>
       </div>
    </div>
  );
}

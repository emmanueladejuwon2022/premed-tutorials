import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../components/AuthContext';
import { 
  Users, 
  Activity, 
  Database, 
  Settings2,
  Bell,
  MonitorPlay,
  BookOpen,
  LogOut,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  Download,
  AlertCircle
} from 'lucide-react';
import QuestionBankView from './QuestionBankView';
import StudentRegistry from './admin/StudentRegistry';
import LiveProctoring from './admin/LiveProctoring';
import AnnouncementsAdmin from './admin/AnnouncementsAdmin';
import SystemLogs from './admin/SystemLogs';
import MonitorStats from './admin/MonitorStats';
import TestDeploymentHub from './admin/TestDeploymentHub';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AdminDashboard({ activeTab = 'monitor' }: { activeTab?: string }) {
  const { token, logout } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Question Bank integration
  const [kbCourse, setKbCourse] = useState<any>(null);

  useEffect(() => {
    fetchStats();
    fetchCourses();
  }, [token]);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/overview', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch(e) {}
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/courses', { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) {
         const data = await res.json();
         setCourses(Array.isArray(data) ? data : []);
      }
    } catch(e) {} finally { setLoading(false); }
  };

  if (kbCourse) {
    return <QuestionBankView course={kbCourse} onClose={() => setKbCourse(null)} />;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden w-full relative">
       {activeTab === 'monitor' && <MonitorStats courses={courses} stats={stats} />}
       {activeTab === 'deployment' && (
          <TestDeploymentHub courses={courses} setKbCourse={setKbCourse} fetchCourses={fetchCourses} />
       )}
       {activeTab === 'registry' && <StudentRegistry />}
       {activeTab === 'proctoring' && <LiveProctoring />}
       {activeTab === 'announcements' && <AnnouncementsAdmin />}
       {activeTab === 'logs' && <SystemLogs />}
    </div>
  );
}

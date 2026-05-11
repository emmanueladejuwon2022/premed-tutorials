import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  Award, 
  Layers, 
  User, 
  Megaphone, 
  LogOut, 
  Menu, 
  X,
  BookOpen,
  BrainCircuit,
  Sun,
  Moon,
  ShieldCheck,
  Activity,
  Users,
  MonitorPlay,
  Bell,
  Database
} from 'lucide-react';
import { useAuth } from './AuthContext';
import LeaderboardView from '../views/LeaderboardView';
import TestHistoryView from '../views/TestHistoryView';
import ProfileView from '../views/ProfileView';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, token } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeRoute, setActiveRoute] = useState(user?.role === 'admin' ? 'admin_dashboard' : 'rankings');
  const [hasNewAnnouncement, setHasNewAnnouncement] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Check system preference or default to true for "Dark Mode First"
    return true; 
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchAnnouncements = () => {
      fetch('/api/admin/announcements', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const latestId = Math.max(...data.map((a: any) => parseInt(a._id) || 0)); // Assuming _id or id
          const lastRead = localStorage.getItem('FCF_LastReadAnnouncementId');
          if (!lastRead || latestId > parseInt(lastRead)) {
            setHasNewAnnouncement(true);
          }
        }
      })
      .catch(err => console.error(err));
    };

    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 30000); // 30s for announcements
    return () => clearInterval(interval);
  }, [token]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const NavContent = () => (
    <div className="flex flex-col h-full overflow-y-auto w-full">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-900 shrink-0">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 dark:bg-slate-800 rounded-lg flex items-center justify-center text-white border border-slate-700">
              <BrainCircuit size={20} />
            </div>
            <div>
              <div className="text-xl font-bold font-sans text-slate-900 dark:text-white tracking-tighter leading-tight">PREMED PORTAL</div>
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">CBT MANAGEMENT SYSTEM</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-950 rounded-lg p-4 border border-slate-200 dark:border-slate-900 shadow-sm transition-colors duration-500">
           {user?.role === 'student' ? (
             <>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">CANDIDATE ID</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-xs mb-3 truncate">{user?.matricNo || 'Unknown'}</div>
                
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">FACULTY/DEPT</div>
                <div className="text-slate-900 dark:text-white text-sm truncate font-bold">{user?.department || 'Medical Sciences'}</div>
             </>
           ) : (
             <>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">ADMINISTRATOR</div>
                <div className="text-slate-900 dark:text-white font-mono font-bold text-xs mb-3 truncate">{user?.name || 'Administrator'}</div>
                
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">ACCESS LEVEL</div>
                <div className="text-slate-900 dark:text-white text-sm truncate font-bold flex items-center gap-2"><ShieldCheck size={14} className="text-slate-900 dark:text-slate-200" /> Root Access</div>
             </>
           )}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2 shrink-0">
        {user?.role === 'student' ? (
          <>
            <NavItem 
              icon={<BookOpen size={20} />} 
              label="Examination Center" 
              active={activeRoute === 'tests'} 
              onClick={() => {setActiveRoute('tests'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<Award size={20} />} 
              label="Result Checker" 
              active={activeRoute === 'results'} 
              onClick={() => {setActiveRoute('results'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<Layers size={20} />} 
              label="Performance Index" 
              active={activeRoute === 'rankings'} 
              onClick={() => {setActiveRoute('rankings'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<User size={20} />} 
              label="Profile Settings" 
              active={activeRoute === 'profile'} 
              onClick={() => {setActiveRoute('profile'); setIsMobileMenuOpen(false);}} 
            />
            
            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800">
              <NavItem 
                icon={
                  <div className="relative">
                    <Megaphone size={20} />
                    {hasNewAnnouncement && (
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
                    )}
                  </div>
                }
                label="Announcements" 
                active={activeRoute === 'announcements'} 
                onClick={() => {
                  setActiveRoute('announcements');
                  setHasNewAnnouncement(false);
                  localStorage.setItem('FCF_LastReadAnnouncementId', '99999'); // Mock clearing
                  setIsMobileMenuOpen(false);
                }} 
              />
            </div>
          </>
        ) : (
          <>
            <NavItem 
              icon={<Activity size={20} />} 
              label="Monitor & Stats" 
              active={activeRoute === 'admin_dashboard' || activeRoute === 'monitor'} 
              onClick={() => {setActiveRoute('monitor'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<Users size={20} />} 
              label="Student Registry" 
              active={activeRoute === 'registry'} 
              onClick={() => {setActiveRoute('registry'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<BookOpen size={20} />} 
              label="Test Deployment Hub" 
              active={activeRoute === 'deployment'} 
              onClick={() => {setActiveRoute('deployment'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<MonitorPlay size={20} />} 
              label="Live Proctoring" 
              active={activeRoute === 'proctoring'} 
              onClick={() => {setActiveRoute('proctoring'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<Bell size={20} />} 
              label="Announcements" 
              active={activeRoute === 'announcements'} 
              onClick={() => {setActiveRoute('announcements'); setIsMobileMenuOpen(false);}} 
            />
            <NavItem 
              icon={<Database size={20} />} 
              label="System Logs" 
              active={activeRoute === 'logs'} 
              onClick={() => {setActiveRoute('logs'); setIsMobileMenuOpen(false);}} 
            />
          </>
        )}
      </nav>

      {/* Footer Section */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-900 mt-auto shrink-0 space-y-4">
        <div className="grid grid-cols-1">
          <button 
            onClick={logout}
            className="flex items-center justify-center p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-red-500 dark:hover:text-red-400 hover:border-red-100 dark:hover:border-red-900 transition-all font-bold gap-2 active:scale-95 shadow-sm"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>

        {/* Footer Attribution */}
        <div className="text-center pb-2">
          <div className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600 mb-1">Management</div>
          <div className="text-xs font-serif italic text-slate-500 dark:text-slate-400">Premed Tutorials Administration</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden font-sans transition-colors duration-200">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white/90 dark:bg-[#000]/90 border-b border-slate-200 dark:border-slate-900 z-40 flex items-center justify-between px-4 text-slate-900 dark:text-white transition-colors duration-200">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-slate-900 rounded-md">
            <BrainCircuit size={18} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tighter uppercase">Premed Tutorials</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleDarkMode} className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-full transition-all active:scale-95">
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 text-slate-900 dark:text-white">
            <Menu size={22} />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[280px] bg-slate-50/50 dark:bg-[#000] border-r border-slate-200 dark:border-slate-900 flex-col relative z-20 h-full transition-colors duration-200">
         <div className="absolute top-4 right-4 z-50">
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-amber-400 transition-all shadow-sm hover:shadow-md active:scale-95 group"
            >
              {darkMode ? <Sun size={16} className="group-hover:rotate-45 transition-transform" /> : <Moon size={16} className="group-hover:-rotate-12 transition-transform" />}
            </button>
         </div>
         <NavContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed inset-y-0 left-0 w-[280px] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="absolute top-4 right-4 z-50">
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-lg">
                  <X size={20} />
                </button>
              </div>
              <NavContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-slate-50 dark:bg-[#000] relative pt-16 md:pt-0 pb-16 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-6xl mx-auto flex-1 flex flex-col">
           {user?.role === 'student' ? (
             <>
               {activeRoute === 'tests' && children}
               {activeRoute === 'results' && <TestHistoryView />}
               {activeRoute === 'rankings' && <LeaderboardView />}
               {activeRoute === 'profile' && <ProfileView />}
               {activeRoute === 'announcements' && (
                 <div className="h-full flex items-center justify-center">
                   <div className="text-center text-slate-500">
                     <h2 className="text-2xl font-serif font-bold mb-2">Notice</h2>
                     <p>No new announcements at this time.</p>
                   </div>
                 </div>
               )}
             </>
           ) : (
             <>
                {React.Children.map(children, child => {
                   if (React.isValidElement(child)) {
                      return React.cloneElement(child as React.ReactElement, { activeTab: activeRoute === 'admin_dashboard' ? 'monitor' : activeRoute });
                   }
                   return child;
                })}
             </>
           )}
        </div>
      </main>

    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all group relative active:scale-[0.98] ${
        active 
          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold' 
          : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white border border-transparent font-medium'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white'}`}>
        {icon}
      </div>
      <span className="text-xs font-bold uppercase tracking-wide">
        {label}
      </span>
      {active && (
        <motion.div 
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-4 bg-white dark:bg-slate-900 rounded-full ml-1"
        />
      )}
    </button>
  );
}

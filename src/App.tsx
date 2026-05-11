import React, { useState } from 'react';
import { AuthProvider, useAuth } from './components/AuthContext';
import StudentDashboard from './views/StudentDashboard';
import AdminDashboard from './views/AdminDashboard';
import ExamView from './views/ExamView';
import DashboardLayout from './components/DashboardLayout';
import SplashView from './views/SplashView';
import LoginRegistrationView from './views/LoginRegistrationView';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, isLoading } = useAuth();
  const [activeCourse, setActiveCourse] = useState<any>(null);
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading) return null;

  if (showSplash) {
    return <SplashView onEnter={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <LoginRegistrationView />;
  }

  if (activeCourse) {
    return <ExamView course={activeCourse} onExit={() => setActiveCourse(null)} />;
  }

  return (
    <DashboardLayout>
       {user.role === 'student' ? (
         <StudentDashboard onStartTest={(course) => setActiveCourse(course)} />
       ) : (
         <AdminDashboard />
       )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

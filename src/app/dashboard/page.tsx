'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useDarkMode, DarkModeProvider } from '@/context/DarkModeContext';
import DashboardNavbar from './components/DashboardNavbar';
import OverviewSection from './components/OverviewSection';
import MyTasksSection from './components/MyTasksSection';
import EnhancedMessagesSection from './components/EnhancedMessagesSection';
import WalletSection from './components/WalletSection';
import ProfileSection from './components/ProfileSection';
import KYCVerification from './components/admin/KYCVerification';
import BanNotification from './components/BanNotification';

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { isDarkMode } = useDarkMode();
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to auth...');
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection />;
      case 'tasks':
        return <MyTasksSection />;
      case 'messages':
        return <EnhancedMessagesSection onBack={() => setActiveSection('overview')} />;
      case 'wallet':
        return <WalletSection />;
      case 'campaigns':
        router.push('/campaigns/role-selection');
        return null;
      case 'profile':
        return <ProfileSection />;
      case 'kyc-verification':
        return <KYCVerification />;
      default:
        return <OverviewSection />;
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <BanNotification />
      <DashboardNavbar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <main className="pt-4">
        {renderSection()}
      </main>
    </div>
  );
}

export default function Dashboard() {
  return (
    <DarkModeProvider>
      <DashboardContent />
    </DarkModeProvider>
  );
}

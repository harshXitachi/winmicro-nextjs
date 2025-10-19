
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { signOut } from '../../../lib/supabase';
import { useDarkMode } from '../page';

interface DashboardNavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function DashboardNavbar({ activeSection, setActiveSection }: DashboardNavbarProps) {
  const { user, profile } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'tasks', label: 'My Tasks', icon: 'ri-task-line' },
    { id: 'messages', label: 'Messages', icon: 'ri-message-line' },
    { id: 'wallet', label: 'Wallet', icon: 'ri-wallet-line' },
    { id: 'campaigns', label: 'Campaigns', icon: 'ri-flag-line' },
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
  ];

  return (
    <nav className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-700' 
        : 'bg-white/95 border-gray-200'
    }`}>
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-all duration-300">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent" style={{ fontFamily: '"Pacifico", serif' }}>
              MicroWin
            </span>
          </Link>

          {/* Enhanced Navigation Items */}
          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 ${
                  activeSection === item.id
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                    : isDarkMode
                    ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </button>
            ))}
            
            {/* Marketplace Link */}
            <Link
              href="/marketplace"
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 cursor-pointer whitespace-nowrap transform hover:scale-105 ${
                isDarkMode
                  ? 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
              }`}
            >
              <i className="ri-store-line mr-2"></i>
              Marketplace
            </Link>
          </div>

          {/* Enhanced Right Section */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-3 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                isDarkMode
                  ? 'bg-slate-700 text-yellow-400 hover:bg-slate-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <i className={`text-xl ${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'}`}></i>
            </button>

            {/* Enhanced User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                  isDarkMode
                    ? 'hover:bg-slate-700/50'
                    : 'hover:bg-gray-100/50'
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white text-sm font-bold">
                    {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </span>
                </div>
                <div className="text-left hidden md:block">
                  <p className={`font-semibold text-sm ${
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                  </p>
                  <p className={`text-xs ${
                    isDarkMode ? 'text-slate-400' : 'text-gray-600'
                  }`}>
                    ₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')}
                  </p>
                </div>
                <i className={`ri-arrow-down-s-line ${
                  isDarkMode ? 'text-slate-400' : 'text-gray-600'
                }`}></i>
              </button>

              {/* Enhanced User Dropdown */}
              {showUserMenu && (
                <div className={`absolute right-0 top-14 w-64 rounded-2xl shadow-2xl border backdrop-blur-xl z-50 ${
                  isDarkMode
                    ? 'bg-slate-800/95 border-slate-700'
                    : 'bg-white/95 border-gray-200'
                }`}>
                  <div className={`p-4 border-b ${
                    isDarkMode ? 'border-slate-700' : 'border-gray-100'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {profile?.first_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className={`font-semibold ${
                          isDarkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                        </p>
                        <p className={`text-sm ${
                          isDarkMode ? 'text-slate-400' : 'text-gray-600'
                        }`}>{user?.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                          <span className={`text-xs ${
                            isDarkMode ? 'text-slate-400' : 'text-gray-500'
                          }`}>Online</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setActiveSection('profile');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 w-full text-left transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="ri-user-settings-line text-lg"></i>
                      <span>Profile Settings</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        setActiveSection('wallet');
                        setShowUserMenu(false);
                      }}
                      className={`flex items-center space-x-3 px-4 py-3 w-full text-left transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <i className="ri-wallet-line text-lg"></i>
                      <div>
                        <span>Wallet</span>
                        <div className="text-xs text-green-600 font-semibold">
                          ₹{(profile?.wallet_balance || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </button>

                    <Link
                      href="/"
                      className={`flex items-center space-x-3 px-4 py-3 transition-colors cursor-pointer ${
                        isDarkMode
                          ? 'text-slate-300 hover:bg-slate-700/50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <i className="ri-home-line text-lg"></i>
                      <span>Back to Home</span>
                    </Link>

                    {(user as any)?.role === 'admin' && (
                      <>
                        <div className={`border-t my-2 ${
                          isDarkMode ? 'border-slate-700' : 'border-gray-100'
                        }`}></div>
                        
                        <button
                          onClick={() => {
                            setActiveSection('kyc-verification');
                            setShowUserMenu(false);
                          }}
                          className={`flex items-center space-x-3 px-4 py-3 w-full text-left transition-colors cursor-pointer ${
                            isDarkMode
                              ? 'text-amber-400 hover:bg-slate-700/50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          <i className="ri-shield-check-line text-lg"></i>
                          <div>
                            <span className="font-semibold">KYC Verification</span>
                            <div className="text-xs opacity-75">Admin Panel</div>
                          </div>
                        </button>
                      </>
                    )}

                    <div className={`border-t my-2 ${
                      isDarkMode ? 'border-slate-700' : 'border-gray-100'
                    }`}></div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        handleSignOut();
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left transition-colors cursor-pointer"
                    >
                      <i className="ri-logout-box-line text-lg"></i>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close dropdown */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}
    </nav>
  );
}

import { useState } from 'react';
import { useDarkMode } from '../page';
import { useAuth } from '../../../hooks/useAuth';
import { signOut } from '../../../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function Sidebar({ activeSection, setActiveSection }: SidebarProps) {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'my-tasks', label: 'My Tasks', icon: 'ri-task-line' },
    { id: 'wallet', label: 'Wallet', icon: 'ri-wallet-line' },
    { id: 'messages', label: 'Messages', icon: 'ri-message-3-line' },
    { id: 'profile', label: 'Profile', icon: 'ri-user-line' },
  ];

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const handleMarketplaceClick = () => {
    navigate('/marketplace');
  };

  return (
    <>
      <aside className={`w-80 min-h-screen border-r transition-all duration-300 ${
        isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
      }`}>
        <div className="p-8">
          {/* Logo */}
          <div className="flex items-center space-x-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl" style={{ fontFamily: '"Pacifico", serif' }}>M</span>
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`} style={{ fontFamily: '"Pacifico", serif' }}>MicroWin</h1>
              <p className={`text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>Dashboard</p>
            </div>
          </div>

          {/* User Profile */}
          <div className={`p-6 rounded-2xl mb-8 ${
            isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
          }`}>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">
                  {user?.user_metadata?.first_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  {user?.user_metadata?.first_name && user?.user_metadata?.last_name 
                    ? `${user.user_metadata.first_name} ${user.user_metadata.last_name}`
                    : user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'
                  }
                </h3>
                <p className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  @{user?.user_metadata?.username || user?.email?.split('@')[0] || 'username'}
                </p>
                <div className="flex items-center mt-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className={`text-xs ${
                    isDarkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 group ${
                  activeSection === item.id
                    ? isDarkMode
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <i className={`${item.icon} text-xl transition-transform duration-300 ${
                  activeSection === item.id ? 'scale-110' : 'group-hover:scale-110'
                }`}></i>
                <span>{item.label}</span>
                {activeSection === item.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            ))}
            
            {/* Marketplace Button */}
            <button
              onClick={handleMarketplaceClick}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 group ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i className="ri-store-line text-xl transition-transform duration-300 group-hover:scale-110"></i>
              <span>Marketplace</span>
            </button>
          </nav>

          {/* Settings & Logout */}
          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <button
              onClick={toggleDarkMode}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                isDarkMode
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <i className={`${isDarkMode ? 'ri-sun-line' : 'ri-moon-line'} text-xl`}></i>
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            
            <button
              onClick={() => setShowLogoutModal(true)}
              className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                isDarkMode
                  ? 'text-red-400 hover:bg-red-900/20 hover:text-red-300'
                  : 'text-red-600 hover:bg-red-50 hover:text-red-700'
              }`}
            >
              <i className="ri-logout-box-line text-xl"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          <div className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] rounded-2xl shadow-2xl z-50 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
                <i className="ri-logout-box-line text-2xl text-red-600"></i>
              </div>
              
              <h3 className={`text-xl font-bold text-center mb-2 ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Confirm Logout
              </h3>
              
              <p className={`text-center mb-6 ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Are you sure you want to logout? You'll need to sign in again to access your dashboard.
              </p>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  disabled={loggingOut}
                  className={`flex-1 px-4 py-3 border rounded-xl font-medium transition-colors ${
                    isDarkMode 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Logging out...
                    </div>
                  ) : (
                    'Logout'
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

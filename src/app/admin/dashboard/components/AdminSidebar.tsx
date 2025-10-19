'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

interface AdminSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onLogout: () => void;
}

export default function AdminSidebar({ activeSection, setActiveSection, onLogout }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current,
        { x: -100, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
      );

      const menuItems = sidebarRef.current?.querySelectorAll('.menu-item');
      if (menuItems) {
        gsap.fromTo(menuItems,
          { x: -30, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, stagger: 0.1, delay: 0.3, ease: "power3.out" }
        );
      }
    }, sidebarRef);

    return () => ctx.revert();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: 'ri-dashboard-3-line', color: 'from-blue-600 to-blue-700' },
    { id: 'users', label: 'User Management', icon: 'ri-user-settings-line', color: 'from-green-600 to-green-700' },
    { id: 'wallet', label: 'Admin Wallet', icon: 'ri-wallet-3-line', color: 'from-purple-600 to-purple-700' },
    { id: 'tasks', label: 'Task Management', icon: 'ri-task-line', color: 'from-orange-600 to-orange-700' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-bar-chart-line', color: 'from-indigo-600 to-indigo-700' },
    { id: 'settings', label: 'Settings', icon: 'ri-settings-3-line', color: 'from-gray-600 to-gray-700' }
  ];

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div 
      ref={sidebarRef} 
      className={`${isCollapsed ? 'w-20' : 'w-80'} min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden transition-all duration-300 ease-in-out shadow-2xl`}
    >
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/30 to-purple-600/30"></div>
        <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-indigo-500/15 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      {/* Animated Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Enhanced Logo and Toggle */}
        <div className="flex items-center justify-between mb-10">
          {!isCollapsed && (
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <i className="ri-admin-line text-xl text-white"></i>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-white text-xl font-bold">Admin Panel</h2>
                <p className="text-gray-400 text-sm">Microwin Control</p>
              </div>
            </div>
          )}
          
          {isCollapsed && (
            <div className="relative mx-auto">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <i className="ri-admin-line text-xl text-white"></i>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
          )}

          <button
            onClick={toggleSidebar}
            className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            <i className={`ri-${isCollapsed ? 'menu-unfold' : 'menu-fold'}-line text-white text-lg`}></i>
          </button>
        </div>

        {/* Enhanced Navigation Menu */}
        <nav className="space-y-3">
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`menu-item w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-5'} py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                activeSection === item.id
                  ? `bg-gradient-to-r ${item.color} text-white shadow-xl shadow-blue-500/25 scale-105`
                  : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-102'
              }`}
              title={isCollapsed ? item.label : ''}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Animated background for active item */}
              {activeSection === item.id && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-50 animate-pulse"></div>
              )}

              <div className={`w-7 h-7 flex items-center justify-center relative z-10 ${
                activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'
              }`}>
                <i className={`${item.icon} text-xl`}></i>
              </div>
              
              {!isCollapsed && (
                <>
                  <span className="font-semibold text-sm relative z-10">{item.label}</span>
                  {activeSection === item.id && (
                    <div className="ml-auto flex items-center space-x-2 relative z-10">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <i className="ri-arrow-right-s-line text-lg"></i>
                    </div>
                  )}
                </>
              )}

              {/* Active indicator for collapsed state */}
              {isCollapsed && activeSection === item.id && (
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full shadow-lg"></div>
              )}

              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -skew-x-12"></div>
            </button>
          ))}
        </nav>

        {/* Enhanced Admin Stats Widget */}
        {!isCollapsed && (
          <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <i className="ri-pulse-line mr-2 text-blue-400"></i>
              System Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Server Load</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="w-3/4 h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                  </div>
                  <span className="text-green-400 text-xs font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Active Users</span>
                <span className="text-blue-400 font-semibold">1,247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300 text-sm">Tasks Today</span>
                <span className="text-purple-400 font-semibold">89</span>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Social Links */}
        {!isCollapsed && (
          <div className="mt-8 flex items-center justify-center space-x-3">
            {[
              { icon: 'ri-telegram-line', color: 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-400' },
              { icon: 'ri-twitter-line', color: 'bg-sky-600/30 hover:bg-sky-600/50 text-sky-400' },
              { icon: 'ri-discord-line', color: 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-400' },
              { icon: 'ri-reddit-line', color: 'bg-orange-600/30 hover:bg-orange-600/50 text-orange-400' }
            ].map((social, index) => (
              <button key={index} className={`w-10 h-10 ${social.color} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg`}>
                <i className={`${social.icon} text-lg`}></i>
              </button>
            ))}
          </div>
        )}

        {isCollapsed && (
          <div className="mt-8 space-y-3">
            {[
              { icon: 'ri-telegram-line', color: 'bg-blue-600/30 hover:bg-blue-600/50 text-blue-400' },
              { icon: 'ri-twitter-line', color: 'bg-sky-600/30 hover:bg-sky-600/50 text-sky-400' },
              { icon: 'ri-discord-line', color: 'bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-400' },
              { icon: 'ri-reddit-line', color: 'bg-orange-600/30 hover:bg-orange-600/50 text-orange-400' }
            ].map((social, index) => (
              <button key={index} className={`w-10 h-10 ${social.color} rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg mx-auto`}>
                <i className={`${social.icon} text-lg`}></i>
              </button>
            ))}
          </div>
        )}

        {/* Enhanced Logout Button */}
        <div className="mt-8">
          <button
            onClick={onLogout}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-3' : 'space-x-4 px-5'} py-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-2xl transition-all duration-300 group border border-red-600/30 hover:border-red-600/50 hover:scale-105`}
            title={isCollapsed ? 'Logout' : ''}
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-logout-circle-line text-xl group-hover:rotate-12 transition-transform duration-300"></i>
            </div>
            {!isCollapsed && (
              <span className="text-sm font-semibold">Logout</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

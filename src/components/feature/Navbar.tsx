'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/supabase';

export default function Navbar() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      console.log('🔄 Signing out...');
      await signOut();
      
      // Force page reload to ensure auth state updates
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Enhanced Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300">
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={`font-medium transition-colors ${
                isActive('/') ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Home
            </Link>
            <Link
              href="/marketplace"
              className={`font-medium transition-colors ${
                isActive('/marketplace') ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'
              }`}
            >
              Browse Tasks
            </Link>
            <a href="#how-it-works" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              How It Works
            </a>
            <a href="#blog" className="font-medium text-gray-700 hover:text-indigo-600 transition-colors">
              Blog
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {profile?.first_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <i className="ri-arrow-down-s-line text-gray-600"></i>
                  </button>

                  {/* User Dropdown */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <p className="font-semibold text-gray-900">
                          {profile ? `${profile.first_name} ${profile.last_name}` : 'User'}
                        </p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="py-2">
                        <Link
                          href="/dashboard"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-dashboard-line"></i>
                          <span>Dashboard</span>
                        </Link>
                        <Link
                          href="/profile-setup"
                          className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <i className="ri-user-settings-line"></i>
                          <span>Profile Settings</span>
                        </Link>
                        <button
                          onClick={() => {
                            setIsMenuOpen(false);
                            handleSignOut();
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left cursor-pointer"
                        >
                          <i className="ri-logout-box-line"></i>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth"
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/auth"
                  className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg whitespace-nowrap"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <i className={`ri-${isMenuOpen ? 'close' : 'menu'}-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              <Link
                href="/"
                className={`block px-4 py-2 rounded-xl font-medium transition-colors ${
                  isActive('/') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/marketplace"
                className={`block px-4 py-2 rounded-xl font-medium transition-colors ${
                  isActive('/marketplace') ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Browse Tasks
              </Link>
              <a 
                href="#how-it-works" 
                className="block px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#blog" 
                className="block px-4 py-2 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Blog
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
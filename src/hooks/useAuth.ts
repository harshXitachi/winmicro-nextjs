'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { getUserProfile, isAdmin as checkIsAdmin, getCurrentUser } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  user_metadata?: any;
  created_at?: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  username?: string;
  email: string;
  avatar_url?: string;
  bio?: string;
  skills?: string[];
  rating?: number;
  total_earnings?: number;
  completed_tasks?: number;
  success_rate?: number;
  response_time?: string;
  level?: number;
  experience_points?: number;
  wallet_balance?: number;
  wallet_balance_inr?: string;
  wallet_balance_usd?: string;
  wallet_balance_usdt?: string;
  default_currency?: string;
  role?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getInitialSession = async () => {
      try {
        // Check current user (includes admin check)
        const { user: currentUser } = await getCurrentUser();
        
        if (mounted) {
          setUser(currentUser);
          
          if (currentUser) {
            await loadUserProfile(currentUser.id);
            await checkAdminStatus(currentUser.id);
          } else {
            setProfile(null);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'admin_session' || e.key === 'user_session') {
        if (!e.newValue) {
          // Session was removed, user logged out
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        } else {
          // Session was updated, refresh user data
          getInitialSession();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      mounted = false;
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: profileData } = await getUserProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading user profile:', error);
      setProfile(null);
    }
  };

  const checkAdminStatus = async (userId: string) => {
    try {
      const { isAdmin: adminStatus } = await checkIsAdmin(userId);
      setIsAdmin(adminStatus);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
      await checkAdminStatus(user.id);
    }
  };

  return {
    user,
    profile,
    loading,
    isAdmin,
    refreshProfile
  };
};
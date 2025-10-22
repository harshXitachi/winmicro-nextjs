'use client';

import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

// Re-export Firebase auth hook as useAuth for backward compatibility
export const useAuth = () => {
  const firebaseAuth = useFirebaseAuth();
  
  // Transform Firebase user to match old interface
  return {
    user: firebaseAuth.user ? {
      id: firebaseAuth.user.uid,
      email: firebaseAuth.user.email || '',
      user_metadata: {},
      created_at: firebaseAuth.user.metadata.creationTime,
    } : null,
    profile: firebaseAuth.profile,
    loading: firebaseAuth.loading,
    isAdmin: firebaseAuth.isAdmin,
    refreshProfile: firebaseAuth.refreshProfile,
  };
};

// Keep the old exports for compatibility
export const AuthContext = null;

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
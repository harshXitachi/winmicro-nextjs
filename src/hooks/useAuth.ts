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

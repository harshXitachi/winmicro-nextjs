'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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

interface FirebaseAuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType | null>(null);

export const useFirebaseAuth = () => {
  const context = useContext(FirebaseAuthContext);
  if (!context) {
    throw new Error('useFirebaseAuth must be used within FirebaseAuthProvider');
  }
  return context;
};

export const FirebaseAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user profile from your PostgreSQL database
  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setIsAdmin(data.profile?.role === 'admin');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Sync Firebase user with PostgreSQL database
  const syncUserWithDatabase = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const response = await fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          idToken
        }),
      });
      
      if (response.ok) {
        await fetchUserProfile(firebaseUser.uid);
      }
    } catch (error) {
      console.error('Error syncing user with database:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get Firebase ID token and set it as a cookie
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/auth/set-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken }),
          });
          console.log('✅ Firebase token set as cookie');
        } catch (error) {
          console.error('❌ Failed to set Firebase token cookie:', error);
        }
        
        await syncUserWithDatabase(firebaseUser);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Sync with database will happen automatically via onAuthStateChanged
  };

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    // Sync with database will happen automatically via onAuthStateChanged
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setProfile(null);
    setIsAdmin(false);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.uid);
    }
  };

  const value: FirebaseAuthContextType = {
    user,
    profile,
    loading,
    isAdmin,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    resetPassword,
    refreshProfile,
  };

  return (
    <FirebaseAuthContext.Provider value={value}>
      {children}
    </FirebaseAuthContext.Provider>
  );
};

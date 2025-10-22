'use client';

import React from 'react';
import { FirebaseAuthProvider } from '@/context/FirebaseAuthContext';

// Re-export FirebaseAuthProvider as AuthProvider for backward compatibility
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}

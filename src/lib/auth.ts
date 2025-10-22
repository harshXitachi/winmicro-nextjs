import { SignJWT, jwtVerify } from 'jose';
import * as bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  try {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token');
    return token?.value || null;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(): Promise<JWTPayload | null> {
  try {
    // First, try to get Firebase ID token from Authorization header
    const headersList = await headers();
    const authHeader = headersList.get('authorization');
    
    console.log('🔐 Auth header present:', !!authHeader);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const idToken = authHeader.substring(7);
      console.log('🔑 Firebase token found, length:', idToken.length);
      
      try {
        // Check if Firebase Admin is initialized
        if (getApps().length === 0) {
          console.error('❌ Firebase Admin not initialized!');
          console.log('Env check:', {
            hasProjectId: !!process.env.FIREBASE_ADMIN_PROJECT_ID,
            hasClientEmail: !!process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            hasPrivateKey: !!process.env.FIREBASE_ADMIN_PRIVATE_KEY,
          });
          return null;
        }
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        console.log('✅ Firebase token verified for user:', decodedToken.uid);
        
        return {
          userId: decodedToken.uid,
          email: decodedToken.email || '',
          role: 'user', // Default role, can be customized
        };
      } catch (firebaseError: any) {
        console.error('❌ Firebase token verification failed:', firebaseError.message);
        console.error('Error code:', firebaseError.code);
      }
    } else {
      console.log('⚠️ No Bearer token in Authorization header');
    }
    
    // Fallback to old JWT token method (for backward compatibility)
    const token = await getAuthToken();
    if (!token) {
      console.log('⚠️ No JWT token found in cookies either');
      return null;
    }
    return await verifyToken(token);
  } catch (error: any) {
    console.error('❌ getCurrentUser error:', error.message);
    return null;
  }
}

export function setAuthCookie(token: string) {
  return {
    name: 'auth_token',
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  };
}

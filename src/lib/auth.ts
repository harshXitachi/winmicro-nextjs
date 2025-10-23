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
    const headersList = await headers();
    
    // Debug: Log all headers
    console.log('📋 All headers:', Array.from(headersList.entries()).map(([k, v]) => 
      k.toLowerCase() === 'authorization' || k.toLowerCase() === 'x-firebase-token' 
        ? `${k}: [REDACTED]` 
        : `${k}: ${v}`
    ));
    
    // Try custom header first (AWS Amplify workaround)
    let idToken = headersList.get('x-firebase-token');
    
    if (idToken) {
      console.log('🔑 Firebase token from x-firebase-token header, length:', idToken.length);
    } else {
      // Fallback to Authorization header
      const authHeader = headersList.get('authorization');
      console.log('🔐 Auth header present:', !!authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        idToken = authHeader.substring(7);
        console.log('🔑 Firebase token from Authorization header, length:', idToken.length);
      }
    }
    
    // Also try firebase_token cookie
    if (!idToken) {
      const cookieStore = await cookies();
      const firebaseCookie = cookieStore.get('firebase_token');
      if (firebaseCookie) {
        idToken = firebaseCookie.value;
        console.log('🍪 Firebase token from cookie, length:', idToken.length);
      }
    }
    
    if (idToken) {
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
      console.log('⚠️ No Bearer token in Authorization header or cookie');
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

export async function getCurrentUserFromRequest(request: Request): Promise<JWTPayload | null> {
  try {
    // Try custom header first (AWS Amplify workaround)
    let idToken = request.headers.get('x-firebase-token');
    
    if (idToken) {
      console.log('🔑 Firebase token from x-firebase-token header, length:', idToken.length);
    } else {
      // Fallback to Authorization header
      const authHeader = request.headers.get('authorization');
      console.log('🔐 Auth header present:', !!authHeader);
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        idToken = authHeader.substring(7);
        console.log('🔑 Firebase token from Authorization header, length:', idToken.length);
      }
    }
    
    // Also try firebase_token from cookie header
    if (!idToken) {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').map(c => c.trim());
        const firebaseCookie = cookies.find(c => c.startsWith('firebase_token='));
        if (firebaseCookie) {
          idToken = firebaseCookie.split('=')[1];
          console.log('🍪 Firebase token from cookie, length:', idToken.length);
        }
      }
    }
    
    if (idToken) {
      try {
        // Check if Firebase Admin is initialized
        if (getApps().length === 0) {
          console.error('❌ Firebase Admin not initialized!');
          return null;
        }
        
        const decodedToken = await getAuth().verifyIdToken(idToken);
        console.log('✅ Firebase token verified for user:', decodedToken.uid);
        
        return {
          userId: decodedToken.uid,
          email: decodedToken.email || '',
          role: 'user',
        };
      } catch (firebaseError: any) {
        console.error('❌ Firebase token verification failed:', firebaseError.message);
        console.error('Error code:', firebaseError.code);
      }
    } else {
      console.log('⚠️ No Bearer token in Authorization header or cookie');
    }
    
    return null;
  } catch (error: any) {
    console.error('❌ getCurrentUserFromRequest error:', error.message);
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

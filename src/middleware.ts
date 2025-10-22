import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify, SignJWT } from 'jose';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

// Initialize Firebase Admin
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
    console.error('Middleware Firebase init error:', error);
  }
}

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();
  
  // Handle API routes - convert Firebase token to JWT session
  if (path.startsWith('/api/')) {
    const authHeader = request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const firebaseToken = authHeader.substring(7);
      
      try {
        // Verify Firebase token
        const decodedToken = await getAuth().verifyIdToken(firebaseToken);
        
        // Create JWT session token
        const sessionToken = await new SignJWT({
          userId: decodedToken.uid,
          email: decodedToken.email || '',
          role: 'user',
        })
          .setProtectedHeader({ alg: 'HS256' })
          .setIssuedAt()
          .setExpirationTime('24h')
          .sign(secret);
        
        // Set auth cookie
        response.cookies.set('auth_token', sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        });
        
        console.log('✅ Middleware: Firebase token converted to session for', decodedToken.uid);
      } catch (error) {
        console.error('❌ Middleware: Firebase token verification failed:', error);
      }
    }
  }
  
  // Handle admin routing
  if (path === '/admin' || path === '/admin/') {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/admin/:path*'
  ],
};

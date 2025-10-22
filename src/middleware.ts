import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const secret = new TextEncoder().encode(JWT_SECRET);

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
  
  // Firebase Auth: Authentication is handled client-side
  // We'll skip server-side JWT verification for now and let Firebase handle it
  // Protected routes will be checked on the client-side via FirebaseAuthContext
  
  // Only handle admin-specific routing
  const isAdminRoute = path.startsWith('/admin');
  
  // Redirect /admin to /admin/auth
  if (path === '/admin' || path === '/admin/') {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }

  // For all other routes, let client-side Firebase auth handle protection
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
};

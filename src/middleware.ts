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
    return payload as JWTPayload;
  } catch (error) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           path.startsWith('/admin') ||
                           path.startsWith('/profile-setup') ||
                           path.startsWith('/settings');

  const isAdminRoute = path.startsWith('/admin');

  const authToken = request.cookies.get('auth_token');
  let userRole: string | null = null;
  let isAuthenticated = false;

  if (authToken) {
    const decoded = await verifyToken(authToken.value);
    if (decoded) {
      isAuthenticated = true;
      userRole = decoded.role;
    }
  }

  if (isProtectedRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
    
    if (isAdminRoute && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (path === '/auth' && isAuthenticated) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/profile-setup',
    '/settings/:path*',
    '/auth'
  ],
};

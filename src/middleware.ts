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
  
  // Admin routes require admin session, not user auth
  const isAdminRoute = path.startsWith('/admin');
  const isAdminAuthPage = path === '/admin/auth';
  const isAdminDashboard = path.startsWith('/admin/dashboard') || path.startsWith('/admin/commission') || path.startsWith('/admin/settings');
  
  const isProtectedRoute = path.startsWith('/dashboard') || 
                           (isAdminRoute && !isAdminAuthPage) ||
                           path.startsWith('/profile-setup') ||
                           path.startsWith('/settings');

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

  // Handle admin routes
  if (isAdminDashboard) {
    // Check for admin session in localStorage (client-side)
    // This is validated on client-side, but we can add server-side validation if needed
    // For now, allow access and let client-side handle session validation
    return NextResponse.next();
  }

  // Redirect /admin to /admin/auth
  if (path === '/admin' || path === '/admin/') {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }

  // Protected user routes
  if (isProtectedRoute && !isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/auth', request.url));
    }
  }

  if (path === '/auth' && isAuthenticated) {
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin/auth', request.url));
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

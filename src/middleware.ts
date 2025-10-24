import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const response = NextResponse.next();
  
  // Handle admin routing
  if (path === '/admin' || path === '/admin/') {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }

  // For API routes, ensure cookies and headers are properly forwarded
  // This is especially important for AWS Amplify deployments
  if (path.startsWith('/api/')) {
    // Log for debugging (remove in production)
    if (process.env.NODE_ENV === 'production') {
      console.log('📥 API Request:', path);
      console.log('🍪 Has cookies:', !!request.cookies.get('firebase_token'));
      console.log('🔑 Has auth header:', !!request.headers.get('authorization'));
    }
    
    // Ensure cookies are preserved
    const firebaseToken = request.cookies.get('firebase_token');
    if (firebaseToken) {
      response.cookies.set('firebase_token', firebaseToken.value);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/:path*', // Add API routes to matcher
  ],
};

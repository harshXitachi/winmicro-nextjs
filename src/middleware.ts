import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Handle admin routing only
  if (path === '/admin' || path === '/admin/') {
    return NextResponse.redirect(new URL('/admin/auth', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*'
  ],
};

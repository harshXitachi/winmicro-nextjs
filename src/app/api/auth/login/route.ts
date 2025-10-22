import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Get the base URL - prefer APP_BASE_URL, fallback to request host
  const baseUrl = process.env.APP_BASE_URL || 
                  `${request.nextUrl.protocol}//${request.nextUrl.host}`;
  
  console.log('APP_BASE_URL env var:', process.env.APP_BASE_URL);
  console.log('Request host:', `${request.nextUrl.protocol}//${request.nextUrl.host}`);
  console.log('Final baseUrl used:', baseUrl);
  console.log('Login redirect URL:', `${baseUrl}/api/auth/callback`);
  
  const loginUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`);
  loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  loginUrl.searchParams.set('response_type', 'code');
  loginUrl.searchParams.set('redirect_uri', `${baseUrl}/api/auth/callback`);
  loginUrl.searchParams.set('scope', 'openid profile email');
  loginUrl.searchParams.set('state', Math.random().toString(36).substring(7));
  
  return NextResponse.redirect(loginUrl);
}

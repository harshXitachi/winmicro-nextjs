import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const loginUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`);
  loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  loginUrl.searchParams.set('response_type', 'code');
  loginUrl.searchParams.set('redirect_uri', `${process.env.APP_BASE_URL}/api/auth/callback`);
  loginUrl.searchParams.set('scope', 'openid profile email');
  loginUrl.searchParams.set('state', Math.random().toString(36).substring(7));
  
  return NextResponse.redirect(loginUrl);
}

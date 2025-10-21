import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  // Clear session cookie and redirect to Auth0 logout
  const logoutUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/v2/logout`);
  logoutUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
  logoutUrl.searchParams.set('returnTo', `${process.env.APP_BASE_URL}`);
  
  const response = NextResponse.redirect(logoutUrl);
  response.cookies.delete('auth_token');
  
  return response;
}

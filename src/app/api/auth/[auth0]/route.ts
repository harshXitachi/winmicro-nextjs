import { NextRequest, NextResponse } from 'next/server';

// This route handles Auth0 authentication endpoints
// For now, redirect to the main auth endpoints
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  // Extract the auth0 action from the dynamic segment
  const segments = pathname.split('/');
  const action = segments[segments.length - 1];
  
  switch (action) {
    case 'login':
      // Redirect to Auth0 login
      const loginUrl = new URL(`https://${process.env.AUTH0_DOMAIN}/authorize`);
      loginUrl.searchParams.set('client_id', process.env.AUTH0_CLIENT_ID!);
      loginUrl.searchParams.set('response_type', 'code');
      loginUrl.searchParams.set('redirect_uri', `${process.env.AUTH0_BASE_URL}/api/auth/callback`);
      loginUrl.searchParams.set('scope', 'openid profile email');
      return NextResponse.redirect(loginUrl);
      
    case 'logout':
      // Clear session and redirect to Auth0 logout
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
      
    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
}

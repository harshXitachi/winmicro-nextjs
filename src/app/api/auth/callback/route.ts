import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { generateToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.redirect(new URL('/auth?error=no_code', request.url));
    }

    // Get the base URL from environment or request headers
    const baseUrl = process.env.APP_BASE_URL || 
                    process.env.AUTH0_BASE_URL || 
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Exchange code for tokens
    const tokenResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: `${baseUrl}/api/auth/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', await tokenResponse.text());
      return NextResponse.redirect(new URL('/auth?error=token_exchange_failed', request.url));
    }

    const tokens = await tokenResponse.json();
    
    // Get user info
    const userInfoResponse = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(new URL('/auth?error=userinfo_failed', request.url));
    }

    const auth0User = await userInfoResponse.json();
    
    // Check if user exists in our database
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, auth0User.email),
    });

    let userId: string;
    
    if (!existingUser) {
      // Create new user
      const [newUser] = await db.insert(users).values({
        email: auth0User.email,
        password: '', // Auth0 users don't have password
        first_name: auth0User.given_name || auth0User.name?.split(' ')[0] || '',
        last_name: auth0User.family_name || auth0User.name?.split(' ')[1] || '',
        role: 'user',
      }).returning();

      // Create profile for new user
      await db.insert(profiles).values({
        user_id: newUser.id,
        avatar_url: auth0User.picture || null,
      });

      userId = newUser.id;
      console.log('New user created from Auth0:', userId);
    } else {
      userId = existingUser.id;
      console.log('Existing user logged in:', userId);
    }

    // Generate our own JWT token
    const token = await generateToken({
      userId,
      email: auth0User.email,
      role: existingUser?.role || 'user',
    });

    // Set auth cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL('/dashboard', request.url));
    const cookie = setAuthCookie(token);
    response.cookies.set(cookie);
    
    return response;
  } catch (error: any) {
    console.error('Auth0 callback error:', error);
    return NextResponse.redirect(new URL('/auth?error=callback_failed', request.url));
  }
}

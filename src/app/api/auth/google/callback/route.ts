import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { generateToken, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import { verifyGoogleToken } from '@/lib/google-auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Verify Google token
    const googlePayload = await verifyGoogleToken(idToken);
    if (!googlePayload) {
      return NextResponse.json(
        { error: 'Invalid Google token' },
        { status: 401 }
      );
    }

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, googlePayload.email),
    });

    if (existingUser) {
      // Existing user - generate token and redirect to dashboard
      const token = await generateToken({
        userId: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
      });

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
        user: {
          id: existingUser.id,
          email: existingUser.email,
          first_name: existingUser.first_name,
          last_name: existingUser.last_name,
          role: existingUser.role,
        },
      });

      const cookie = setAuthCookie(token);
      response.cookies.set(cookie);

      return response;
    }

    // New user - create account and return flag for profile setup
    const [newUser] = await db.insert(users).values({
      email: googlePayload.email,
      password: '', // No password for OAuth users
      first_name: googlePayload.given_name || '',
      last_name: googlePayload.family_name || '',
      role: 'user',
    }).returning();

    // Generate temporary token for new user
    const token = await generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      success: true,
      isNewUser: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
      profileImage: googlePayload.picture,
    });

    const cookie = setAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error: any) {
    console.error('Google callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed', details: error?.message },
      { status: 500 }
    );
  }
}

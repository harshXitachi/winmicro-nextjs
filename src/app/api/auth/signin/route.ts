import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user profile
    const [userProfile] = await db.select().from(profiles).where(eq(profiles.user_id, user.id)).limit(1);

    // Generate JWT token
    const token = await generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        created_at: user.created_at,
      },
      profile: userProfile || null,
    });

    const cookie = setAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    );
  }
}

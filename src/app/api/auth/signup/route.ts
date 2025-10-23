import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, first_name, last_name } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Generate a unique ID for the user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Create user
    const newUserResult = await db.insert(users).values({
      id: userId,
      email,
      password: hashedPassword,
      first_name: first_name || '',
      last_name: last_name || '',
      role: 'user',
    }).returning();
    const newUser = newUserResult[0];

    // Create profile
    const newProfileResult = await db.insert(profiles).values({
      user_id: newUser.id,
      username: `user${Date.now()}`,
      wallet_balance: '0.00',
      response_time: 'N/A',
    }).returning();
    const newProfile = newProfileResult[0];

    // Generate JWT token
    const token = await generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        user_metadata: {
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
        },
        created_at: newUser.created_at,
      },
      profile: newProfile,
    });

    const cookie = setAuthCookie(token);
    response.cookies.set(cookie);

    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Failed to create account', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}

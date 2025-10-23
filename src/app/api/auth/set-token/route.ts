import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json({ error: 'Token required' }, { status: 400 });
    }

    // Set the Firebase token as an httpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set('firebase_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Set token error:', error);
    return NextResponse.json({ error: 'Failed to set token' }, { status: 500 });
  }
}

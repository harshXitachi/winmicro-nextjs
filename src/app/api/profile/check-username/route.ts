import { NextRequest, NextResponse } from 'next/server';
import { db, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username exists
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });

    if (existingProfile) {
      return NextResponse.json({
        available: false,
        message: 'Username already taken',
      });
    }

    return NextResponse.json({
      available: true,
      message: 'Username is available',
    });
  } catch (error: any) {
    console.error('Username check error:', error);
    return NextResponse.json(
      { error: 'Failed to check username', details: error?.message },
      { status: 500 }
    );
  }
}

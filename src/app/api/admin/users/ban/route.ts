import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST - Ban a user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, reason, duration } = body; // duration in days, 0 = permanent

    if (!userId || !reason) {
      return NextResponse.json(
        { error: 'User ID and reason are required' },
        { status: 400 }
      );
    }

    // Calculate ban expiration
    let banExpiresAt = null;
    if (duration && duration > 0) {
      banExpiresAt = new Date();
      banExpiresAt.setDate(banExpiresAt.getDate() + duration);
    }

    // Update user ban status
    const [bannedUser] = await db
      .update(users)
      .set({
        is_banned: true,
        ban_reason: reason,
        ban_expires_at: banExpiresAt,
        banned_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!bannedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: bannedUser,
      message: `User banned ${duration > 0 ? `for ${duration} days` : 'permanently'}`,
    });
  } catch (error) {
    console.error('Ban user error:', error);
    return NextResponse.json(
      { error: 'Failed to ban user' },
      { status: 500 }
    );
  }
}

// DELETE - Unban a user
export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user to remove ban
    const [unbannedUser] = await db
      .update(users)
      .set({
        is_banned: false,
        ban_reason: null,
        ban_expires_at: null,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    if (!unbannedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: unbannedUser,
      message: 'User unbanned successfully',
    });
  } catch (error) {
    console.error('Unban user error:', error);
    return NextResponse.json(
      { error: 'Failed to unban user' },
      { status: 500 }
    );
  }
}

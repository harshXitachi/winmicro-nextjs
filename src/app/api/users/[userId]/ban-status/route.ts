import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    const users = await sql`
      SELECT is_banned, ban_reason, ban_expires_at, banned_at
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];
    
    // Check if temporary ban has expired
    let is_banned = user.is_banned;
    if (user.ban_expires_at && new Date(user.ban_expires_at) <= new Date()) {
      // Ban has expired, update user
      await sql`
        UPDATE users
        SET is_banned = FALSE,
            ban_reason = NULL,
            ban_expires_at = NULL
        WHERE id = ${userId}
      `;
      is_banned = false;
    }

    return NextResponse.json({
      is_banned,
      ban_reason: user.ban_reason,
      ban_expires_at: user.ban_expires_at,
      banned_at: user.banned_at
    });
  } catch (error) {
    console.error('Error fetching ban status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ban status' },
      { status: 500 }
    );
  }
}

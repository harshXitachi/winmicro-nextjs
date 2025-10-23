import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      // Generate random password if not provided
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10).toUpperCase() + '!@#';
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      await db
        .update(users)
        .set({
          password: hashedPassword,
          updated_at: new Date(),
        })
        .where(eq(users.id, params.userId));

      return NextResponse.json({
        success: true,
        newPassword: randomPassword,
        message: 'Password reset successfully',
      });
    } else {
      // Use provided password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await db
        .update(users)
        .set({
          password: hashedPassword,
          updated_at: new Date(),
        })
        .where(eq(users.id, params.userId));

      return NextResponse.json({
        success: true,
        message: 'Password updated successfully',
      });
    }
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

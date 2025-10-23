import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;
    
    const [profile] = await db
      .select({
        user_id: profiles.user_id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        username: profiles.username,
        avatar_url: profiles.avatar_url,
        bio: profiles.bio,
        skills: profiles.skills,
        wallet_balance: profiles.wallet_balance,
        wallet_balance_inr: profiles.wallet_balance_inr,
        wallet_balance_usd: profiles.wallet_balance_usd,
        wallet_balance_usdt: profiles.wallet_balance_usdt,
        default_currency: profiles.default_currency,
        rating: profiles.rating,
        total_earnings: profiles.total_earnings,
        completed_tasks: profiles.completed_tasks,
        success_rate: profiles.success_rate,
        response_time: profiles.response_time,
        level: profiles.level,
        experience_points: profiles.experience_points,
        created_at: profiles.created_at,
        updated_at: profiles.updated_at,
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.user_id, users.id))
      .where(eq(profiles.user_id, userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = params.userId;
    
    // Check permission
    if (userId !== currentUser.userId && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();

    const [updatedProfile] = await db
      .update(profiles)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, userId))
      .returning();

    return NextResponse.json({ profile: updatedProfile });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

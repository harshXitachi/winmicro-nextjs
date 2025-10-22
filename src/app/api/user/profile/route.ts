import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Fetch user and profile data
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, userId))
      .limit(1);

    // Combine user and profile data
    const userProfile = {
      user_id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      is_banned: user.is_banned,
      ban_reason: user.ban_reason,
      created_at: user.created_at,
      updated_at: user.updated_at,
      ...(profile && {
        username: profile.username,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        skills: profile.skills,
        rating: profile.rating,
        total_earnings: profile.total_earnings,
        completed_tasks: profile.completed_tasks,
        success_rate: profile.success_rate,
        response_time: profile.response_time,
        level: profile.level,
        experience_points: profile.experience_points,
        wallet_balance: profile.wallet_balance,
        wallet_balance_inr: profile.wallet_balance_inr,
        wallet_balance_usd: profile.wallet_balance_usd,
        wallet_balance_usdt: profile.wallet_balance_usdt,
        default_currency: profile.default_currency,
        phone: profile.phone,
        location: profile.location,
        kyc_status: profile.kyc_status,
      }),
    };

    return NextResponse.json({
      success: true,
      profile: userProfile,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

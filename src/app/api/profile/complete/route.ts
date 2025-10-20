import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      username,
      bio,
      location,
      phone,
      skills,
      profileImage,
    } = body;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    // Check username availability again
    const existingProfile = await db.query.profiles.findFirst({
      where: eq(profiles.username, username),
    });

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      );
    }

    // Update user info
    await db.update(users)
      .set({
        first_name: body.first_name || currentUser.email.split('@')[0],
        last_name: body.last_name || '',
        updated_at: new Date(),
      })
      .where(eq(users.id, currentUser.userId));

    // Create or update profile
    const existingUserProfile = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, currentUser.userId),
    });

    if (existingUserProfile) {
      // Update existing profile
      await db.update(profiles)
        .set({
          username,
          bio: bio || null,
          location: location || null,
          phone: phone || null,
          skills: skills && skills.length > 0 ? (skills as any) : null,
          avatar_url: profileImage || null,
          updated_at: new Date(),
        })
        .where(eq(profiles.id, existingUserProfile.id));
    } else {
      // Create new profile
      await db.insert(profiles).values({
        user_id: currentUser.userId,
        username,
        bio: bio || null,
        location: location || null,
        phone: phone || null,
        skills: skills && skills.length > 0 ? (skills as any) : null,
        avatar_url: profileImage || null,
        wallet_balance: '0.00',
        wallet_balance_inr: '0.00',
        wallet_balance_usd: '0.00',
        wallet_balance_usdt: '0.00',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile completed successfully',
    });
  } catch (error: any) {
    console.error('Profile completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete profile', details: error?.message },
      { status: 500 }
    );
  }
}

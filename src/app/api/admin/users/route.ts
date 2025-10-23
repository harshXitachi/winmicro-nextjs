import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, sql, desc } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET - Fetch all users
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all users with their profiles
    const allUsers = await db
      .select({
        id: users.id,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
        role: users.role,
        is_banned: users.is_banned,
        ban_reason: users.ban_reason,
        ban_expires_at: users.ban_expires_at,
        banned_at: users.banned_at,
        created_at: users.created_at,
        updated_at: users.updated_at,
        username: profiles.username,
        wallet_balance_inr: profiles.wallet_balance_inr,
        wallet_balance_usd: profiles.wallet_balance_usd,
        wallet_balance_usdt: profiles.wallet_balance_usdt,
        default_currency: profiles.default_currency,
        rating: profiles.rating,
        completed_tasks: profiles.completed_tasks,
        total_earnings: profiles.total_earnings,
        kyc_status: profiles.kyc_status,
      })
      .from(users)
      .leftJoin(profiles, eq(users.id, profiles.user_id))
      .orderBy(desc(users.created_at));

    return NextResponse.json({ users: allUsers });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user
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
    const { email, password, first_name, last_name, role = 'user' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        first_name,
        last_name,
        role,
      })
      .returning();

    // Create profile
    await db.insert(profiles).values({
      user_id: newUser.id,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Separate user and profile updates
    const userUpdates: any = {};
    const profileUpdates: any = {};

    // User table fields
    if (updates.email) userUpdates.email = updates.email;
    if (updates.first_name) userUpdates.first_name = updates.first_name;
    if (updates.last_name) userUpdates.last_name = updates.last_name;
    if (updates.role) userUpdates.role = updates.role;
    if (updates.password) {
      userUpdates.password = await bcrypt.hash(updates.password, 10);
    }
    
    // Ban/unban functionality
    if (updates.action === 'ban') {
      userUpdates.is_banned = true;
      userUpdates.ban_reason = updates.ban_reason || 'Violation of terms of service';
      userUpdates.ban_expires_at = updates.ban_expires_at || null;
      userUpdates.banned_at = new Date();
    } else if (updates.action === 'unban') {
      userUpdates.is_banned = false;
      userUpdates.ban_reason = null;
      userUpdates.ban_expires_at = null;
      userUpdates.banned_at = null;
    }

    // Profile table fields
    if (updates.username) profileUpdates.username = updates.username;
    if (updates.default_currency) profileUpdates.default_currency = updates.default_currency;

    // Update user if there are user updates
    if (Object.keys(userUpdates).length > 0) {
      userUpdates.updated_at = new Date();
      await db
        .update(users)
        .set(userUpdates)
        .where(eq(users.id, userId));
    }

    // Update profile if there are profile updates
    if (Object.keys(profileUpdates).length > 0) {
      profileUpdates.updated_at = new Date();
      await db
        .update(profiles)
        .set(profileUpdates)
        .where(eq(profiles.user_id, userId));
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

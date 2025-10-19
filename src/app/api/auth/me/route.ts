import { NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json({ user: null });
    }

    // Get full user details
    const user = await db.query.users.findFirst({
      where: eq(users.id, currentUser.userId),
    });
    
    if (!user) {
      return NextResponse.json({ user: null });
    }

    // Get user profile
    const userProfile = await db.query.profiles.findFirst({
      where: eq(profiles.user_id, user.id),
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        user_metadata: {
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
        created_at: user.created_at,
      },
      profile: userProfile || null,
    });
  } catch (error) {
    console.error('Get current user error:', error);
    return NextResponse.json({ user: null });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { uid, email, displayName, photoURL, idToken } = body;

    if (!uid || !email || !idToken) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the Firebase ID token
    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      if (decodedToken.uid !== uid) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Check if user already exists in the database
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, uid))
      .limit(1);

    let user;
    
    if (existingUser.length === 0) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          id: uid,
          email: email,
          password: '', // No password needed for Firebase auth
          first_name: displayName?.split(' ')[0] || '',
          last_name: displayName?.split(' ').slice(1).join(' ') || '',
          role: 'user',
          is_banned: false,
        })
        .returning();

      user = newUser;

      // Create user profile
      await db.insert(profiles).values({
        user_id: uid,
        avatar_url: photoURL || null,
        wallet_balance_inr: '0.00',
        wallet_balance_usd: '0.00',
        wallet_balance_usdt: '0.00',
        default_currency: 'INR',
        level: 1,
        experience_points: 0,
        completed_tasks: 0,
      });
    } else {
      user = existingUser[0];
      
      // Update user info if changed
      if (displayName || photoURL) {
        await db
          .update(users)
          .set({
            first_name: displayName?.split(' ')[0] || user.first_name,
            last_name: displayName?.split(' ').slice(1).join(' ') || user.last_name,
            updated_at: new Date(),
          })
          .where(eq(users.id, uid));

        if (photoURL) {
          await db
            .update(profiles)
            .set({
              avatar_url: photoURL,
              updated_at: new Date(),
            })
            .where(eq(profiles.user_id, uid));
        }
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { handleCallback, getSession } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';
import { db, users, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const GET = handleCallback(async (req: NextRequest, session) => {
  try {
    if (session?.user) {
      const auth0User = session.user;
      
      // Check if user exists in our database
      const existingUser = await db.query.users.findFirst({
        where: eq(users.email, auth0User.email as string),
      });

      if (!existingUser) {
        // Create new user
        const [newUser] = await db.insert(users).values({
          email: auth0User.email as string,
          password: '', // Auth0 users don't have password
          first_name: auth0User.given_name || auth0User.name?.split(' ')[0] || '',
          last_name: auth0User.family_name || auth0User.name?.split(' ')[1] || '',
          role: 'user',
        }).returning();

        // Create profile for new user
        await db.insert(profiles).values({
          user_id: newUser.id,
          avatar_url: auth0User.picture || null,
        });

        console.log('New user created from Auth0:', newUser.id);
      } else {
        console.log('Existing user logged in:', existingUser.id);
      }
    }

    return session;
  } catch (error: any) {
    console.error('Auth0 callback error:', error);
    throw error;
  }
});

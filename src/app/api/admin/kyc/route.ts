import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, users } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { eq, or } from 'drizzle-orm';

// Get all pending KYC submissions
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all pending KYC submissions
    const pendingKYCs = await db
      .select({
        user_id: profiles.user_id,
        username: profiles.username,
        avatar_url: profiles.avatar_url,
        kyc_status: profiles.kyc_status,
        kyc_document_type: profiles.kyc_document_type,
        kyc_document_url: profiles.kyc_document_url,
        email: users.email,
        first_name: users.first_name,
        last_name: users.last_name,
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.user_id, users.id))
      .where(or(eq(profiles.kyc_status, 'pending'), eq(profiles.kyc_status, 'rejected')));

    return NextResponse.json({ data: pendingKYCs });
  } catch (error) {
    console.error('Get pending KYC error:', error);
    return NextResponse.json({ error: 'Failed to fetch KYC submissions' }, { status: 500 });
  }
}

// Verify or reject KYC
export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { user_id, status, rejection_reason } = body;

    if (!user_id || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updateData: any = {
      kyc_status: status,
    };

    if (status === 'verified') {
      updateData.kyc_verified_at = new Date();
    } else if (status === 'rejected') {
      updateData.kyc_rejection_reason = rejection_reason || 'Document verification failed';
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.user_id, user_id))
      .returning();

    return NextResponse.json({ 
      data: updatedProfile,
      message: `KYC ${status === 'verified' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('KYC verification error:', error);
    return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 });
  }
}

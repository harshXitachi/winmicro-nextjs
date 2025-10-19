import { NextRequest, NextResponse } from 'next/server';
import { db, profiles } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Submit KYC documentation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { document_type, document_data } = body;

    if (!document_type || !document_data) {
      return NextResponse.json({ error: 'Document type and data are required' }, { status: 400 });
    }

    // Update profile with KYC submission
    const [updatedProfile] = await db
      .update(profiles)
      .set({
        kyc_document_type: document_type,
        kyc_document_url: document_data,
        kyc_status: 'pending',
        kyc_submitted_at: new Date(),
      })
      .where(eq(profiles.user_id, payload.userId))
      .returning();

    return NextResponse.json({ 
      data: updatedProfile,
      message: 'KYC documents submitted successfully. Verification usually takes 24-48 hours.'
    });
  } catch (error) {
    console.error('KYC submission error:', error);
    return NextResponse.json({ error: 'Failed to submit KYC' }, { status: 500 });
  }
}

// Get KYC status
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

    const [profile] = await db
      .select({
        kyc_status: profiles.kyc_status,
        kyc_document_type: profiles.kyc_document_type,
        kyc_submitted_at: profiles.kyc_submitted_at,
        kyc_verified_at: profiles.kyc_verified_at,
      })
      .from(profiles)
      .where(eq(profiles.user_id, payload.userId))
      .limit(1);

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Get KYC status error:', error);
    return NextResponse.json({ error: 'Failed to fetch KYC status' }, { status: 500 });
  }
}

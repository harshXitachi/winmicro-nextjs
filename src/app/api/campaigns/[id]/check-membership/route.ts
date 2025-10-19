import { NextRequest, NextResponse } from 'next/server';
import { db, campaign_members, campaigns } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

// GET /api/campaigns/[id]/check-membership - Check if user is a member
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { isMember: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;

    // Check if user is an active member
    const [member] = await db.select()
      .from(campaign_members)
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, currentUser.userId),
          eq(campaign_members.status, 'active')
        )
      );

    // Also check if user is the employer
    const [campaign] = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    const isEmployer = campaign?.employer_id === currentUser.userId;

    return NextResponse.json({ 
      isMember: !!member,
      isEmployer: isEmployer,
      member: member || null,
      userId: currentUser.userId
    });
  } catch (error) {
    console.error('Check membership error:', error);
    return NextResponse.json(
      { isMember: false, error: 'Failed to check membership' },
      { status: 500 }
    );
  }
}

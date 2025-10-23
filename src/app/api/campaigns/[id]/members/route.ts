import { NextRequest, NextResponse } from 'next/server';
import { db, campaigns, campaign_members, users, profiles, campaign_chat_messages } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/campaigns/[id]/members - Get campaign members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;

    // Get members with user details
    const members = await db.select({
      id: campaign_members.id,
      campaign_id: campaign_members.campaign_id,
      user_id: campaign_members.user_id,
      role: campaign_members.role,
      status: campaign_members.status,
      tasks_completed: campaign_members.tasks_completed,
      total_earned: campaign_members.total_earned,
      joined_at: campaign_members.joined_at,
      left_at: campaign_members.left_at,
      user_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown User')`,
      user_email: users.email,
      username: profiles.username,
      avatar_url: profiles.avatar_url,
      success_rate: profiles.success_rate,
    })
    .from(campaign_members)
    .leftJoin(users, eq(campaign_members.user_id, users.id))
    .leftJoin(profiles, eq(campaign_members.user_id, profiles.user_id))
    .where(
      and(
        eq(campaign_members.campaign_id, campaignId),
        eq(campaign_members.status, 'active')
      )
    );

    return NextResponse.json({ members });
  } catch (error) {
    console.error('Get campaign members error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign members' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/members - Join campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;

    // Get campaign details
    const [campaign] = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Campaign is not active' },
        { status: 400 }
      );
    }

    if (campaign.current_workers >= campaign.target_workers) {
      return NextResponse.json(
        { error: 'Campaign is full' },
        { status: 400 }
      );
    }

    // Check if already a member
    const [existingMember] = await db.select()
      .from(campaign_members)
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, currentUser.userId)
        )
      );

    if (existingMember) {
      return NextResponse.json(
        { error: 'Already a member of this campaign' },
        { status: 400 }
      );
    }

    // Add as member
    const [newMember] = await db.insert(campaign_members).values({
      campaign_id: campaignId,
      user_id: currentUser.userId,
      role: 'worker',
      status: 'active',
      tasks_completed: 0,
      total_earned: '0.00',
    }).returning();

    // Update campaign current_workers count
    await db.update(campaigns)
      .set({
        current_workers: sql`${campaigns.current_workers} + 1`,
        updated_at: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    // Add system message to group chat
    if (campaign.group_chat_enabled) {
      const [userProfile] = await db.select()
        .from(users)
        .where(eq(users.id, currentUser.userId));

      const userName = userProfile 
        ? `${userProfile.first_name} ${userProfile.last_name}`.trim() 
        : 'A new worker';

      await db.insert(campaign_chat_messages).values({
        campaign_id: campaignId,
        sender_id: currentUser.userId,
        content: `${userName} joined the campaign!`,
        message_type: 'system',
      });
    }

    return NextResponse.json({ member: newMember });
  } catch (error) {
    console.error('Join campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to join campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id]/members?userId=xxx - Remove member (employer only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const campaignId = params.id;
    const searchParams = request.nextUrl.searchParams;
    const userIdToRemove = searchParams.get('userId');

    if (!userIdToRemove) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Verify campaign ownership
    const [campaign] = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    if (campaign.employer_id !== currentUser.userId) {
      return NextResponse.json(
        { error: 'Forbidden: Only the campaign owner can remove members' },
        { status: 403 }
      );
    }

    // Update member status to 'removed'
    await db.update(campaign_members)
      .set({
        status: 'removed',
        left_at: new Date(),
      })
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, userIdToRemove)
        )
      );

    // Update campaign current_workers count
    await db.update(campaigns)
      .set({
        current_workers: sql`${campaigns.current_workers} - 1`,
        updated_at: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove member error:', error);
    return NextResponse.json(
      { error: 'Failed to remove member' },
      { status: 500 }
    );
  }
}

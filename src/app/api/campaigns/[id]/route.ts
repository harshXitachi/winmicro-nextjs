import { NextRequest, NextResponse } from 'next/server';
import { db, campaigns, campaign_members, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, sql } from 'drizzle-orm';

// GET /api/campaigns/[id] - Get campaign details
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

    // Get campaign with employer details
    const [campaign] = await db.select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      type: campaigns.type,
      category: campaigns.category,
      required_skills: campaigns.required_skills,
      target_workers: campaigns.target_workers,
      current_workers: campaigns.current_workers,
      base_payment: campaigns.base_payment,
      currency: campaigns.currency,
      payment_model: campaigns.payment_model,
      visibility: campaigns.visibility,
      group_chat_enabled: campaigns.group_chat_enabled,
      status: campaigns.status,
      employer_id: campaigns.employer_id,
      escrow_balance: campaigns.escrow_balance,
      total_spent: campaigns.total_spent,
      created_at: campaigns.created_at,
      updated_at: campaigns.updated_at,
      employer_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown Employer')`,
      employer_email: users.email,
    })
    .from(campaigns)
    .leftJoin(users, eq(campaigns.employer_id, users.id))
    .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Check if user is a member or employer
    const [membership] = await db.select()
      .from(campaign_members)
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, currentUser.userId)
        )
      );

    return NextResponse.json({ 
      campaign,
      membership: membership || null,
      isEmployer: campaign.employer_id === currentUser.userId,
    });
  } catch (error) {
    console.error('Get campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[id] - Update campaign
export async function PATCH(
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
    const body = await request.json();

    // Verify ownership
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
        { error: 'Forbidden: You are not the campaign owner' },
        { status: 403 }
      );
    }

    // Update campaign
    const [updatedCampaign] = await db.update(campaigns)
      .set({
        ...body,
        updated_at: new Date(),
      })
      .where(eq(campaigns.id, campaignId))
      .returning();

    return NextResponse.json({ campaign: updatedCampaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to update campaign' },
      { status: 500 }
    );
  }
}

// DELETE /api/campaigns/[id] - Delete campaign
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

    // Verify ownership
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
        { error: 'Forbidden: You are not the campaign owner' },
        { status: 403 }
      );
    }

    // Delete campaign (cascade will handle related records)
    await db.delete(campaigns)
      .where(eq(campaigns.id, campaignId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete campaign error:', error);
    return NextResponse.json(
      { error: 'Failed to delete campaign' },
      { status: 500 }
    );
  }
}

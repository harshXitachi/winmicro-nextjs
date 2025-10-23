import { NextRequest, NextResponse } from 'next/server';
import { db, campaign_submissions, campaign_members, campaigns, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/campaigns/[id]/submissions - Get submissions
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
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get('status');

    // Get campaign to check ownership
    const [campaign] = await db.select()
      .from(campaigns)
      .where(eq(campaigns.id, campaignId));

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    const isEmployer = campaign.employer_id === currentUser.userId;

    // Build query conditions
    const conditions = [eq(campaign_submissions.campaign_id, campaignId)];
    
    if (!isEmployer) {
      // Workers can only see their own submissions
      conditions.push(eq(campaign_submissions.worker_id, currentUser.userId));
    }

    if (statusFilter) {
      conditions.push(eq(campaign_submissions.status, statusFilter));
    }

    // Get submissions with worker details
    const submissions = await db.select({
      id: campaign_submissions.id,
      campaign_id: campaign_submissions.campaign_id,
      worker_id: campaign_submissions.worker_id,
      proof_url: campaign_submissions.proof_url,
      description: campaign_submissions.description,
      status: campaign_submissions.status,
      review_note: campaign_submissions.review_note,
      reviewed_by: campaign_submissions.reviewed_by,
      reviewed_at: campaign_submissions.reviewed_at,
      created_at: campaign_submissions.created_at,
      worker_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown Worker')`,
      worker_username: profiles.username,
    })
    .from(campaign_submissions)
    .leftJoin(users, eq(campaign_submissions.worker_id, users.id))
    .leftJoin(profiles, eq(campaign_submissions.worker_id, profiles.user_id))
    .where(and(...conditions))
    .orderBy(desc(campaign_submissions.created_at));

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/submissions - Submit work
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
    const body = await request.json();
    const { proof_url, description } = body;

    // Verify user is a member
    const [membership] = await db.select()
      .from(campaign_members)
      .where(
        and(
          eq(campaign_members.campaign_id, campaignId),
          eq(campaign_members.user_id, currentUser.userId),
          eq(campaign_members.status, 'active')
        )
      );

    if (!membership) {
      return NextResponse.json(
        { error: 'Forbidden: You are not a member of this campaign' },
        { status: 403 }
      );
    }

    // Create submission
    const [newSubmission] = await db.insert(campaign_submissions).values({
      campaign_id: campaignId,
      worker_id: currentUser.userId,
      proof_url,
      description,
      status: 'pending',
    }).returning();

    return NextResponse.json({ submission: newSubmission });
  } catch (error) {
    console.error('Submit work error:', error);
    return NextResponse.json(
      { error: 'Failed to submit work' },
      { status: 500 }
    );
  }
}

// PATCH /api/campaigns/[id]/submissions?submissionId=xxx - Review submission (employer only)
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
    const searchParams = request.nextUrl.searchParams;
    const submissionId = searchParams.get('submissionId');
    const body = await request.json();
    const { status, review_note } = body;

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Missing submissionId parameter' },
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
        { error: 'Forbidden: Only the campaign owner can review submissions' },
        { status: 403 }
      );
    }

    // Update submission
    const [updatedSubmission] = await db.update(campaign_submissions)
      .set({
        status,
        review_note,
        reviewed_by: currentUser.userId,
        reviewed_at: new Date(),
      })
      .where(eq(campaign_submissions.id, submissionId))
      .returning();

    // If approved, update member's tasks_completed
    if (status === 'approved') {
      const submission = updatedSubmission;
      await db.update(campaign_members)
        .set({
          tasks_completed: sql`${campaign_members.tasks_completed} + 1`,
        })
        .where(
          and(
            eq(campaign_members.campaign_id, campaignId),
            eq(campaign_members.user_id, submission.worker_id)
          )
        );
    }

    return NextResponse.json({ submission: updatedSubmission });
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json(
      { error: 'Failed to review submission' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db, campaign_chat_messages, campaign_members, campaigns, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql } from 'drizzle-orm';

// GET /api/campaigns/[id]/chat - Get chat messages
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
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Get messages with sender details
    const messages = await db.select({
      id: campaign_chat_messages.id,
      campaign_id: campaign_chat_messages.campaign_id,
      sender_id: campaign_chat_messages.sender_id,
      content: campaign_chat_messages.content,
      message_type: campaign_chat_messages.message_type,
      metadata: campaign_chat_messages.metadata,
      is_pinned: campaign_chat_messages.is_pinned,
      created_at: campaign_chat_messages.created_at,
      sender_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown User')`,
    })
    .from(campaign_chat_messages)
    .leftJoin(users, eq(campaign_chat_messages.sender_id, users.id))
    .where(eq(campaign_chat_messages.campaign_id, campaignId))
    .orderBy(desc(campaign_chat_messages.created_at))
    .limit(limit);

    return NextResponse.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns/[id]/chat - Send message
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
    const { content } = body;

    if (!content || content.trim() === '') {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    // Verify user is an active member
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

    // Create message
    const [newMessage] = await db.insert(campaign_chat_messages).values({
      campaign_id: campaignId,
      sender_id: currentUser.userId,
      content: content.trim(),
      message_type: 'text',
    }).returning();

    return NextResponse.json({ message: newMessage });
  } catch (error) {
    console.error('Send chat message error:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

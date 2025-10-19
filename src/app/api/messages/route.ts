import { NextRequest, NextResponse } from 'next/server';
import { db, messages, users, profiles } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { eq, or, desc } from 'drizzle-orm';

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

    const userId = payload.userId;

    // Get all messages for the user
    const allMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          eq(messages.sender_id, userId),
          eq(messages.recipient_id, userId)
        )
      )
      .orderBy(desc(messages.created_at));

    // Group messages by conversation
    const conversationsMap = new Map();

    for (const message of allMessages) {
      const otherUserId = message.sender_id === userId ? message.recipient_id : message.sender_id;
      
      if (!conversationsMap.has(otherUserId)) {
        // Get other user's profile
        const [otherUserProfile] = await db
          .select({
            user_id: profiles.user_id,
            first_name: users.first_name,
            last_name: users.last_name,
            username: profiles.username,
            avatar_url: profiles.avatar_url,
          })
          .from(profiles)
          .leftJoin(users, eq(profiles.user_id, users.id))
          .where(eq(profiles.user_id, otherUserId))
          .limit(1);

        conversationsMap.set(otherUserId, {
          id: otherUserId,
          other_user_id: otherUserId,
          other_user_name: otherUserProfile 
            ? `${otherUserProfile.first_name} ${otherUserProfile.last_name}`
            : 'Unknown User',
          other_user_username: otherUserProfile?.username || 'unknown',
          other_user_avatar: otherUserProfile?.avatar_url || null,
          messages: [],
          last_message: null,
          unread_count: 0,
        });
      }

      const conversation = conversationsMap.get(otherUserId);
      conversation.messages.push(message);
      
      if (!conversation.last_message || new Date(message.created_at) > new Date(conversation.last_message.created_at)) {
        conversation.last_message = message;
      }
      
      if (!message.read && message.recipient_id === userId) {
        conversation.unread_count++;
      }
    }

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({ data: conversations });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

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
    const { recipient_id, task_id, application_id, content, message_type, payment_amount, metadata } = body;

    if (!recipient_id || !content) {
      return NextResponse.json({ error: 'Recipient and content are required' }, { status: 400 });
    }

    const [newMessage] = await db.insert(messages).values({
      sender_id: payload.userId,
      recipient_id,
      task_id: task_id || null,
      application_id: application_id || null,
      content,
      message_type: message_type || 'text',
      payment_amount: payment_amount || null,
      payment_status: payment_amount ? 'pending' : null,
      metadata: metadata || null,
      read: false,
      delivered: true,
    }).returning();

    return NextResponse.json({ data: newMessage });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

// Mark message as read
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

    const body = await request.json();
    const { message_id } = body;

    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, message_id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Mark message as read error:', error);
    return NextResponse.json({ error: 'Failed to mark message as read' }, { status: 500 });
  }
}

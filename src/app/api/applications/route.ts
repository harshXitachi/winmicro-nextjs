import { NextRequest, NextResponse } from 'next/server';
import { db, applications, tasks, users, profiles, messages, wallet_transactions } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

// GET - Get applications for a user
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

    const { searchParams } = new URL(request.url);
    const freelancer_id = searchParams.get('freelancer_id');
    const task_id = searchParams.get('task_id');

    let query = db.select().from(applications);

    if (freelancer_id) {
      query = query.where(eq(applications.freelancer_id, freelancer_id)) as any;
    } else if (task_id) {
      query = query.where(eq(applications.task_id, task_id)) as any;
    }

    const userApplications = await query.orderBy(desc(applications.created_at));

    // Get task details for each application
    const applicationsWithTasks = await Promise.all(
      userApplications.map(async (app: any) => {
        const [task] = await db
          .select()
          .from(tasks)
          .where(eq(tasks.id, app.task_id))
          .limit(1);

        const [client] = await db
          .select({
            first_name: users.first_name,
            last_name: users.last_name,
          })
          .from(users)
          .where(eq(users.id, task.client_id))
          .limit(1);

        return {
          ...app,
          task: {
            ...task,
            client_name: client ? `${client.first_name} ${client.last_name}` : 'Unknown',
          },
        };
      })
    );

    return NextResponse.json({ data: applicationsWithTasks });
  } catch (error) {
    console.error('Get applications error:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST - Create new application
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
    const { task_id, cover_letter, proposed_budget, estimated_duration } = body;

    // Get task details
    const [task] = await db.select().from(tasks).where(eq(tasks.id, task_id)).limit(1);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get freelancer profile
    const [freelancerProfile] = await db
      .select({
        first_name: users.first_name,
        last_name: users.last_name,
        username: profiles.username,
        avatar_url: profiles.avatar_url,
      })
      .from(profiles)
      .leftJoin(users, eq(profiles.user_id, users.id))
      .where(eq(profiles.user_id, payload.userId))
      .limit(1);

    // Create application
    const [newApplication] = await db
      .insert(applications)
      .values({
        task_id,
        freelancer_id: payload.userId,
        cover_letter,
        proposed_budget,
        estimated_duration,
        status: 'pending',
      })
      .returning();

    // Update task applications count
    await db
      .update(tasks)
      .set({ applications_count: (task.applications_count ?? 0) + 1 })
      .where(eq(tasks.id, task_id));

    // Send application message to client
    const messageContent = JSON.stringify({
      type: 'application',
      application_id: newApplication.id,
      task_id: task.id,
      task_title: task.title,
      freelancer_name: `${freelancerProfile.first_name} ${freelancerProfile.last_name}`,
      freelancer_username: freelancerProfile.username,
      freelancer_avatar: freelancerProfile.avatar_url,
      proposed_budget,
      estimated_duration,
      cover_letter,
      status: 'pending',
    });

    await db.insert(messages).values({
      sender_id: payload.userId,
      recipient_id: task.client_id,
      task_id: task.id,
      application_id: newApplication.id,
      content: messageContent,
      message_type: 'application',
      read: false,
      delivered: true,
    });

    return NextResponse.json({ data: newApplication });
  } catch (error) {
    console.error('Create application error:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}

// PATCH - Update application status (accept/reject)
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
    const { application_id, status } = body;

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get application details
    const [application] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, application_id))
      .limit(1);

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Get task details
    const [task] = await db.select().from(tasks).where(eq(tasks.id, application.task_id)).limit(1);
    
    // Verify the current user is the task owner
    if (task.client_id !== payload.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update application status
    await db
      .update(applications)
      .set({ status, updated_at: new Date() })
      .where(eq(applications.id, application_id));

    // Update the original application message to include the new status
    const [originalMessage] = await db
      .select()
      .from(messages)
      .where(
        and(
          eq(messages.application_id, application_id),
          eq(messages.message_type, 'application')
        )
      )
      .limit(1);

    if (originalMessage) {
      try {
        const messageData = JSON.parse(originalMessage.content);
        messageData.status = status;
        await db
          .update(messages)
          .set({ content: JSON.stringify(messageData) })
          .where(eq(messages.id, originalMessage.id));
      } catch (e) {
        console.error('Failed to update message status:', e);
      }
    }

    // If accepted, update task status and assign freelancer
    if (status === 'accepted') {
      await db
        .update(tasks)
        .set({ 
          freelancer_id: application.freelancer_id,
          status: 'in_progress',
          updated_at: new Date()
        })
        .where(eq(tasks.id, application.task_id));
    }

    // Send notification message to freelancer
    const notificationContent = JSON.stringify({
      type: 'application_response',
      application_id: application.id,
      task_id: task.id,
      task_title: task.title,
      status,
      message: status === 'accepted' 
        ? 'Congratulations! Your application has been accepted. You can now start working on this task.'
        : 'Your application has been reviewed. Unfortunately, it was not selected this time.',
    });

    await db.insert(messages).values({
      sender_id: task.client_id,
      recipient_id: application.freelancer_id,
      task_id: task.id,
      application_id: application.id,
      content: notificationContent,
      message_type: 'application_response',
      read: false,
      delivered: true,
    });

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Update application status error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

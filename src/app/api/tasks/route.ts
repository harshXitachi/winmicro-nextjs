import { NextRequest, NextResponse } from 'next/server';
import { db, tasks, applications, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql, ilike, or, gte, lte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET /api/tasks - Get all tasks with optional filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const budget_min = searchParams.get('budget_min');
    const budget_max = searchParams.get('budget_max');
    const statusParam = searchParams.get('status');
    const status = statusParam === '' ? null : (statusParam || 'open');
    const client_id = searchParams.get('client_id');

    let query = db.select({
      id: tasks.id,
      title: tasks.title,
      description: tasks.description,
      category: tasks.category,
      budget: tasks.budget,
      deadline: tasks.deadline,
      status: tasks.status,
      priority: tasks.priority,
      client_id: tasks.client_id,
      freelancer_id: tasks.freelancer_id,
      skills_required: tasks.skills_required,
      applications_count: tasks.applications_count,
      created_at: tasks.created_at,
      updated_at: tasks.updated_at,
      client_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown User')`,
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.client_id, users.id))
    .orderBy(desc(tasks.created_at));

    // Apply filters
    const conditions = [];
    
    if (status) {
      conditions.push(eq(tasks.status, status));
    }
    
    if (client_id) {
      conditions.push(eq(tasks.client_id, client_id));
    }
    
    if (category && category !== 'all') {
      conditions.push(eq(tasks.category, category));
    }
    
    if (budget_min) {
      conditions.push(gte(tasks.budget, budget_min));
    }
    
    if (budget_max) {
      conditions.push(lte(tasks.budget, budget_max));
    }
    
    if (search) {
      conditions.push(
        or(
          ilike(tasks.title, `%${search}%`),
          ilike(tasks.description, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    const result = await query;

    return NextResponse.json({ tasks: result });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      budget,
      deadline,
      priority,
      skills_required,
    } = body;

    // Validation
    if (!title || !description || !category || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newTask] = await db.insert(tasks).values({
      title,
      description,
      category,
      budget: budget.toString(),
      deadline: deadline ? new Date(deadline) : null,
      priority: priority || 'medium',
      client_id: currentUser.userId,
      skills_required: skills_required || [],
      status: 'open',
    }).returning();

    return NextResponse.json({ task: newTask });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Failed to create task' },
      { status: 500 }
    );
  }
}

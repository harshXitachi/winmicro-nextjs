import { NextRequest, NextResponse } from 'next/server';
import { db, campaigns, campaign_members, users, profiles } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, sql, ilike, or, gte } from 'drizzle-orm';

// GET /api/campaigns - Get campaigns with optional filters
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role'); // 'employer' or 'worker'
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'active';
    const visibility = searchParams.get('visibility');

    if (role === 'employer') {
      // Get campaigns created by this user
      const employerCampaigns = await db.select({
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
      })
      .from(campaigns)
      .where(
        and(
          eq(campaigns.employer_id, currentUser.userId),
          status ? eq(campaigns.status, status) : undefined
        )
      )
      .orderBy(desc(campaigns.created_at));

      return NextResponse.json({ campaigns: employerCampaigns });
    } else {
      // Get public campaigns for workers
      const conditions = [eq(campaigns.visibility, 'public')];
      
      if (status) {
        conditions.push(eq(campaigns.status, status));
      }
      
      if (category && category !== 'all') {
        conditions.push(eq(campaigns.category, category));
      }
      
      if (search) {
        conditions.push(
          or(
            ilike(campaigns.name, `%${search}%`),
            ilike(campaigns.description, `%${search}%`)
          )
        );
      }

      const workerCampaigns = await db.select({
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
        group_chat_enabled: campaigns.group_chat_enabled,
        status: campaigns.status,
        employer_id: campaigns.employer_id,
        created_at: campaigns.created_at,
        employer_name: sql<string>`COALESCE(CONCAT(${users.first_name}, ' ', ${users.last_name}), 'Unknown Employer')`,
      })
      .from(campaigns)
      .leftJoin(users, eq(campaigns.employer_id, users.id))
      .where(and(...conditions))
      .orderBy(desc(campaigns.created_at));

      return NextResponse.json({ campaigns: workerCampaigns });
    }
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
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
      name,
      description,
      type,
      category,
      required_skills,
      target_workers,
      base_payment,
      currency,
      payment_model,
      visibility,
      group_chat_enabled,
      initial_deposit,
    } = body;

    // Validation
    if (!name || !description || !type || !category || !target_workers || !base_payment) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (type !== 'one-off' && type !== 'ongoing') {
      return NextResponse.json(
        { error: 'Invalid campaign type' },
        { status: 400 }
      );
    }

    // Calculate required escrow (base_payment * target_workers)
    const requiredEscrow = parseFloat(base_payment) * target_workers;
    
    // TODO: In production, verify user has sufficient wallet balance
    // For now, we'll assume the initial_deposit is provided

    const [newCampaign] = await db.insert(campaigns).values({
      name,
      description,
      type,
      category,
      required_skills: required_skills || [],
      target_workers,
      base_payment: base_payment.toString(),
      currency: currency || 'INR',
      payment_model: payment_model || 'fixed',
      visibility: visibility || 'public',
      group_chat_enabled: group_chat_enabled !== false,
      status: 'active',
      employer_id: currentUser.userId,
      escrow_balance: initial_deposit ? initial_deposit.toString() : '0.00',
      total_spent: '0.00',
    }).returning();

    // Add employer as admin member
    await db.insert(campaign_members).values({
      campaign_id: newCampaign.id,
      user_id: currentUser.userId,
      role: 'admin',
      status: 'active',
      tasks_completed: 0,
      total_earned: '0.00',
    });

    return NextResponse.json({ campaign: newCampaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    // Return more detailed error information
    const errorMessage = error instanceof Error ? error.message : 'Failed to create campaign';
    return NextResponse.json(
      { error: 'Failed to create campaign', details: errorMessage },
      { status: 500 }
    );
  }
}

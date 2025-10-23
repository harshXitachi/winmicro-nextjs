import { NextRequest, NextResponse } from 'next/server';
import { db, wallet_transactions, users } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

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
    const userId = searchParams.get('userId');

    let transactions;

    if (currentUser.role === 'admin' && !userId) {
      // Admin can see all transactions
      transactions = await db
        .select({
          id: wallet_transactions.id,
          user_id: wallet_transactions.user_id,
          amount: wallet_transactions.amount,
          type: wallet_transactions.type,
          transaction_type: wallet_transactions.transaction_type,
          description: wallet_transactions.description,
          status: wallet_transactions.status,
          reference_id: wallet_transactions.reference_id,
          created_at: wallet_transactions.created_at,
          user_email: users.email,
          user_name: sql<string>`CONCAT(${users.first_name}, ' ', ${users.last_name})`,
        })
        .from(wallet_transactions)
        .leftJoin(users, eq(wallet_transactions.user_id, users.id))
        .orderBy(desc(wallet_transactions.created_at))
        .limit(100);
    } else {
      // Regular users can only see their own transactions
      const targetUserId = userId || currentUser.userId;
      
      if (targetUserId !== currentUser.userId && currentUser.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        );
      }

      transactions = await db
        .select()
        .from(wallet_transactions)
        .where(eq(wallet_transactions.user_id, targetUserId))
        .orderBy(desc(wallet_transactions.created_at));
    }

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

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
    const { amount, type, transaction_type, description, reference_id } = body;

    const [newTransaction] = await db.insert(wallet_transactions).values({
      user_id: currentUser.userId,
      amount: amount.toString(),
      type,
      transaction_type,
      description,
      reference_id,
      status: 'completed',
    }).returning();

    return NextResponse.json({ transaction: newTransaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}

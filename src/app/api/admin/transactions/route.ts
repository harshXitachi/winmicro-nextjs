import { NextRequest, NextResponse } from 'next/server';
import { db, wallet_transactions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all transactions
    const allTransactions = await db
      .select()
      .from(wallet_transactions)
      .orderBy(desc(wallet_transactions.created_at))
      .limit(100); // Limit to last 100 transactions

    return NextResponse.json({ transactions: allTransactions });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

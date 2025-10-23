import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, wallet_transactions, profiles } from '@/lib/db';
import { eq, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/withdraw-inr
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, bankAccountNumber, ifscCode, accountHolderName } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!bankAccountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json({ error: 'Missing bank details' }, { status: 400 });
    }

    // Get user profile
    const [profile] = await db.select()
      .from(profiles)
      .where(eq(profiles.user_id, currentUser.userId));

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const currentBalance = parseFloat(profile.wallet_balance_inr || '0');

    if (currentBalance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Minimum withdrawal limit
    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum withdrawal is ₹100' }, { status: 400 });
    }

    // Create withdrawal transaction (pending)
    const transactionId = `WITHDRAW_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(),
        type: 'debit',
        transaction_type: 'withdrawal',
        currency: 'INR',
        description: `Withdrawal of ₹${amount} - Account: ${accountHolderName} (${ifscCode})`,
        status: 'pending',
        reference_id: transactionId,
      })
      .returning();

    // Deduct amount from wallet immediately (will be refunded if withdrawal fails)
    const newBalance = (currentBalance - amount).toFixed(2);
    await db.update(profiles)
      .set({ wallet_balance_inr: newBalance })
      .where(eq(profiles.id, profile.id));

    // TODO: Integrate with actual bank transfer API (e.g., NEFT, RTGS)
    // For now, mark as pending for admin approval

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted',
      transaction: transaction,
      newBalance: newBalance,
      transactionId: transactionId,
    });
  } catch (error: any) {
    console.error('Withdraw INR error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}

// GET /api/wallet/withdraw-inr - Get withdrawal history
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const withdrawals = await db.select()
      .from(wallet_transactions)
      .where(
        and(
          eq(wallet_transactions.user_id, currentUser.userId),
          eq(wallet_transactions.type, 'debit'),
          eq(wallet_transactions.currency, 'INR')
        )
      );

    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    console.error('Get withdrawals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

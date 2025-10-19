import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/payments/paypal';
import { db, wallet_transactions, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// POST /api/wallet/deposit-usd
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create transaction record (pending)
    const transactionId = `PAYPAL_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(),
        type: 'credit',
        transaction_type: 'deposit',
        currency: 'USD',
        description: `Deposit of $${amount} via PayPal`,
        status: 'pending',
        reference_id: transactionId,
      })
      .returning();

    // Create PayPal order
    const paypalOrder = await createPayPalOrder(
      currentUser.userId,
      amount,
      `Wallet Deposit - $${amount}`
    );

    return NextResponse.json({
      success: true,
      transaction: transaction,
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      transactionId: transactionId,
    });
  } catch (error: any) {
    console.error('Deposit USD error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate deposit' },
      { status: 500 }
    );
  }
}

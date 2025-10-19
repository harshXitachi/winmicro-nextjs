import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPhonePePayment } from '@/lib/payments/phonepe';
import { db, wallet_transactions, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

// POST /api/wallet/deposit-inr
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, phoneNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 });
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create transaction record (pending)
    const transactionId = `TXN_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(),
        type: 'credit',
        transaction_type: 'deposit',
        currency: 'INR',
        description: `Deposit of ₹${amount} via PhonePay`,
        status: 'pending',
        reference_id: transactionId,
      })
      .returning();

    // Create PhonePay payment request
    const phonePeData = await createPhonePePayment(
      currentUser.userId,
      transactionId,
      amount,
      phoneNumber,
      `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-success?transactionId=${transaction.id}`,
      `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/phonepe-callback`
    );

    return NextResponse.json({
      success: true,
      transaction: transaction,
      paymentUrl: phonePeData.url,
      transactionId: transactionId,
    });
  } catch (error: any) {
    console.error('Deposit INR error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate deposit' },
      { status: 500 }
    );
  }
}

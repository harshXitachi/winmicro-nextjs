import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { verifyRazorpaySignature, getRazorpayPaymentDetails } from '@/lib/payments/razorpay';
import { db, wallet_transactions, users, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/razorpay-callback
export async function POST(request: NextRequest) {
  try {
    console.log('🔔 Razorpay callback received');
    
    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      console.error('❌ Missing Razorpay parameters');
      return NextResponse.json({ error: 'Missing payment parameters' }, { status: 400 });
    }

    // Verify the signature
    const isValidSignature = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      console.error('❌ Invalid Razorpay signature');
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // Get payment details from Razorpay
    const paymentDetails = await getRazorpayPaymentDetails(razorpay_payment_id);
    
    if (paymentDetails.status !== 'captured') {
      console.error('❌ Payment not captured:', paymentDetails.status);
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 });
    }

    // Find the transaction by order ID
    const [transaction] = await db.select()
      .from(wallet_transactions)
      .where(eq(wallet_transactions.reference_id, razorpay_order_id))
      .limit(1);

    if (!transaction) {
      console.error('❌ Transaction not found for order:', razorpay_order_id);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    if (transaction.status === 'completed') {
      console.log('✅ Transaction already completed');
      return NextResponse.json({ success: true, message: 'Payment already processed' });
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, transaction.user_id));

    if (!user) {
      console.error('❌ User not found');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update transaction status
    await db.update(wallet_transactions)
      .set({
        status: 'completed',
        reference_id: razorpay_payment_id, // Store payment ID in reference_id
      })
      .where(eq(wallet_transactions.id, transaction.id));

    // Update user wallet balance in profiles table
    const [profile] = await db.select()
      .from(profiles)
      .where(eq(profiles.user_id, user.id))
      .limit(1);

    if (profile) {
      const currentBalance = parseFloat(profile.wallet_balance_inr || '0');
      const depositAmount = parseFloat(transaction.amount);
      const newBalance = currentBalance + depositAmount;

      await db.update(profiles)
        .set({
          wallet_balance_inr: newBalance.toFixed(2),
          updated_at: new Date(),
        })
        .where(eq(profiles.user_id, user.id));

      console.log(`✅ Payment completed: ₹${depositAmount} added to user ${user.id}`);

      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        transactionId: transaction.id,
        amount: depositAmount,
        newBalance: newBalance,
      });
    } else {
      console.error('❌ User profile not found');
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

  } catch (error: any) {
    console.error('Razorpay callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment' },
      { status: 500 }
    );
  }
}

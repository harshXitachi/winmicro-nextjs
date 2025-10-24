import { NextRequest, NextResponse } from 'next/server';
import { verifyPhonePePayment, verifyPhonePePaymentMock } from '@/lib/payments/phonepe';
import { db, wallet_transactions, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/phonepe-callback
export async function POST(request: NextRequest) {
  try {
    console.log('📞 PhonePe Callback received');
    
    const body = await request.json();
    console.log('PhonePe callback body:', body);

    const { merchantTransactionId, transactionId, code, state } = body;

    if (!merchantTransactionId && !transactionId) {
      console.error('❌ No transaction ID in callback');
      return NextResponse.json({ error: 'Transaction ID missing' }, { status: 400 });
    }

    const txId = merchantTransactionId || transactionId;

    // Find the transaction in our database
    const [transaction] = await db.select()
      .from(wallet_transactions)
      .where(eq(wallet_transactions.reference_id, txId));

    if (!transaction) {
      console.error('❌ Transaction not found:', txId);
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    console.log('📊 Found transaction:', transaction);

    // Use mock verification for development, real verification for production
    const useMock = process.env.NODE_ENV === 'development' || !process.env.PHONEPE_MERCHANT_ID;
    
    let verificationResult;
    if (useMock) {
      console.log('🧪 Using PhonePe Mock Verification');
      verificationResult = await verifyPhonePePaymentMock(txId);
    } else {
      console.log('💰 Using PhonePe Live Verification');
      verificationResult = await verifyPhonePePayment(txId);
    }

    console.log('✅ PhonePe verification result:', verificationResult);

    // Update transaction status based on verification
    // Check multiple success indicators
    const isSuccess = verificationResult.status === 'COMPLETED' || 
                     state === 'COMPLETED' || 
                     code === 'PAYMENT_SUCCESS' ||
                     body.state === 'COMPLETED';
    
    if (isSuccess) {
      // Update transaction as completed
      await db.update(wallet_transactions)
        .set({
          status: 'completed',
          updated_at: new Date(),
        })
        .where(eq(wallet_transactions.id, transaction.id));

      // Update user's wallet balance
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, transaction.user_id));

      if (user) {
        const currentBalance = parseFloat(user.inr_balance || '0');
        const depositAmount = parseFloat(transaction.amount);
        const newBalance = currentBalance + depositAmount;

        await db.update(users)
          .set({
            inr_balance: newBalance.toFixed(2),
            updated_at: new Date(),
          })
          .where(eq(users.id, transaction.user_id));

        console.log(`✅ Wallet updated: +₹${depositAmount} (New balance: ₹${newBalance})`);
      }
    } else {
      // Update transaction as failed
      await db.update(wallet_transactions)
        .set({
          status: 'failed',
          updated_at: new Date(),
        })
        .where(eq(wallet_transactions.id, transaction.id));

      console.log('❌ Payment failed or pending');
    }

    return NextResponse.json({
      success: true,
      status: isSuccess ? 'completed' : 'failed',
      transactionId: txId,
    });

  } catch (error: any) {
    console.error('PhonePe callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}

// GET /api/wallet/phonepe-callback (for redirect handling)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const transactionId = url.searchParams.get('transactionId');
    const status = url.searchParams.get('status');

    console.log('📞 PhonePe Redirect received:', { transactionId, status });

    if (!transactionId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/wallet?error=no_transaction_id`);
    }

    // Find the transaction
    const [transaction] = await db.select()
      .from(wallet_transactions)
      .where(eq(wallet_transactions.reference_id, transactionId));

    if (!transaction) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/wallet?error=transaction_not_found`);
    }

    // Redirect to success page
    const redirectUrl = status === 'success' 
      ? `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-success?transactionId=${transactionId}`
      : `${process.env.NEXT_PUBLIC_APP_URL}/wallet?error=payment_failed`;

    return NextResponse.redirect(redirectUrl);

  } catch (error: any) {
    console.error('PhonePe redirect error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/wallet?error=callback_error`);
  }
}
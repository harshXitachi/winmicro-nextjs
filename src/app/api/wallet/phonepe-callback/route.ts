import { NextRequest, NextResponse } from 'next/server';
import { db, wallet_transactions, profiles, admin_wallets } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { verifyPhonePePayment } from '@/lib/payments/phonepe';

// PhonePe callback/verification endpoint
// POST /api/wallet/phonepe-callback
export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (_) {
      body = {};
    }

    // PhonePe typically sends merchantTransactionId; allow fallback query params
    const merchantTransactionId = body.merchantTransactionId || body.transactionId || request.nextUrl.searchParams.get('merchantTransactionId') || request.nextUrl.searchParams.get('transactionId');

    if (!merchantTransactionId) {
      return NextResponse.json(
        { error: 'Missing merchantTransactionId' },
        { status: 400 }
      );
    }

    // Find pending transaction created for this merchantTransactionId
    const [transaction] = await db
      .select()
      .from(wallet_transactions)
      .where(
        and(
          eq(wallet_transactions.reference_id, merchantTransactionId),
          eq(wallet_transactions.status, 'pending')
        )
      );

    if (!transaction) {
      // It's possible we already processed it; treat as idempotent
      return NextResponse.json({ success: true, message: 'No pending transaction found or already processed' });
    }

    // Verify with PhonePe status API
    const verify = await verifyPhonePePayment(merchantTransactionId);
    const normalizedStatus = (verify.status || '').toUpperCase();
    const isSuccess = normalizedStatus === 'COMPLETED' || normalizedStatus === 'SUCCESS';

    if (!isSuccess) {
      await db.update(wallet_transactions)
        .set({ status: 'failed' })
        .where(eq(wallet_transactions.id, transaction.id));

      return NextResponse.json({ error: 'Payment not completed', status: verify.status }, { status: 400 });
    }

    // Mark transaction completed and update reference to provider transaction id
    await db.update(wallet_transactions)
      .set({ status: 'completed', reference_id: verify.transactionId })
      .where(eq(wallet_transactions.id, transaction.id));

    // Credit user's INR wallet with the net amount stored in transaction.amount
    const [profile] = await db.select()
      .from(profiles)
      .where(eq(profiles.user_id, transaction.user_id));

    if (profile) {
      const currentBalance = parseFloat(profile.wallet_balance_inr || '0');
      const newBalance = (currentBalance + parseFloat(transaction.amount)).toFixed(2);

      await db.update(profiles)
        .set({ wallet_balance_inr: newBalance })
        .where(eq(profiles.id, profile.id));
    }

    // Credit admin wallet with commission if any
    const commissionAmount = parseFloat(transaction.commission_amount || '0');
    if (commissionAmount > 0) {
      const [adminWallet] = await db
        .select()
        .from(admin_wallets)
        .where(eq(admin_wallets.currency, 'INR'));

      if (adminWallet) {
        const newAdminBalance = (parseFloat(adminWallet.balance) + commissionAmount).toFixed(2);
        const newEarned = (parseFloat(adminWallet.total_commission_earned) + commissionAmount).toFixed(2);

        await db.update(admin_wallets)
          .set({
            balance: newAdminBalance,
            total_commission_earned: newEarned,
            updated_at: new Date(),
          })
          .where(eq(admin_wallets.id, adminWallet.id));
      }
    }

    return NextResponse.json({ success: true, message: 'Payment completed successfully' });
  } catch (error: any) {
    console.error('PhonePe callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}

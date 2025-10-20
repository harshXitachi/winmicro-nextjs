import { NextRequest, NextResponse } from 'next/server';
import { db, wallet_transactions, profiles, admin_wallets } from '@/lib/db';
import { eq, and } from 'drizzle-orm';
import { capturePayPalOrder } from '@/lib/payments/paypal';

// POST /api/wallet/paypal-callback
export async function POST(request: NextRequest) {
  try {
    const { orderId, transactionId } = await request.json();

    if (!orderId || !transactionId) {
      return NextResponse.json(
        { error: 'Missing orderId or transactionId' },
        { status: 400 }
      );
    }

    // Find the pending transaction
    const [transaction] = await db.select()
      .from(wallet_transactions)
      .where(
        and(
          eq(wallet_transactions.reference_id, transactionId),
          eq(wallet_transactions.status, 'pending')
        )
      );

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    try {
      // Capture the payment from PayPal
      const captureResult = await capturePayPalOrder(orderId);

      if (captureResult.status !== 'COMPLETED') {
        // Update transaction status to failed
        await db.update(wallet_transactions)
          .set({ status: 'failed' })
          .where(eq(wallet_transactions.id, transaction.id));

        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }

      // Update transaction status to completed
      await db.update(wallet_transactions)
        .set({
          status: 'completed',
          reference_id: captureResult.transactionId,
        })
        .where(eq(wallet_transactions.id, transaction.id));

      // Update user's wallet balance
      const [profile] = await db.select()
        .from(profiles)
        .where(eq(profiles.user_id, transaction.user_id));

      if (profile) {
        const currentBalance = parseFloat(profile.wallet_balance_usd || '0');
        const newBalance = (currentBalance + parseFloat(transaction.amount)).toFixed(2);

        await db.update(profiles)
          .set({ wallet_balance_usd: newBalance })
          .where(eq(profiles.id, profile.id));
      }

      // Update admin wallet with commission if applicable
      const commissionAmount = parseFloat(transaction.commission_amount || '0');
      if (commissionAmount > 0) {
        const currency = transaction.currency || 'USD';
        const [adminWallet] = await db.select()
          .from(admin_wallets)
          .where(eq(admin_wallets.currency, currency));

        if (adminWallet) {
          const currentAdminBalance = parseFloat(adminWallet.balance);
          const currentEarned = parseFloat(adminWallet.total_commission_earned);
          const newAdminBalance = (currentAdminBalance + commissionAmount).toFixed(2);
          const newEarned = (currentEarned + commissionAmount).toFixed(2);

          await db.update(admin_wallets)
            .set({
              balance: newAdminBalance,
              total_commission_earned: newEarned,
              updated_at: new Date(),
            })
            .where(eq(admin_wallets.id, adminWallet.id));
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Payment completed successfully',
        transaction: {
          ...transaction,
          status: 'completed',
        },
      });
    } catch (paymentError: any) {
      console.error('PayPal capture error:', paymentError);

      // Update transaction status to failed
      await db.update(wallet_transactions)
        .set({ status: 'failed' })
        .where(eq(wallet_transactions.id, transaction.id));

      return NextResponse.json(
        { error: paymentError.message || 'Failed to capture payment' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('PayPal callback error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process callback' },
      { status: 500 }
    );
  }
}

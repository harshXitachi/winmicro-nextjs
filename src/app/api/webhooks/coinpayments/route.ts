import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, wallet_transactions, admin_wallets } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { verifyIPNWithBody } from '@/lib/coinpayments';

export const dynamic = 'force-dynamic';

/**
 * CoinPayments IPN (Instant Payment Notification) Handler
 * This endpoint receives payment status updates from CoinPayments
 */
export async function POST(request: NextRequest) {
  try {
    console.log('[CoinPayments IPN] Received webhook notification');

    // Get raw body for HMAC verification
    const body = await request.text();
    const hmacHeader = request.headers.get('HMAC') || '';

    console.log('[CoinPayments IPN] Headers:', {
      hasHMAC: !!hmacHeader,
      contentType: request.headers.get('content-type'),
    });

    // Verify the IPN authenticity
    if (!verifyIPNWithBody(body, hmacHeader)) {
      console.error('[CoinPayments IPN] Invalid HMAC signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    console.log('[CoinPayments IPN] Signature verified');

    // Parse the form data
    const params = new URLSearchParams(body);
    const ipnData = Object.fromEntries(params.entries());

    console.log('[CoinPayments IPN] Data:', {
      txn_id: ipnData.txn_id,
      status: ipnData.status,
      status_text: ipnData.status_text,
      amount: ipnData.amount,
      currency: ipnData.currency,
      custom: ipnData.custom,
    });

    // Extract transaction details
    const {
      txn_id,
      status,
      status_text,
      amount1, // Amount in original currency
      amount2, // Amount in received currency
      currency1,
      currency2,
      custom,
      buyer_name,
      email,
    } = ipnData;

    // Parse custom data
    let customData: any = {};
    try {
      if (custom) {
        customData = JSON.parse(custom);
      }
    } catch (e) {
      console.error('[CoinPayments IPN] Failed to parse custom data:', e);
    }

    const { userId, transactionId, type } = customData;

    if (!transactionId) {
      console.error('[CoinPayments IPN] No transaction ID in custom data');
      return NextResponse.json(
        { error: 'Invalid transaction data' },
        { status: 400 }
      );
    }

    console.log('[CoinPayments IPN] Processing transaction:', {
      transactionId,
      userId,
      type,
      status,
    });

    // Get the existing transaction
    const [transaction] = await db
      .select()
      .from(wallet_transactions)
      .where(eq(wallet_transactions.id, transactionId))
      .limit(1);

    if (!transaction) {
      console.error('[CoinPayments IPN] Transaction not found:', transactionId);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Status codes from CoinPayments:
    // 0 or less = error/cancelled
    // 1 = pending
    // 2+ = confirmed/complete
    // 100 = complete
    const statusCode = parseInt(status);

    console.log('[CoinPayments IPN] Status code:', statusCode);

    // Handle different statuses
    if (statusCode >= 100) {
      // Payment completed
      console.log('[CoinPayments IPN] Payment completed');

      if (type === 'deposit' && transaction.status !== 'completed') {
        // Credit user's wallet
        const depositAmount = parseFloat(transaction.amount);
        const commissionAmount = parseFloat(transaction.commission_amount || '0');

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.user_id, userId))
          .limit(1);

        if (profile) {
          const currentBalance = parseFloat(profile.wallet_balance_usdt || '0');
          const newBalance = currentBalance + depositAmount;

          await db
            .update(profiles)
            .set({
              wallet_balance_usdt: newBalance.toFixed(2),
              updated_at: new Date(),
            })
            .where(eq(profiles.user_id, userId));

          console.log('[CoinPayments IPN] User balance updated:', {
            userId,
            oldBalance: currentBalance,
            newBalance,
          });

          // Update admin wallet with commission
          if (commissionAmount > 0) {
            const [adminWallet] = await db
              .select()
              .from(admin_wallets)
              .where(eq(admin_wallets.currency, 'USDT'))
              .limit(1);

            if (adminWallet) {
              const newAdminBalance = parseFloat(adminWallet.balance) + commissionAmount;
              const newTotalEarned = parseFloat(adminWallet.total_commission_earned) + commissionAmount;

              await db
                .update(admin_wallets)
                .set({
                  balance: newAdminBalance.toFixed(2),
                  total_commission_earned: newTotalEarned.toFixed(2),
                  updated_at: new Date(),
                })
                .where(eq(admin_wallets.currency, 'USDT'));

              console.log('[CoinPayments IPN] Admin commission credited:', commissionAmount);
            }
          }
        }

        // Update transaction status
        await db
          .update(wallet_transactions)
          .set({
            status: 'completed',
            description: `${transaction.description} - Completed`,
          })
          .where(eq(wallet_transactions.id, transactionId));

        console.log('[CoinPayments IPN] Transaction marked as completed');
      } else if (type === 'withdrawal' && transaction.status !== 'completed') {
        // Update withdrawal status
        await db
          .update(wallet_transactions)
          .set({
            status: 'completed',
            description: `${transaction.description} - Completed`,
          })
          .where(eq(wallet_transactions.id, transactionId));

        console.log('[CoinPayments IPN] Withdrawal marked as completed');
      }
    } else if (statusCode < 0) {
      // Payment failed or cancelled
      console.log('[CoinPayments IPN] Payment failed/cancelled');

      if (type === 'deposit') {
        // Mark transaction as failed
        await db
          .update(wallet_transactions)
          .set({
            status: 'failed',
            description: `${transaction.description} - ${status_text || 'Failed'}`,
          })
          .where(eq(wallet_transactions.id, transactionId));
      } else if (type === 'withdrawal') {
        // Refund the amount back to user
        const withdrawalAmount = parseFloat(transaction.amount);

        const [profile] = await db
          .select()
          .from(profiles)
          .where(eq(profiles.user_id, userId))
          .limit(1);

        if (profile) {
          const currentBalance = parseFloat(profile.wallet_balance_usdt || '0');
          const newBalance = currentBalance + withdrawalAmount;

          await db
            .update(profiles)
            .set({
              wallet_balance_usdt: newBalance.toFixed(2),
              updated_at: new Date(),
            })
            .where(eq(profiles.user_id, userId));

          console.log('[CoinPayments IPN] Withdrawal refunded:', {
            userId,
            refundAmount: withdrawalAmount,
          });
        }

        // Mark transaction as failed
        await db
          .update(wallet_transactions)
          .set({
            status: 'failed',
            description: `${transaction.description} - ${status_text || 'Failed'}`,
          })
          .where(eq(wallet_transactions.id, transactionId));
      }

      console.log('[CoinPayments IPN] Transaction marked as failed');
    } else {
      // Payment pending
      console.log('[CoinPayments IPN] Payment pending, no action needed');
    }

    // Return success response (CoinPayments expects this)
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error('[CoinPayments IPN] Error:', error);
    // Still return 200 to prevent CoinPayments from retrying
    return NextResponse.json(
      { error: 'Internal error', message: error.message },
      { status: 200 }
    );
  }
}

// Also handle GET for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'CoinPayments IPN endpoint',
    status: 'active',
  });
}

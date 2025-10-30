import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, profiles, wallet_transactions, commission_settings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createWithdrawal, isValidTRC20Address, isCoinPaymentsConfigured } from '@/lib/coinpayments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[USDT Withdrawal] Starting withdrawal request...');

    // Check if CoinPayments is configured
    if (!isCoinPaymentsConfigured()) {
      console.error('[USDT Withdrawal] CoinPayments not configured');
      return NextResponse.json(
        { error: 'USDT payment gateway is not configured' },
        { status: 503 }
      );
    }

    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.error('[USDT Withdrawal] Unauthorized - no current user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, address, note } = body;

    console.log('[USDT Withdrawal] Request details:', {
      userId: currentUser.userId,
      email: currentUser.email,
      amount,
      address: address ? `${address.substring(0, 10)}...` : 'N/A',
    });

    // Validate inputs
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    if (!address || !isValidTRC20Address(address)) {
      return NextResponse.json(
        { error: 'Invalid TRC20 address' },
        { status: 400 }
      );
    }

    const withdrawalAmount = parseFloat(amount);

    // Get user profile
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, currentUser.userId))
      .limit(1);

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);
    
    // Check if USDT wallet is enabled
    if (settings && !settings.usdt_wallet_enabled) {
      return NextResponse.json(
        { error: 'USDT withdrawals are currently disabled' },
        { status: 503 }
      );
    }

    // Validate withdrawal limits
    const minWithdrawal = settings?.min_withdrawal_usdt ? parseFloat(settings.min_withdrawal_usdt) : 10;
    const maxWithdrawal = settings?.max_withdrawal_usdt ? parseFloat(settings.max_withdrawal_usdt) : 2000;

    if (withdrawalAmount < minWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal amount is ${minWithdrawal} USDT` },
        { status: 400 }
      );
    }

    if (withdrawalAmount > maxWithdrawal) {
      return NextResponse.json(
        { error: `Maximum withdrawal amount is ${maxWithdrawal} USDT` },
        { status: 400 }
      );
    }

    // Check if user has sufficient balance
    const currentBalance = parseFloat(profile.wallet_balance_usdt || '0');
    
    if (currentBalance < withdrawalAmount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: ${currentBalance.toFixed(2)} USDT` },
        { status: 400 }
      );
    }

    console.log('[USDT Withdrawal] Balance check passed:', {
      currentBalance,
      withdrawalAmount,
      remaining: currentBalance - withdrawalAmount,
    });

    // Create pending withdrawal transaction
    const [transaction] = await db.insert(wallet_transactions).values({
      user_id: currentUser.userId,
      amount: withdrawalAmount.toFixed(2),
      type: 'debit',
      currency: 'USDT',
      transaction_type: 'withdrawal',
      description: `USDT TRC20 Withdrawal to ${address.substring(0, 10)}...${address.substring(address.length - 6)}`,
      status: 'pending',
    }).returning();

    console.log('[USDT Withdrawal] Transaction record created:', transaction.id);

    // Deduct amount from user balance immediately (will be refunded if withdrawal fails)
    const newBalance = currentBalance - withdrawalAmount;
    await db
      .update(profiles)
      .set({
        wallet_balance_usdt: newBalance.toFixed(2),
        updated_at: new Date(),
      })
      .where(eq(profiles.user_id, currentUser.userId));

    console.log('[USDT Withdrawal] Balance updated:', {
      oldBalance: currentBalance,
      newBalance,
    });

    // Create withdrawal via CoinPayments
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || 'http://localhost:3000';

      const withdrawal = await createWithdrawal({
        amount: withdrawalAmount,
        currency: 'USDT.TRC20',
        address: address,
        auto_confirm: 0, // Require manual confirmation for security
        ipn_url: `${baseUrl}/api/webhooks/coinpayments`,
        note: note || `Withdrawal for user ${currentUser.userId}`,
      });

      console.log('[USDT Withdrawal] CoinPayments withdrawal created:', {
        id: withdrawal.id,
        status: withdrawal.status,
        amount: withdrawal.amount,
      });

      // Update transaction with withdrawal reference
      await db.update(wallet_transactions)
        .set({
          reference_id: withdrawal.id,
          description: `${transaction.description} - Ref: ${withdrawal.id}`,
        })
        .where({ id: transaction.id });

      return NextResponse.json({
        success: true,
        withdrawal: {
          id: withdrawal.id,
          transactionId: transaction.id,
          amount: withdrawalAmount.toFixed(2),
          address: address,
          status: 'pending',
          message: 'Withdrawal request created successfully. It will be processed within 24-48 hours.',
        },
      });
    } catch (coinpaymentsError: any) {
      console.error('[USDT Withdrawal] CoinPayments error:', coinpaymentsError);
      
      // Refund the amount back to user's balance since withdrawal failed
      await db
        .update(profiles)
        .set({
          wallet_balance_usdt: currentBalance.toFixed(2),
          updated_at: new Date(),
        })
        .where(eq(profiles.user_id, currentUser.userId));

      // Update transaction status to failed
      await db.update(wallet_transactions)
        .set({
          status: 'failed',
          description: `${transaction.description} - Failed: ${coinpaymentsError.message}`,
        })
        .where({ id: transaction.id });

      return NextResponse.json(
        { error: `Withdrawal failed: ${coinpaymentsError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[USDT Withdrawal] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal request' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, wallet_transactions, commission_settings } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { createTransaction, SUPPORTED_CURRENCIES, isCoinPaymentsConfigured } from '@/lib/coinpayments';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[USDT Deposit] Starting deposit request...');

    // Check if CoinPayments is configured
    if (!isCoinPaymentsConfigured()) {
      console.error('[USDT Deposit] CoinPayments not configured');
      return NextResponse.json(
        { error: 'USDT payment gateway is not configured' },
        { status: 503 }
      );
    }

    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      console.error('[USDT Deposit] Unauthorized - no current user');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount } = body;

    console.log('[USDT Deposit] Request details:', {
      userId: currentUser.userId,
      email: currentUser.email,
      amount,
    });

    // Validate amount
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const depositAmount = parseFloat(amount);

    // Get commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);
    
    // Check if USDT wallet is enabled
    if (settings && !settings.usdt_wallet_enabled) {
      return NextResponse.json(
        { error: 'USDT deposits are currently disabled' },
        { status: 503 }
      );
    }

    // Validate deposit limits
    const minDeposit = settings?.min_deposit_usdt ? parseFloat(settings.min_deposit_usdt) : 2;
    const maxDeposit = settings?.max_deposit_usdt ? parseFloat(settings.max_deposit_usdt) : 5000;

    if (depositAmount < minDeposit) {
      return NextResponse.json(
        { error: `Minimum deposit amount is ${minDeposit} USDT` },
        { status: 400 }
      );
    }

    if (depositAmount > maxDeposit) {
      return NextResponse.json(
        { error: `Maximum deposit amount is ${maxDeposit} USDT` },
        { status: 400 }
      );
    }

    // Calculate commission
    const commissionRate = settings?.commission_on_deposits && settings?.commission_percentage
      ? parseFloat(settings.commission_percentage) / 100
      : 0;
    const commissionAmount = depositAmount * commissionRate;
    const totalAmount = depositAmount + commissionAmount;

    console.log('[USDT Deposit] Calculated amounts:', {
      depositAmount,
      commissionAmount,
      totalAmount,
    });

    // Create pending transaction record
    const [transaction] = await db.insert(wallet_transactions).values({
      user_id: currentUser.userId,
      amount: depositAmount.toFixed(2),
      type: 'credit',
      currency: 'USDT',
      transaction_type: 'deposit',
      description: `USDT TRC20 Deposit - ${depositAmount} USDT`,
      status: 'pending',
      commission_amount: commissionAmount.toFixed(2),
    }).returning();

    console.log('[USDT Deposit] Transaction record created:', transaction.id);

    // Get the base URL for callbacks
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || request.headers.get('origin') || 'http://localhost:3000';

    // Create CoinPayments transaction
    try {
      const coinpaymentsTransaction = await createTransaction({
        amount: totalAmount,
        currency1: SUPPORTED_CURRENCIES.USDT_TRC20,
        currency2: SUPPORTED_CURRENCIES.USDT_TRC20,
        buyer_email: currentUser.email || '',
        buyer_name: `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim(),
        item_name: 'Wallet Deposit',
        item_number: transaction.id,
        invoice: transaction.id,
        custom: JSON.stringify({
          userId: currentUser.userId,
          transactionId: transaction.id,
          type: 'deposit',
        }),
        ipn_url: `${baseUrl}/api/webhooks/coinpayments`,
        success_url: `${baseUrl}/wallet/payment-success?txn_id=${transaction.id}`,
        cancel_url: `${baseUrl}/wallet/payment-cancel?txn_id=${transaction.id}`,
      });

      console.log('[USDT Deposit] CoinPayments transaction created:', {
        txn_id: coinpaymentsTransaction.txn_id,
        address: coinpaymentsTransaction.address,
        amount: coinpaymentsTransaction.amount,
      });

      // Update transaction with CoinPayments reference
      await db.update(wallet_transactions)
        .set({
          reference_id: coinpaymentsTransaction.txn_id,
        })
        .where(eq(wallet_transactions.id, transaction.id));

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.id,
          txn_id: coinpaymentsTransaction.txn_id,
          address: coinpaymentsTransaction.address,
          amount: coinpaymentsTransaction.amount,
          qrcode_url: coinpaymentsTransaction.qrcode_url,
          status_url: coinpaymentsTransaction.status_url,
          timeout: coinpaymentsTransaction.timeout,
          confirms_needed: coinpaymentsTransaction.confirms_needed,
        },
        depositAmount: depositAmount.toFixed(2),
        commissionAmount: commissionAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        currency: 'USDT',
      });
    } catch (coinpaymentsError: any) {
      console.error('[USDT Deposit] CoinPayments error:', coinpaymentsError);
      
      // Update transaction status to failed
      await db.update(wallet_transactions)
        .set({
          status: 'failed',
          description: `USDT TRC20 Deposit Failed - ${coinpaymentsError.message}`,
        })
        .where(eq(wallet_transactions.id, transaction.id));

      return NextResponse.json(
        { error: `Payment gateway error: ${coinpaymentsError.message}` },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('[USDT Deposit] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create deposit transaction' },
      { status: 500 }
    );
  }
}

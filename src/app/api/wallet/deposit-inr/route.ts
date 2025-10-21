import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createPhonePePayment } from '@/lib/payments/phonepe';
import { createPhonePePaymentMock } from '@/lib/payments/phonepe-mock';
import { db, wallet_transactions, users, commission_settings, admin_wallets, profiles } from '@/lib/db';
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

    // Get commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);
    const commissionEnabled = settings?.commission_on_deposits ?? true;
    const commissionPercentage = parseFloat(settings?.commission_percentage || '2.00');

    // Check if INR wallet is enabled
    const walletEnabled = settings?.inr_wallet_enabled ?? true;
    if (!walletEnabled) {
      return NextResponse.json(
        { error: 'INR Wallet is currently under maintenance. Please try again later.' },
        { status: 400 }
      );
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate commission if enabled
    let commissionAmount = 0;
    if (commissionEnabled) {
      commissionAmount = (amount * commissionPercentage) / 100;
    }
    const payableAmount = parseFloat((amount + commissionAmount).toFixed(2));

    // Create transaction record (pending)
    const transactionId = `TXN_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(), // net amount to credit to user upon success
        type: 'credit',
        transaction_type: 'deposit',
        currency: 'INR',
        description: `Deposit of ₹${amount} via PhonePe`,
        status: 'pending',
        reference_id: transactionId,
        commission_amount: commissionAmount.toFixed(2),
      })
      .returning();

    // Create PhonePe payment request for total payable (amount + commission if any)
    const isPhonePeMockMode = process.env.PHONEPE_MOCK_MODE === 'true';
    
    let phonePeData;
    if (isPhonePeMockMode) {
      console.log('🧪 Using PhonePe MOCK mode for testing');
      phonePeData = await createPhonePePaymentMock(
        currentUser.userId,
        transactionId,
        payableAmount,
        phoneNumber,
        `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-success?transactionId=${transaction.id}`,
        `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/phonepe-callback`
      );
    } else {
      phonePeData = await createPhonePePayment(
        currentUser.userId,
        transactionId,
        payableAmount,
        phoneNumber,
        `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-success?transactionId=${transaction.id}`,
        `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/phonepe-callback`
      );
    }

    return NextResponse.json({
      success: true,
      transaction: transaction,
      paymentUrl: phonePeData.url,
      transactionId: transactionId,
      commission: {
        enabled: commissionEnabled,
        percentage: commissionPercentage,
        amount: commissionAmount.toFixed(2),
        total: (amount + commissionAmount).toFixed(2),
      },
    });
  } catch (error: any) {
    console.error('Deposit INR error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate deposit' },
      { status: 500 }
    );
  }
}

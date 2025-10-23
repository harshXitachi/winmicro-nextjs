import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserFromRequest } from '@/lib/auth';
import { createRazorpayOrder } from '@/lib/payments/razorpay';
import { db, wallet_transactions, users, commission_settings, admin_wallets, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/deposit-inr
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/wallet/deposit-inr - Request received');
    
    // Try Firebase auth first
    let currentUser = await getCurrentUserFromRequest(request);
    
    // Fallback to server-side auth
    if (!currentUser) {
      currentUser = await getCurrentUser();
    }
    
    if (!currentUser) {
      console.log('❌ No authenticated user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('✅ Authenticated user:', currentUser.userId);

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum deposit amount is ₹100' }, { status: 400 });
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
    const transactionId = `RAZORPAY_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(), // net amount to credit to user upon success
        type: 'credit',
        transaction_type: 'deposit',
        currency: 'INR',
        description: `Deposit of ₹${amount} via Razorpay`,
        status: 'pending',
        reference_id: transactionId,
        commission_amount: commissionAmount.toFixed(2),
      })
      .returning();

    // Create Razorpay order for total payable (amount + commission if any)
    const razorpayOrder = await createRazorpayOrder(
      currentUser.userId,
      Math.round(payableAmount * 100), // Convert to paise
      `Wallet Deposit - ₹${amount}`,
      transactionId
    );

    return NextResponse.json({
      success: true,
      transaction: transaction,
      orderId: razorpayOrder.orderId,
      keyId: razorpayOrder.keyId,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
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

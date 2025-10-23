import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUserFromRequest } from '@/lib/auth';
import { createPayPalOrder } from '@/lib/payments/paypal';
import { db, wallet_transactions, users, commission_settings } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/deposit-usd
export async function POST(request: NextRequest) {
  try {
    console.log('🔵 deposit-usd: Starting request');
    console.log('📤 Request headers:', {
      authorization: request.headers.get('authorization') ? '[PRESENT]' : '[MISSING]',
      'x-firebase-token': request.headers.get('x-firebase-token') ? '[PRESENT]' : '[MISSING]',
      'content-type': request.headers.get('content-type'),
    });
    
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser) {
      console.log('❌ deposit-usd: No current user, returning 401');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    console.log('✅ deposit-usd: User authenticated:', currentUser.userId);

    const { amount } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Get user details
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get commission settings and wallet availability
    const [settings] = await db.select().from(commission_settings).limit(1);
    const walletEnabled = settings?.usd_wallet_enabled ?? true;
    if (!walletEnabled) {
      return NextResponse.json(
        { error: 'USD Wallet is currently under maintenance. Please try again later.' },
        { status: 400 }
      );
    }
    const commissionEnabled = settings?.commission_on_deposits ?? true;
    const commissionPercentage = parseFloat(settings?.commission_percentage || '2.00');

    // Calculate commission if enabled
    let commissionAmount = 0;
    if (commissionEnabled) {
      commissionAmount = (amount * commissionPercentage) / 100;
    }
    const payableAmount = parseFloat((amount + commissionAmount).toFixed(2));

    // Create transaction record (pending)
    const transactionId = `PAYPAL_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(), // net amount to credit to user upon success
        type: 'credit',
        transaction_type: 'deposit',
        currency: 'USD',
        description: `Deposit of $${amount} via PayPal`,
        status: 'pending',
        reference_id: transactionId,
        commission_amount: commissionAmount.toFixed(2),
      })
      .returning();

    // Create PayPal order for total payable (amount + commission if any)
    const paypalOrder = await createPayPalOrder(
      currentUser.userId,
      payableAmount,
      `Wallet Deposit - $${amount}`
    );

    return NextResponse.json({
      success: true,
      transaction: transaction,
      orderId: paypalOrder.orderId,
      approvalUrl: paypalOrder.approvalUrl,
      transactionId: transactionId,
    });
  } catch (error: any) {
    console.error('Deposit USD error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to initiate deposit' },
      { status: 500 }
    );
  }
}

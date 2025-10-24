import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentUserFromRequest } from '@/lib/auth';
import { createPhonePePayment, createPhonePePaymentMock } from '@/lib/payments/phonepe';
import { db, wallet_transactions, users, commission_settings, admin_wallets, profiles } from '@/lib/db';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST /api/wallet/deposit-inr
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 POST /api/wallet/deposit-inr - Request received');
    console.log('Headers check:', {
      hasAuth: !!request.headers.get('authorization'),
      hasFirebaseToken: !!request.headers.get('x-firebase-token'),
      hasCookie: !!request.headers.get('cookie'),
    });
    
    // Try Firebase auth first
    let currentUser = await getCurrentUserFromRequest(request);
    
    // Fallback to server-side auth
    if (!currentUser) {
      console.log('⚠️ Trying fallback auth...');
      currentUser = await getCurrentUser();
    }
    
    if (!currentUser) {
      console.error('❌ No authenticated user found');
      console.error('Authentication failed - Please check:');
      console.error('1. Firebase token is being sent from client');
      console.error('2. Firebase Admin credentials are configured in AWS Amplify');
      console.error('3. User is properly logged in');
      return NextResponse.json({ 
        error: 'Unauthorized - Please log in again',
        details: 'Authentication token missing or invalid'
      }, { status: 401 });
    }
    
    console.log('✅ Authenticated user:', currentUser.userId);

    const { amount, phoneNumber } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (amount < 100) {
      return NextResponse.json({ error: 'Minimum deposit amount is ₹100' }, { status: 400 });
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json({ error: 'Valid phone number is required for PhonePe payment' }, { status: 400 });
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
    const transactionId = `PHONEPE_${Date.now()}_${currentUser.userId.substring(0, 8)}`;
    
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

    // Create PhonePe payment for total payable (amount + commission if any)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const redirectUrl = `${baseUrl}/dashboard`; // Redirect to dashboard instead of wallet page
    const callbackUrl = `${baseUrl}/api/wallet/phonepe-callback`;

    // Use mock implementation for development, real implementation for production
    const useMock = process.env.NODE_ENV === 'development' || !process.env.PHONEPE_MERCHANT_ID;
    
    let phonePePayment;
    if (useMock) {
      console.log('🧪 Using PhonePe Mock Implementation');
      phonePePayment = await createPhonePePaymentMock(
        currentUser.userId,
        transactionId,
        payableAmount,
        phoneNumber,
        redirectUrl,
        callbackUrl
      );
    } else {
      console.log('💰 Using PhonePe Live Implementation');
      phonePePayment = await createPhonePePayment(
        currentUser.userId,
        transactionId,
        payableAmount,
        phoneNumber,
        redirectUrl,
        callbackUrl
      );
    }

    return NextResponse.json({
      success: true,
      transaction: transaction,
      paymentUrl: phonePePayment.url,
      transactionId: transactionId,
      paymentMethod: 'phonepe',
      isMock: useMock,
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

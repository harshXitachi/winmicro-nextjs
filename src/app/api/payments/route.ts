import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, wallet_transactions, messages, admin_wallets, commission_settings, tasks } from '@/lib/db';
import { verifyToken, getCurrentUserFromRequest } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

// POST - Send payment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { recipient_id, amount, task_id, description, currency = 'INR' } = body;

    if (!recipient_id || !amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid payment details' }, { status: 400 });
    }

    // Validate currency
    if (!['INR', 'USD', 'USDT'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    // Get commission settings
    const [settings] = await db
      .select()
      .from(commission_settings)
      .limit(1);

    const commissionRate = settings ? parseFloat(settings.commission_percentage) / 100 : 0.02;
    const isCommissionEnabled = settings?.commission_on_transfers ?? true;

    // Calculate commission
    const commissionAmount = isCommissionEnabled ? amount * commissionRate : 0;
    const recipientAmount = amount - commissionAmount;

    // Get sender's wallet balance
    const [senderProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, payload.userId))
      .limit(1);

    if (!senderProfile) {
      return NextResponse.json({ error: 'Sender profile not found' }, { status: 404 });
    }

    // Get balance for the specific currency
    const balanceField = `wallet_balance_${currency.toLowerCase()}` as keyof typeof senderProfile;
    const senderBalance = parseFloat((senderProfile[balanceField] as string) || '0');
    
    if (senderBalance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient balance', 
        required: amount,
        available: senderBalance,
        commission: commissionAmount,
        currency
      }, { status: 400 });
    }

    // Debit from sender (full amount including commission)
    const newSenderBalance = (senderBalance - amount).toFixed(2);
    const senderUpdateData: any = {
      updated_at: new Date()
    };
    senderUpdateData[balanceField] = newSenderBalance;

    await db
      .update(profiles)
      .set(senderUpdateData)
      .where(eq(profiles.user_id, payload.userId));

    // Get recipient profile
    const [recipientProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.user_id, recipient_id))
      .limit(1);

    if (!recipientProfile) {
      return NextResponse.json({ error: 'Recipient profile not found' }, { status: 404 });
    }

    // Credit to recipient (amount minus commission)
    const recipientCurrentBalance = parseFloat((recipientProfile[balanceField] as string) || '0');
    const newRecipientBalance = (recipientCurrentBalance + recipientAmount).toFixed(2);
    const currentTotalEarnings = parseFloat(recipientProfile.total_earnings || '0');
    const newTotalEarnings = (currentTotalEarnings + recipientAmount).toFixed(2);
    
    const recipientUpdateData: any = {
      total_earnings: newTotalEarnings,
      updated_at: new Date()
    };
    recipientUpdateData[balanceField] = newRecipientBalance;

    await db
      .update(profiles)
      .set(recipientUpdateData)
      .where(eq(profiles.user_id, recipient_id));

    const referenceId = `PAY-${Date.now()}`;

    // Create sender transaction record (debit)
    const [senderTransaction] = await db
      .insert(wallet_transactions)
      .values({
        user_id: payload.userId,
        amount: amount.toString(),
        type: 'debit',
        currency,
        transaction_type: 'transfer',
        description: description || `Payment sent to recipient`,
        status: 'completed',
        commission_amount: commissionAmount.toString(),
        from_user_id: payload.userId,
        to_user_id: recipient_id,
        task_id: task_id || null,
        reference_id: referenceId,
      })
      .returning();

    // Create recipient transaction record (credit)
    await db
      .insert(wallet_transactions)
      .values({
        user_id: recipient_id,
        amount: recipientAmount.toString(),
        type: 'credit',
        currency,
        transaction_type: 'transfer',
        description: description || `Payment received from sender`,
        status: 'completed',
        commission_amount: '0.00',
        from_user_id: payload.userId,
        to_user_id: recipient_id,
        task_id: task_id || null,
        reference_id: referenceId,
      });

    // If commission was charged, credit admin wallet
    if (commissionAmount > 0) {
      const [adminWallet] = await db
        .select()
        .from(admin_wallets)
        .where(eq(admin_wallets.currency, currency))
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
          .where(eq(admin_wallets.currency, currency));
      }
    }

    // If task_id provided, update task status
    if (task_id) {
      await db
        .update(tasks)
        .set({ 
          status: 'completed',
          updated_at: new Date()
        })
        .where(eq(tasks.id, task_id));

      // Update freelancer's completed tasks count
      const currentCompletedTasks = recipientProfile.completed_tasks || 0;
      await db
        .update(profiles)
        .set({ 
          completed_tasks: currentCompletedTasks + 1,
          updated_at: new Date()
        })
        .where(eq(profiles.user_id, recipient_id));
    }

    // Send payment confirmation message
    const currencySymbols: Record<string, string> = {
      INR: '₹',
      USD: '$',
      USDT: '₮'
    };
    const symbol = currencySymbols[currency] || currency;

    const paymentMessageContent = JSON.stringify({
      type: 'payment',
      amount,
      commission: commissionAmount,
      recipientAmount,
      currency,
      task_id,
      reference: referenceId,
      message: `Payment of ${symbol}${amount} sent. Recipient receives ${symbol}${recipientAmount.toFixed(2)} (Commission: ${symbol}${commissionAmount.toFixed(2)})`,
    });

    await db.insert(messages).values({
      sender_id: payload.userId,
      recipient_id,
      task_id: task_id || null,
      content: paymentMessageContent,
      message_type: 'payment',
      payment_amount: amount.toString(),
      payment_status: 'completed',
      read: false,
      delivered: true,
    });

    return NextResponse.json({ 
      success: true,
      transaction: senderTransaction,
      amount,
      recipientAmount,
      commission: commissionAmount,
      currency
    });
  } catch (error) {
    console.error('Payment error:', error);
    return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
  }
}

// GET - Get payment history
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 GET /api/payments - Request received');
    console.log('📋 Headers:', {
      'x-firebase-token': request.headers.get('x-firebase-token') ? '[PRESENT]' : '[MISSING]',
      'authorization': request.headers.get('authorization') ? '[PRESENT]' : '[MISSING]',
      'cookie': request.headers.get('cookie') ? '[PRESENT]' : '[MISSING]',
    });
    
    // Try Firebase auth first
    let payload = await getCurrentUserFromRequest(request);
    
    // Fallback to cookie-based auth
    if (!payload) {
      const token = request.cookies.get('auth_token')?.value;
      if (!token) {
        console.log('❌ No authentication token found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      payload = await verifyToken(token);
    }
    
    if (!payload) {
      console.log('❌ Authentication failed');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Authenticated user:', payload.userId);

    const transactions = await db
      .select()
      .from(wallet_transactions)
      .where(eq(wallet_transactions.user_id, payload.userId))
      .orderBy(sql`${wallet_transactions.created_at} DESC`);

    console.log('📊 Found transactions:', transactions.length);
    return NextResponse.json({ data: transactions });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, users, admin_wallets, wallet_transactions } from '@/lib/db';
import { eq } from 'drizzle-orm';

// POST /api/admin/wallet/withdraw-commission
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { currency, amount, bankAccountNumber, ifscCode, accountHolderName } = await request.json();

    if (!currency || !['INR', 'USD', 'USDT'].includes(currency)) {
      return NextResponse.json({ error: 'Invalid currency' }, { status: 400 });
    }

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!bankAccountNumber || !ifscCode || !accountHolderName) {
      return NextResponse.json({ error: 'Missing bank details' }, { status: 400 });
    }

    // Get admin wallet
    const [adminWallet] = await db.select()
      .from(admin_wallets)
      .where(eq(admin_wallets.currency, currency));

    if (!adminWallet) {
      return NextResponse.json({ error: 'Admin wallet not found' }, { status: 404 });
    }

    const walletBalance = parseFloat(adminWallet.balance || '0');

    if (walletBalance < amount) {
      return NextResponse.json({ error: 'Insufficient commission balance' }, { status: 400 });
    }

    // Minimum withdrawal based on currency
    const minimumWithdrawal = currency === 'INR' ? 500 : 10;
    if (amount < minimumWithdrawal) {
      return NextResponse.json(
        { error: `Minimum withdrawal is ${currency === 'INR' ? '₹' : '$'}${minimumWithdrawal}` },
        { status: 400 }
      );
    }

    // Create withdrawal transaction
    const transactionId = `ADMIN_WITHDRAW_${Date.now()}_${currency}`;

    const [transaction] = await db.insert(wallet_transactions)
      .values({
        user_id: currentUser.userId,
        amount: amount.toString(),
        type: 'debit',
        transaction_type: 'admin_commission_withdrawal',
        currency: currency,
        description: `Admin commission withdrawal of ${currency === 'INR' ? '₹' : '$'}${amount}`,
        status: 'pending',
        reference_id: transactionId,
        metadata: {
          bankAccountNumber: bankAccountNumber.slice(-4),
          ifscCode: ifscCode,
          accountHolderName: accountHolderName,
          adminId: currentUser.userId,
        },
      })
      .returning();

    // Deduct from admin wallet
    const newBalance = (walletBalance - amount).toFixed(2);
    await db.update(admin_wallets)
      .set({ balance: newBalance })
      .where(eq(admin_wallets.currency, currency));

    return NextResponse.json({
      success: true,
      message: 'Commission withdrawal request submitted',
      transaction: transaction,
      newBalance: newBalance,
      transactionId: transactionId,
      currency: currency,
    });
  } catch (error: any) {
    console.error('Admin withdraw commission error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}

// GET /api/admin/wallet/withdraw-commission - Get withdrawal history
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, currentUser.userId));

    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const withdrawals = await db.select()
      .from(wallet_transactions)
      .where(
        eq(wallet_transactions.transaction_type, 'admin_commission_withdrawal')
      );

    return NextResponse.json({ withdrawals });
  } catch (error: any) {
    console.error('Get admin withdrawals error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch withdrawals' },
      { status: 500 }
    );
  }
}

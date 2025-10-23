import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, wallet_transactions, admin_wallets, commission_settings } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

type Currency = 'INR' | 'USD' | 'USDT';

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userId, amount, type, currency = 'INR', transactionType, applyCommission = false } = body;

    // Validate currency
    if (!['INR', 'USD', 'USDT'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    // Check permission
    if (userId !== currentUser.userId && currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get current profile
    const [profile] = await db.select().from(profiles).where(eq(profiles.user_id, userId)).limit(1);
    
    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    // Get commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);
    const commissionRate = settings ? parseFloat(settings.commission_percentage) / 100 : 0.02;

    // Determine which wallet balance to use
    const balanceField = `wallet_balance_${currency.toLowerCase()}` as keyof typeof profile;
    const currentBalance = parseFloat(profile[balanceField] as string || '0');
    const changeAmount = parseFloat(amount);
    
    let newBalance: number;
    let commissionAmount = 0;
    
    if (type === 'credit') {
      // For deposits, apply commission if enabled
      if (applyCommission && settings?.commission_on_deposits) {
        commissionAmount = changeAmount * commissionRate;
        newBalance = currentBalance + (changeAmount - commissionAmount);
      } else {
        newBalance = currentBalance + changeAmount;
      }
    } else {
      // For withdrawals/debits
      newBalance = Math.max(0, currentBalance - changeAmount);
    }

    // Update balance
    const updateData: any = {
      updated_at: new Date(),
    };
    updateData[balanceField] = newBalance.toFixed(2);
    
    // Also update legacy wallet_balance for backward compatibility
    if (currency === 'INR') {
      updateData.wallet_balance = newBalance.toFixed(2);
    }

    const [updatedProfile] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.user_id, userId))
      .returning();

    // Create transaction record
    await db.insert(wallet_transactions).values({
      user_id: userId,
      amount: changeAmount.toFixed(2),
      type,
      currency,
      transaction_type: transactionType || (type === 'credit' ? 'deposit' : 'withdrawal'),
      description: `Wallet ${type} - ${currency}`,
      status: 'completed',
      commission_amount: commissionAmount.toFixed(2),
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

    return NextResponse.json({ 
      profile: updatedProfile,
      commission: commissionAmount,
      newBalance: newBalance.toFixed(2)
    });
  } catch (error) {
    console.error('Update balance error:', error);
    return NextResponse.json(
      { error: 'Failed to update balance' },
      { status: 500 }
    );
  }
}

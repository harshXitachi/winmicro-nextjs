import { NextRequest, NextResponse } from 'next/server';
import { db, admin_wallets, commission_settings, wallet_transactions } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { eq, desc, and, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// GET - Get admin wallet balances and settings
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    // Allow if user is admin OR has admin session
    if (!currentUser && !request.headers.get('x-admin-session')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (currentUser && currentUser.role !== 'admin' && !request.headers.get('x-admin-session')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all admin wallets
    const wallets = await db.select().from(admin_wallets);
    
    // Get commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);
    
    // Get recent commission transactions (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentCommissions = await db
      .select()
      .from(wallet_transactions)
      .where(
        and(
          gte(wallet_transactions.created_at, thirtyDaysAgo),
          gte(wallet_transactions.commission_amount, '0.01')
        )
      )
      .orderBy(desc(wallet_transactions.created_at))
      .limit(50);

    return NextResponse.json({
      success: true,
      wallets,
      settings: settings || {
        commission_percentage: '2.00',
        commission_on_deposits: true,
        commission_on_transfers: true,
        inr_wallet_enabled: true,
        usd_wallet_enabled: true,
        usdt_wallet_enabled: true,
      },
      recentCommissions,
    });
  } catch (error) {
    console.error('Get admin wallet error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin wallet data' },
      { status: 500 }
    );
  }
}

// POST - Withdraw from admin wallet
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currency, amount } = body;

    if (!['INR', 'USD', 'USDT'].includes(currency)) {
      return NextResponse.json(
        { error: 'Invalid currency' },
        { status: 400 }
      );
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Get admin wallet
    const [adminWallet] = await db
      .select()
      .from(admin_wallets)
      .where(eq(admin_wallets.currency, currency))
      .limit(1);

    if (!adminWallet) {
      return NextResponse.json(
        { error: 'Admin wallet not found' },
        { status: 404 }
      );
    }

    const currentBalance = parseFloat(adminWallet.balance);
    if (withdrawAmount > currentBalance) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Update admin wallet balance
    const newBalance = currentBalance - withdrawAmount;
    const [updatedWallet] = await db
      .update(admin_wallets)
      .set({
        balance: newBalance.toFixed(2),
        updated_at: new Date(),
      })
      .where(eq(admin_wallets.currency, currency))
      .returning();

    // Create withdrawal transaction record
    await db.insert(wallet_transactions).values({
      user_id: currentUser.userId,
      amount: withdrawAmount.toFixed(2),
      type: 'debit',
      currency,
      transaction_type: 'admin_withdrawal',
      description: `Admin withdrawal - ${currency}`,
      status: 'completed',
    });

    return NextResponse.json({
      success: true,
      wallet: updatedWallet,
      message: `Successfully withdrew ${withdrawAmount.toFixed(2)} ${currency}`,
    });
  } catch (error) {
    console.error('Admin wallet withdrawal error:', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}

// PATCH - Update commission settings
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    // Allow if user is admin OR has admin session
    if (!currentUser && !request.headers.get('x-admin-session')) {
      console.error('❌ PATCH /api/admin/wallet: Unauthorized - no user or admin session');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    if (currentUser && currentUser.role !== 'admin' && !request.headers.get('x-admin-session')) {
      console.error('❌ PATCH /api/admin/wallet: Unauthorized - user is not admin');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('📝 PATCH /api/admin/wallet: Received body:', body);
    
    // Get existing settings or create new
    const [existingSettings] = await db.select().from(commission_settings).limit(1);
    console.log('📊 Existing settings:', existingSettings);
    
    // Prepare update data with explicit field mapping
    const updateData: any = {
      updated_at: new Date(),
    };
    console.log('🔄 Preparing update data...');
    
    // Only include fields that are present in the body
    if (body.commission_percentage !== undefined) updateData.commission_percentage = body.commission_percentage;
    if (body.commission_on_deposits !== undefined) updateData.commission_on_deposits = body.commission_on_deposits;
    if (body.commission_on_transfers !== undefined) updateData.commission_on_transfers = body.commission_on_transfers;
    if (body.inr_wallet_enabled !== undefined) updateData.inr_wallet_enabled = body.inr_wallet_enabled;
    if (body.usd_wallet_enabled !== undefined) updateData.usd_wallet_enabled = body.usd_wallet_enabled;
    if (body.usdt_wallet_enabled !== undefined) updateData.usdt_wallet_enabled = body.usdt_wallet_enabled;
    if (body.min_deposit_inr !== undefined) updateData.min_deposit_inr = body.min_deposit_inr;
    if (body.max_deposit_inr !== undefined) updateData.max_deposit_inr = body.max_deposit_inr;
    if (body.min_deposit_usd !== undefined) updateData.min_deposit_usd = body.min_deposit_usd;
    if (body.max_deposit_usd !== undefined) updateData.max_deposit_usd = body.max_deposit_usd;
    if (body.min_deposit_usdt !== undefined) updateData.min_deposit_usdt = body.min_deposit_usdt;
    if (body.max_deposit_usdt !== undefined) updateData.max_deposit_usdt = body.max_deposit_usdt;
    if (body.min_withdrawal_inr !== undefined) updateData.min_withdrawal_inr = body.min_withdrawal_inr;
    if (body.max_withdrawal_inr !== undefined) updateData.max_withdrawal_inr = body.max_withdrawal_inr;
    if (body.min_withdrawal_usd !== undefined) updateData.min_withdrawal_usd = body.min_withdrawal_usd;
    if (body.max_withdrawal_usd !== undefined) updateData.max_withdrawal_usd = body.max_withdrawal_usd;
    if (body.min_withdrawal_usdt !== undefined) updateData.min_withdrawal_usdt = body.min_withdrawal_usdt;
    if (body.max_withdrawal_usdt !== undefined) updateData.max_withdrawal_usdt = body.max_withdrawal_usdt;
    
    let updatedSettings;
    if (existingSettings) {
      console.log('✅ Updating existing settings with ID:', existingSettings.id);
      // Update existing settings
      [updatedSettings] = await db
        .update(commission_settings)
        .set(updateData)
        .where(eq(commission_settings.id, existingSettings.id))
        .returning();
      console.log('✅ Settings updated successfully:', updatedSettings);
    } else {
      console.log('🆕 No existing settings found. Creating new record...');
      // Create new settings with defaults
      [updatedSettings] = await db
        .insert(commission_settings)
        .values({
          commission_percentage: body.commission_percentage || '2.00',
          commission_on_deposits: body.commission_on_deposits ?? true,
          commission_on_transfers: body.commission_on_transfers ?? true,
          inr_wallet_enabled: body.inr_wallet_enabled ?? true,
          usd_wallet_enabled: body.usd_wallet_enabled ?? true,
          usdt_wallet_enabled: body.usdt_wallet_enabled ?? true,
          min_deposit_inr: body.min_deposit_inr || '100.00',
          max_deposit_inr: body.max_deposit_inr || '100000.00',
          min_deposit_usd: body.min_deposit_usd || '2.00',
          max_deposit_usd: body.max_deposit_usd || '5000.00',
          min_deposit_usdt: body.min_deposit_usdt || '2.00',
          max_deposit_usdt: body.max_deposit_usdt || '5000.00',
          min_withdrawal_inr: body.min_withdrawal_inr || '500.00',
          max_withdrawal_inr: body.max_withdrawal_inr || '50000.00',
          min_withdrawal_usd: body.min_withdrawal_usd || '10.00',
          max_withdrawal_usd: body.max_withdrawal_usd || '2000.00',
          min_withdrawal_usdt: body.min_withdrawal_usdt || '10.00',
          max_withdrawal_usdt: body.max_withdrawal_usdt || '2000.00',
        })
        .returning();
      console.log('✅ Settings created successfully:', updatedSettings);
    }

    return NextResponse.json({
      success: true,
      message: 'Commission settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Update commission settings error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

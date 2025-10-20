import { NextRequest, NextResponse } from 'next/server';
import { db, commission_settings } from '@/lib/db';

// GET /api/settings/commission - Public endpoint to get current commission settings
export async function GET(request: NextRequest) {
  try {
    // Get current commission settings
    const [settings] = await db.select().from(commission_settings).limit(1);

    // Return default settings if none exist
    const commissionSettings = settings || {
      commission_percentage: '2.00',
      commission_on_deposits: true,
      commission_on_transfers: true,
      inr_wallet_enabled: true,
      usd_wallet_enabled: true,
      usdt_wallet_enabled: true,
      min_deposit_inr: '100.00',
      max_deposit_inr: '100000.00',
      min_deposit_usd: '2.00',
      max_deposit_usd: '5000.00',
      min_deposit_usdt: '2.00',
      max_deposit_usdt: '5000.00',
      min_withdrawal_inr: '500.00',
      max_withdrawal_inr: '50000.00',
      min_withdrawal_usd: '10.00',
      max_withdrawal_usd: '2000.00',
      min_withdrawal_usdt: '10.00',
      max_withdrawal_usdt: '2000.00',
    };

    return NextResponse.json({
      success: true,
      settings: commissionSettings,
    });
  } catch (error) {
    console.error('Get commission settings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commission settings' },
      { status: 500 }
    );
  }
}

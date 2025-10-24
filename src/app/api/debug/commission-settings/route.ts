import { NextRequest, NextResponse } from 'next/server';
import { db, commission_settings } from '@/lib/db';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking commission settings in database...');
    
    // Get all commission settings
    const settings = await db.select().from(commission_settings);
    console.log('📊 Commission settings from DB:', settings);
    
    // Check if table exists and has data
    const count = await db.select({ count: sql`count(*)` }).from(commission_settings);
    console.log('📊 Total records in commission_settings:', count);
    
    return NextResponse.json({
      success: true,
      settings,
      count: count[0]?.count || 0,
      message: 'Commission settings debug info'
    });
  } catch (error) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to fetch commission settings debug info'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debug: Creating default commission settings...');
    
    // Create default commission settings if none exist
    const [newSettings] = await db.insert(commission_settings).values({
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
    }).returning();
    
    console.log('✅ Created default commission settings:', newSettings);
    
    return NextResponse.json({
      success: true,
      settings: newSettings,
      message: 'Default commission settings created successfully'
    });
  } catch (error) {
    console.error('❌ Debug error creating settings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to create default commission settings'
      },
      { status: 500 }
    );
  }
}

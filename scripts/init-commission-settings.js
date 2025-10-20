const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

async function initializeCommissionSettings() {
  try {
    console.log('🔧 Initializing commission settings...');
    
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL not found in .env.local');
      process.exit(1);
    }
    
    const sql = neon(process.env.DATABASE_URL);
    
    // Check if commission_settings exists
    console.log('📊 Checking for existing commission settings...');
    const existingSettings = await sql`SELECT * FROM commission_settings LIMIT 1`;
    
    if (existingSettings.length === 0) {
      console.log('📝 No commission settings found. Creating default settings...');
      
      await sql`
        INSERT INTO commission_settings (
          commission_percentage,
          commission_on_deposits,
          commission_on_transfers,
          inr_wallet_enabled,
          usd_wallet_enabled,
          usdt_wallet_enabled,
          min_deposit_inr,
          max_deposit_inr,
          min_deposit_usd,
          max_deposit_usd,
          min_deposit_usdt,
          max_deposit_usdt,
          min_withdrawal_inr,
          max_withdrawal_inr,
          min_withdrawal_usd,
          max_withdrawal_usd,
          min_withdrawal_usdt,
          max_withdrawal_usdt
        ) VALUES (
          '2.00',
          true,
          true,
          true,
          true,
          true,
          '100.00',
          '100000.00',
          '2.00',
          '5000.00',
          '2.00',
          '5000.00',
          '500.00',
          '50000.00',
          '10.00',
          '2000.00',
          '10.00',
          '2000.00'
        )
      `;
      
      console.log('✅ Default commission settings created!');
    } else {
      console.log('✅ Commission settings already exist.');
      console.log('Current settings:', existingSettings[0]);
    }
    
    // Check/create admin wallets
    console.log('\n🔧 Checking admin wallets...');
    const currencies = ['INR', 'USD', 'USDT'];
    
    for (const currency of currencies) {
      const existingWallet = await sql`
        SELECT * FROM admin_wallets 
        WHERE currency = ${currency} 
        LIMIT 1
      `;
      
      if (existingWallet.length === 0) {
        await sql`
          INSERT INTO admin_wallets (currency, balance, total_commission_earned)
          VALUES (${currency}, '0.00', '0.00')
        `;
        console.log(`✅ Created ${currency} admin wallet`);
      } else {
        console.log(`✅ ${currency} admin wallet exists (Balance: ${existingWallet[0].balance})`);
      }
    }
    
    console.log('\n✅ Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
}

initializeCommissionSettings();

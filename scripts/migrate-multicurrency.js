require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('🚀 Starting multi-currency wallet migration...\n');
  
  try {
    // Read the SQL file
    const migrationPath = path.join(__dirname, '..', 'src', 'lib', 'db', 'migrations', '001_multi_currency_wallet.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute statements one by one
    console.log('Adding ban fields to users table...');
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMP`;
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP`;
    
    console.log('Adding multi-currency wallet fields to profiles table...');
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_inr DECIMAL(10, 2) DEFAULT 0.00 NOT NULL`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usd DECIMAL(10, 2) DEFAULT 0.00 NOT NULL`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usdt DECIMAL(10, 2) DEFAULT 0.00 NOT NULL`;
    await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'INR' NOT NULL`;
    
    console.log('Migrating existing wallet_balance to wallet_balance_inr...');
    await sql`UPDATE profiles SET wallet_balance_inr = wallet_balance WHERE wallet_balance_inr = 0`;
    
    console.log('Adding currency field to wallet_transactions...');
    await sql`ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR' NOT NULL`;
    
    console.log('Creating admin_wallets table...');
    await sql`
      CREATE TABLE IF NOT EXISTS admin_wallets (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        currency VARCHAR(10) UNIQUE NOT NULL,
        balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
        total_commission_earned DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('Creating commission_settings table...');
    await sql`
      CREATE TABLE IF NOT EXISTS commission_settings (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        commission_percentage DECIMAL(5, 2) DEFAULT 2.00 NOT NULL,
        commission_on_deposits BOOLEAN DEFAULT TRUE NOT NULL,
        commission_on_transfers BOOLEAN DEFAULT TRUE NOT NULL,
        min_deposit_inr DECIMAL(10, 2) DEFAULT 100.00,
        max_deposit_inr DECIMAL(10, 2) DEFAULT 100000.00,
        min_deposit_usd DECIMAL(10, 2) DEFAULT 2.00,
        max_deposit_usd DECIMAL(10, 2) DEFAULT 5000.00,
        min_deposit_usdt DECIMAL(10, 2) DEFAULT 2.00,
        max_deposit_usdt DECIMAL(10, 2) DEFAULT 5000.00,
        min_withdrawal_inr DECIMAL(10, 2) DEFAULT 500.00,
        max_withdrawal_inr DECIMAL(10, 2) DEFAULT 50000.00,
        min_withdrawal_usd DECIMAL(10, 2) DEFAULT 10.00,
        max_withdrawal_usd DECIMAL(10, 2) DEFAULT 2000.00,
        min_withdrawal_usdt DECIMAL(10, 2) DEFAULT 10.00,
        max_withdrawal_usdt DECIMAL(10, 2) DEFAULT 2000.00,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('Initializing admin wallets...');
    await sql`
      INSERT INTO admin_wallets (currency, balance, total_commission_earned)
      VALUES 
        ('INR', 0.00, 0.00),
        ('USD', 0.00, 0.00),
        ('USDT', 0.00, 0.00)
      ON CONFLICT (currency) DO NOTHING
    `;
    
    console.log('Initializing commission settings...');
    await sql`
      INSERT INTO commission_settings (commission_percentage, commission_on_deposits, commission_on_transfers)
      SELECT 2.00, TRUE, TRUE
      WHERE NOT EXISTS (SELECT 1 FROM commission_settings)
    `;
    
    console.log('Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_ban_expires_at ON users(ban_expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_currency ON wallet_transactions(currency)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_currency ON wallet_transactions(user_id, currency)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_profiles_default_currency ON profiles(default_currency)`;
    
    
    console.log('\n✅ Multi-currency wallet migration completed successfully!\n');
    console.log('New features added:');
    console.log('  ✓ Multi-currency wallet support (INR, USD, USDT)');
    console.log('  ✓ Admin wallet and commission system');
    console.log('  ✓ User ban system');
    console.log('  ✓ Currency-specific transaction tracking');
    console.log('  ✓ Default currency preferences\n');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

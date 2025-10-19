const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration() {
  try {
    console.log('Running migration to add wallet enable fields...');
    
    // Add wallet enable fields
    await sql`
      ALTER TABLE commission_settings 
      ADD COLUMN IF NOT EXISTS inr_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL
    `;
    
    await sql`
      ALTER TABLE commission_settings 
      ADD COLUMN IF NOT EXISTS usd_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL
    `;
    
    await sql`
      ALTER TABLE commission_settings 
      ADD COLUMN IF NOT EXISTS usdt_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL
    `;
    
    // Update existing records
    await sql`
      UPDATE commission_settings 
      SET 
        inr_wallet_enabled = TRUE,
        usd_wallet_enabled = TRUE,
        usdt_wallet_enabled = TRUE
      WHERE inr_wallet_enabled IS NULL
    `;
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

runMigration();

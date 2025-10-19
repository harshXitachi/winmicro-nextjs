require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixProfiles() {
  try {
    console.log('Checking and fixing profiles table schema...');
    
    // Get existing columns
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles' ORDER BY ordinal_position`;
    const existingColumns = result.map(r => r.column_name);
    
    console.log('Current profiles columns:', existingColumns);
    
    // Add missing columns
    const columnsToAdd = [
      { name: 'avatar_url', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT' },
      { name: 'bio', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT' },
      { name: 'skills', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb" },
      { name: 'wallet_balance_inr', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_inr DECIMAL(10, 2) DEFAULT 0.00 NOT NULL' },
      { name: 'wallet_balance_usd', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usd DECIMAL(10, 2) DEFAULT 0.00 NOT NULL' },
      { name: 'wallet_balance_usdt', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usdt DECIMAL(10, 2) DEFAULT 0.00 NOT NULL' },
      { name: 'default_currency', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'INR' NOT NULL" },
      { name: 'rating', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rating DECIMAL(3, 2) DEFAULT 0.00' },
      { name: 'total_earnings', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10, 2) DEFAULT 0.00' },
      { name: 'completed_tasks', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_tasks INTEGER DEFAULT 0' },
      { name: 'success_rate', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS success_rate DECIMAL(5, 2) DEFAULT 0.00' },
      { name: 'response_time', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS response_time VARCHAR(50)" },
      { name: 'level', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1' },
      { name: 'experience_points', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS experience_points INTEGER DEFAULT 0' },
      { name: 'phone', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone VARCHAR(20)" },
      { name: 'location', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT' },
      { name: 'social_links', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS social_links JSONB' },
      { name: 'kyc_status', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_status VARCHAR(20) DEFAULT 'pending'" },
      { name: 'kyc_document_url', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_document_url TEXT' },
      { name: 'kyc_document_type', sql: "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_document_type VARCHAR(50)" },
      { name: 'kyc_verified_at', sql: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS kyc_verified_at TIMESTAMP' },
    ];
    
    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        console.log(`Adding column: ${col.name}`);
        await sql`${sql.unsafe(col.sql)}`;
      }
    }
    
    console.log('✅ Profiles table schema fixed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixProfiles().then(() => process.exit(0));

require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function fixSchema() {
  try {
    console.log('Adding missing is_banned column...');
    
    // Add is_banned column if it doesn't exist
    await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL`;
    
    console.log('✅ Schema fixed successfully');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

fixSchema().then(() => process.exit(0));

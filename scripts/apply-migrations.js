require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL;

async function applyMigration(sql, migrationPath) {
  console.log(`📦 Applying migration: ${path.basename(migrationPath)}`);
  
  const migrationContent = fs.readFileSync(migrationPath, 'utf8');
  const commands = migrationContent
    .split(';')
    .map(cmd => cmd.trim())
    .filter(cmd => cmd && !cmd.startsWith('--'));

  for (const command of commands) {
    if (command.trim()) {
      try {
        await sql`${sql.unsafe(command)}`;
      } catch (error) {
        // Ignore "already exists" errors for ALTER TABLE IF NOT EXISTS
        if (!error.message.includes('already exists') && !error.message.includes('duplicate column')) {
          throw error;
        }
      }
    }
  }
  
  console.log(`✅ Migration ${path.basename(migrationPath)} completed`);
}

async function runMigrations() {
  console.log('🚀 Starting additional migrations...');
  
  const sql = neon(DATABASE_URL);
  const migrationsDir = path.join(__dirname, '../src/lib/db/migrations');
  
  try {
    // Apply migrations in order
    const migrations = [
      '001_multi_currency_wallet.sql',
      '002_add_wallet_enable_fields.sql',
      '003_campaign_system.sql'
    ];
    
    for (const migration of migrations) {
      const migrationPath = path.join(migrationsDir, migration);
      if (fs.existsSync(migrationPath)) {
        await applyMigration(sql, migrationPath);
      }
    }
    
    console.log('✅ All additional migrations completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

runMigrations()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
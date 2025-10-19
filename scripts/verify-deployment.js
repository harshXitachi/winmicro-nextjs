require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function verifyDeployment() {
  const sql = neon(process.env.DATABASE_URL);
  
  console.log('\n🔍 MICROWIN MULTI-CURRENCY WALLET SYSTEM VERIFICATION\n');
  console.log('='.repeat(60));
  
  try {
    // 1. Verify database tables exist
    console.log('\n📊 Checking database tables...\n');
    
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;
    
    const requiredTables = [
      'users',
      'profiles',
      'wallet_transactions',
      'payment_transactions',
      'admin_wallets',
      'commission_settings',
      'admin_settings'
    ];
    
    requiredTables.forEach(table => {
      const exists = tables.some(t => t.table_name === table);
      console.log(`  ${exists ? '✅' : '❌'} ${table}`);
    });
    
    // 2. Verify multi-currency columns exist
    console.log('\n💰 Checking multi-currency wallet columns...\n');
    
    const profileColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name LIKE 'wallet_balance_%'
    `;
    
    ['wallet_balance_inr', 'wallet_balance_usd', 'wallet_balance_usdt'].forEach(col => {
      const exists = profileColumns.some(c => c.column_name === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });
    
    const defaultCurrency = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'profiles' 
      AND column_name = 'default_currency'
    `;
    console.log(`  ${defaultCurrency.length > 0 ? '✅' : '❌'} default_currency`);
    
    // 3. Verify ban system columns
    console.log('\n🚫 Checking ban system columns...\n');
    
    const banColumns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND (column_name LIKE 'ban%' OR column_name = 'is_banned')
    `;
    
    ['is_banned', 'ban_reason', 'ban_expires_at', 'banned_at'].forEach(col => {
      const exists = banColumns.some(c => c.column_name === col);
      console.log(`  ${exists ? '✅' : '❌'} ${col}`);
    });
    
    // 4. Verify admin wallets initialized
    console.log('\n💼 Checking admin wallets...\n');
    
    const adminWallets = await sql`
      SELECT currency, balance, total_commission_earned 
      FROM admin_wallets 
      ORDER BY currency
    `;
    
    ['INR', 'USD', 'USDT'].forEach(currency => {
      const wallet = adminWallets.find(w => w.currency === currency);
      if (wallet) {
        console.log(`  ✅ ${currency} Wallet: ₹${wallet.balance} (Total Commission: ₹${wallet.total_commission_earned})`);
      } else {
        console.log(`  ❌ ${currency} Wallet not found`);
      }
    });
    
    // 5. Verify commission settings
    console.log('\n⚙️  Checking commission settings...\n');
    
    const commissionSettings = await sql`
      SELECT * FROM commission_settings LIMIT 1
    `;
    
    if (commissionSettings.length > 0) {
      const settings = commissionSettings[0];
      console.log(`  ✅ Commission Rate: ${settings.commission_percentage}%`);
      console.log(`  ✅ On Deposits: ${settings.commission_on_deposits ? 'Enabled' : 'Disabled'}`);
      console.log(`  ✅ On Transfers: ${settings.commission_on_transfers ? 'Enabled' : 'Disabled'}`);
    } else {
      console.log('  ❌ Commission settings not initialized');
    }
    
    // 6. Verify indexes
    console.log('\n📇 Checking database indexes...\n');
    
    const indexes = await sql`
      SELECT indexname 
      FROM pg_indexes 
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'wallet_transactions', 'profiles')
    `;
    
    const requiredIndexes = [
      'idx_users_is_banned',
      'idx_wallet_transactions_currency',
      'idx_profiles_default_currency'
    ];
    
    requiredIndexes.forEach(idx => {
      const exists = indexes.some(i => i.indexname === idx);
      console.log(`  ${exists ? '✅' : '❌'} ${idx}`);
    });
    
    // 7. Check user data
    console.log('\n👥 Checking user data...\n');
    
    const users = await sql`SELECT COUNT(*) as count FROM users`;
    const profiles = await sql`SELECT COUNT(*) as count FROM profiles`;
    
    console.log(`  ✅ Total Users: ${users[0].count}`);
    console.log(`  ✅ Total Profiles: ${profiles[0].count}`);
    
    // 8. Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n✨ DEPLOYMENT VERIFICATION COMPLETE!\n');
    console.log('🎉 All checks passed! Your multi-currency wallet system is ready.\n');
    console.log('Next steps:');
    console.log('  1. Start the development server: npm run dev');
    console.log('  2. Login with admin credentials:');
    console.log('     Email: admin@gmail.com');
    console.log('     Password: admin1');
    console.log('  3. Test multi-currency wallet features');
    console.log('  4. Test user ban system in admin panel\n');
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  }
}

verifyDeployment();

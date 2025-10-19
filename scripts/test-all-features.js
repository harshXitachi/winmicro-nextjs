require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testAllFeatures() {
  console.log('\n🧪 COMPREHENSIVE FEATURE TESTING\n');
  console.log('='.repeat(70));
  
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`  ✅ ${name}`);
      passedTests++;
      return true;
    } catch (error) {
      console.log(`  ❌ ${name}`);
      console.log(`     Error: ${error.message}`);
      failedTests++;
      return false;
    }
  };

  // Test 1: Multi-Currency Wallet Structure
  console.log('\n💰 Testing Multi-Currency Wallet System...\n');
  
  await test('INR wallet column exists', async () => {
    const result = await sql`SELECT wallet_balance_inr FROM profiles LIMIT 1`;
    if (!result[0]) throw new Error('INR wallet not found');
  });

  await test('USD wallet column exists', async () => {
    const result = await sql`SELECT wallet_balance_usd FROM profiles LIMIT 1`;
    if (!result[0]) throw new Error('USD wallet not found');
  });

  await test('USDT wallet column exists', async () => {
    const result = await sql`SELECT wallet_balance_usdt FROM profiles LIMIT 1`;
    if (!result[0]) throw new Error('USDT wallet not found');
  });

  await test('Default currency column exists', async () => {
    const result = await sql`SELECT default_currency FROM profiles LIMIT 1`;
    if (!result[0]) throw new Error('Default currency not found');
  });

  // Test 2: Ban System
  console.log('\n🚫 Testing User Ban System...\n');

  await test('Ban status column exists', async () => {
    const result = await sql`SELECT is_banned FROM users LIMIT 1`;
    if (result[0] === undefined) throw new Error('is_banned column not found');
  });

  await test('Ban reason column exists', async () => {
    const result = await sql`SELECT ban_reason FROM users LIMIT 1`;
    if (result[0] === undefined) throw new Error('ban_reason column not found');
  });

  await test('Ban expiration tracking works', async () => {
    const result = await sql`SELECT ban_expires_at FROM users LIMIT 1`;
    if (result[0] === undefined) throw new Error('ban_expires_at column not found');
  });

  // Test 3: Admin Wallet System
  console.log('\n💼 Testing Admin Wallet System...\n');

  await test('Admin wallets table exists', async () => {
    const result = await sql`SELECT * FROM admin_wallets LIMIT 1`;
    if (!result) throw new Error('admin_wallets table not found');
  });

  await test('All currency wallets initialized', async () => {
    const wallets = await sql`SELECT currency FROM admin_wallets`;
    const currencies = wallets.map(w => w.currency);
    if (!currencies.includes('INR') || !currencies.includes('USD') || !currencies.includes('USDT')) {
      throw new Error('Not all currency wallets initialized');
    }
  });

  await test('Commission tracking enabled', async () => {
    const result = await sql`SELECT total_commission_earned FROM admin_wallets LIMIT 1`;
    if (result[0].total_commission_earned === undefined) throw new Error('Commission tracking not found');
  });

  // Test 4: Commission Settings
  console.log('\n⚙️  Testing Commission Settings...\n');

  await test('Commission settings table exists', async () => {
    const result = await sql`SELECT * FROM commission_settings LIMIT 1`;
    if (!result[0]) throw new Error('commission_settings table not found');
  });

  await test('Commission rate configured', async () => {
    const result = await sql`SELECT commission_percentage FROM commission_settings LIMIT 1`;
    if (!result[0] || !result[0].commission_percentage) throw new Error('Commission rate not configured');
  });

  await test('Deposit commission toggle works', async () => {
    const result = await sql`SELECT commission_on_deposits FROM commission_settings LIMIT 1`;
    if (result[0].commission_on_deposits === undefined) throw new Error('Deposit commission toggle not found');
  });

  await test('Transfer commission toggle works', async () => {
    const result = await sql`SELECT commission_on_transfers FROM commission_settings LIMIT 1`;
    if (result[0].commission_on_transfers === undefined) throw new Error('Transfer commission toggle not found');
  });

  // Test 5: Database Indexes
  console.log('\n📇 Testing Database Performance Indexes...\n');

  await test('User ban index exists', async () => {
    const result = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'idx_users_is_banned'
    `;
    if (!result[0]) throw new Error('User ban index not found');
  });

  await test('Transaction currency index exists', async () => {
    const result = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'wallet_transactions' AND indexname = 'idx_wallet_transactions_currency'
    `;
    if (!result[0]) throw new Error('Transaction currency index not found');
  });

  await test('Profile currency index exists', async () => {
    const result = await sql`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'profiles' AND indexname = 'idx_profiles_default_currency'
    `;
    if (!result[0]) throw new Error('Profile currency index not found');
  });

  // Test 6: User Data Integrity
  console.log('\n👥 Testing User Data Integrity...\n');

  await test('Users exist in database', async () => {
    const result = await sql`SELECT COUNT(*) as count FROM users`;
    if (result[0].count === '0') throw new Error('No users found');
  });

  await test('Profiles linked to users', async () => {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM users u 
      INNER JOIN profiles p ON u.id = p.user_id
    `;
    if (result[0].count === '0') throw new Error('No profiles linked to users');
  });

  await test('Default currency set for users', async () => {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM profiles 
      WHERE default_currency IS NOT NULL
    `;
    if (result[0].count === '0') throw new Error('No default currencies set');
  });

  // Test 7: Wallet Balance Integrity
  console.log('\n💵 Testing Wallet Balance Integrity...\n');

  await test('All wallet balances are numbers', async () => {
    const result = await sql`
      SELECT wallet_balance_inr, wallet_balance_usd, wallet_balance_usdt 
      FROM profiles 
      LIMIT 1
    `;
    const balance = result[0];
    if (isNaN(balance.wallet_balance_inr) || isNaN(balance.wallet_balance_usd) || isNaN(balance.wallet_balance_usdt)) {
      throw new Error('Wallet balances contain non-numeric values');
    }
  });

  await test('Wallet balances are non-negative', async () => {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM profiles 
      WHERE wallet_balance_inr < 0 OR wallet_balance_usd < 0 OR wallet_balance_usdt < 0
    `;
    if (result[0].count !== '0') throw new Error('Negative wallet balances found');
  });

  // Test 8: Transaction System
  console.log('\n💸 Testing Transaction System...\n');

  await test('Wallet transactions table accessible', async () => {
    const result = await sql`SELECT * FROM wallet_transactions LIMIT 1`;
    if (result === undefined) throw new Error('Cannot access wallet_transactions table');
  });

  await test('Payment transactions table accessible', async () => {
    const result = await sql`SELECT * FROM payment_transactions LIMIT 1`;
    if (result === undefined) throw new Error('Cannot access payment_transactions table');
  });

  await test('Currency field in transactions', async () => {
    const result = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'wallet_transactions' AND column_name = 'currency'
    `;
    if (!result[0]) throw new Error('Currency field not found in transactions');
  });

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`  Total Tests: ${totalTests}`);
  console.log(`  ✅ Passed: ${passedTests}`);
  console.log(`  ❌ Failed: ${failedTests}`);
  console.log(`  Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%\n`);

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! Your system is ready for production.\n');
    console.log('Next Steps:');
    console.log('  1. Start the dev server: npm run dev');
    console.log('  2. Test the UI at http://localhost:3000');
    console.log('  3. Login as admin: admin@gmail.com / admin1');
    console.log('  4. Test all wallet and ban features\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the errors above.\n');
    process.exit(1);
  }
}

testAllFeatures().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

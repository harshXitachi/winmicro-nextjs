const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const COINPAYMENTS_PUBLIC_KEY = process.env.COINPAYMENTS_PUBLIC_KEY;
const COINPAYMENTS_PRIVATE_KEY = process.env.COINPAYMENTS_PRIVATE_KEY;
const COINPAYMENTS_API_URL = 'https://www.coinpayments.net/api.php';

console.log('🔧 Testing CoinPayments Configuration...\n');

console.log('Environment Variables:');
console.log('✅ PUBLIC_KEY:', COINPAYMENTS_PUBLIC_KEY ? `${COINPAYMENTS_PUBLIC_KEY.substring(0, 10)}...` : '❌ MISSING');
console.log('✅ PRIVATE_KEY:', COINPAYMENTS_PRIVATE_KEY ? `${COINPAYMENTS_PRIVATE_KEY.substring(0, 10)}...` : '❌ MISSING');

if (!COINPAYMENTS_PUBLIC_KEY || !COINPAYMENTS_PRIVATE_KEY) {
  console.error('\n❌ CoinPayments credentials not found in .env.local');
  process.exit(1);
}

function generateHmac(data) {
  return crypto
    .createHmac('sha512', COINPAYMENTS_PRIVATE_KEY)
    .update(data)
    .digest('hex');
}

async function testCoinPaymentsAPI() {
  try {
    console.log('\n📡 Testing CoinPayments API Connection...\n');

    // Test 1: Get account info
    const params = new URLSearchParams({
      version: '1',
      cmd: 'get_basic_info',
      key: COINPAYMENTS_PUBLIC_KEY,
      format: 'json',
    });

    const requestBody = params.toString();
    const hmac = generateHmac(requestBody);

    console.log('Request Body:', requestBody);
    console.log('HMAC:', hmac.substring(0, 20) + '...');

    const response = await fetch(COINPAYMENTS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'HMAC': hmac,
      },
      body: requestBody,
    });

    const data = await response.json();

    console.log('\n📦 Response from CoinPayments:');
    console.log(JSON.stringify(data, null, 2));

    if (data.error === 'ok') {
      console.log('\n✅ SUCCESS! CoinPayments API is working correctly!');
      console.log('\nAccount Info:');
      console.log('- Username:', data.result.username || 'N/A');
      console.log('- Email:', data.result.email || 'N/A');
      console.log('- Merchant ID:', data.result.merchant_id || 'N/A');
    } else {
      console.log('\n❌ ERROR:', data.error);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testCoinPaymentsAPI();

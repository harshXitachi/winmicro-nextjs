// Test PhonePe credentials
const https = require('https');
const http = require('http');

// Your PhonePe credentials
const credentials = {
  merchantId: 'M22AFUJH1IZRR',
  secretKey: 'c7199d0e-5854-41f5-9604-3ae51eb8b3d1',
  keyIndex: 1,
  baseUrl: 'https://api.phonepe.com/apis/hermes' // Try production URL
};

console.log('🔍 Testing PhonePe Credentials...');
console.log('================================');
console.log(`Merchant ID: ${credentials.merchantId}`);
console.log(`Secret Key: ${credentials.secretKey.substring(0, 10)}...`);
console.log(`Key Index: ${credentials.keyIndex}`);
console.log(`Base URL: ${credentials.baseUrl}`);
console.log('');

// Test if the credentials are valid by making a test API call
async function testPhonePeCredentials() {
  try {
    console.log('🧪 Testing PhonePe API connection...');
    
    // Create a test payload
    const testPayload = {
      merchantId: credentials.merchantId,
      merchantTransactionId: `TEST_${Date.now()}`,
      merchantUserId: 'test_user',
      amount: 100, // 1 rupee in paise
      redirectUrl: 'https://example.com/success',
      callbackUrl: 'https://example.com/callback',
      mobileNumber: '9876543210',
      paymentInstrument: {
        type: 'PAY_PAGE'
      }
    };

    const payloadString = JSON.stringify(testPayload);
    const base64Payload = Buffer.from(payloadString).toString('base64');
    
    // Generate X-VERIFY header
    const crypto = require('crypto');
    const digest = crypto
      .createHash('sha256')
      .update(base64Payload + credentials.secretKey)
      .digest('hex');
    const xVerify = digest + '###' + credentials.keyIndex;

    console.log('📤 Making test API call...');
    
    const response = await fetch(`${credentials.baseUrl}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
        'X-MERCHANT-ID': credentials.merchantId,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const data = await response.json();
    
    console.log('📥 API Response:');
    console.log('Status:', response.status);
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    
    if (data.success) {
      console.log('✅ PhonePe credentials are working!');
      console.log('Payment URL:', data.data?.instrumentResponse?.redirectInfo?.url);
    } else {
      console.log('❌ PhonePe API error:', data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testPhonePeCredentials();

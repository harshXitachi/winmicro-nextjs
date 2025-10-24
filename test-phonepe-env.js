// Simple test script to check PhonePe environment variables
const https = require('https');
const http = require('http');

const testUrl = process.argv[2] || 'http://localhost:3000/api/test-phonepe-env';

console.log('🔍 Testing PhonePe Environment Variables...');
console.log('URL:', testUrl);

const client = testUrl.startsWith('https') ? https : http;

const req = client.get(testUrl, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('\n📊 PhonePe Environment Variables Status:');
      console.log('========================================');
      
      if (result.environment) {
        const env = result.environment;
        console.log(`PHONEPE_MERCHANT_ID: ${env.PHONEPE_MERCHANT_ID}`);
        console.log(`PHONEPE_SECRET_KEY: ${env.PHONEPE_SECRET_KEY}`);
        console.log(`PHONEPE_KEY_INDEX: ${env.PHONEPE_KEY_INDEX}`);
        console.log(`PHONEPE_BASE_URL: ${env.PHONEPE_BASE_URL}`);
        console.log(`NODE_ENV: ${env.NODE_ENV}`);
        console.log(`Is Configured: ${env.isConfigured ? '✅ YES' : '❌ NO'}`);
        
        if (env.merchantIdPreview !== 'NOT SET') {
          console.log(`Merchant ID Preview: ${env.merchantIdPreview}`);
        }
        if (env.secretKeyPreview !== 'NOT SET') {
          console.log(`Secret Key Preview: ${env.secretKeyPreview}`);
        }
      }
      
      if (result.implementation) {
        console.log('\n🔧 Implementation Status:');
        console.log('=========================');
        console.log(`Using Mock: ${result.implementation.usingMock ? '✅ YES' : '❌ NO'}`);
        console.log(`Reason: ${result.implementation.reason}`);
        console.log(`Recommendation: ${result.implementation.recommendation}`);
      }
      
      if (result.recommendations) {
        console.log('\n💡 Setup Recommendations:');
        console.log('=========================');
        result.recommendations.ifMissing.forEach(rec => console.log(rec));
        
        console.log('\n🔧 Troubleshooting:');
        console.log('==================');
        result.recommendations.troubleshooting.forEach(tip => console.log(tip));
        
        console.log('\n📞 PhonePe Setup:');
        console.log('================');
        result.recommendations.phonePeSetup.forEach(step => console.log(step));
      }
      
      if (result.configurationTest) {
        console.log('\n🧪 Configuration Test:');
        console.log('====================');
        console.log(`Status: ${result.configurationTest.status}`);
        if (result.configurationTest.error) {
          console.log(`Error: ${result.configurationTest.error}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
  console.log('\n💡 Make sure your Next.js app is running:');
  console.log('   npm run dev');
  console.log('\n💡 Or test your deployed app:');
  console.log('   node test-phonepe-env.js https://your-app-domain.com/api/test-phonepe-env');
});

req.setTimeout(10000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

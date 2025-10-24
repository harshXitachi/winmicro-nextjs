// Simple test script to check Razorpay environment variables
const https = require('https');
const http = require('http');

const testUrl = process.argv[2] || 'http://localhost:3000/api/test-razorpay-env';

console.log('🔍 Testing Razorpay Environment Variables...');
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
      console.log('\n📊 Environment Variables Status:');
      console.log('================================');
      
      if (result.environment) {
        const env = result.environment;
        console.log(`RAZORPAY_KEY_ID: ${env.RAZORPAY_KEY_ID}`);
        console.log(`RAZORPAY_KEY_SECRET: ${env.RAZORPAY_KEY_SECRET}`);
        console.log(`RAZORPAY_MODE: ${env.RAZORPAY_MODE}`);
        console.log(`NODE_ENV: ${env.NODE_ENV}`);
        console.log(`Is Configured: ${env.isConfigured ? '✅ YES' : '❌ NO'}`);
        
        if (env.keyIdPreview !== 'NOT SET') {
          console.log(`Key ID Preview: ${env.keyIdPreview}`);
        }
        if (env.keySecretPreview !== 'NOT SET') {
          console.log(`Key Secret Preview: ${env.keySecretPreview}`);
        }
      }
      
      if (result.recommendations) {
        console.log('\n💡 Recommendations:');
        console.log('==================');
        result.recommendations.ifMissing.forEach(rec => console.log(rec));
        
        console.log('\n🔧 Troubleshooting:');
        console.log('==================');
        result.recommendations.troubleshooting.forEach(tip => console.log(tip));
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
  console.log('   node test-razorpay-env.js https://your-app-domain.com/api/test-razorpay-env');
});

req.setTimeout(10000, () => {
  console.error('❌ Request timeout');
  req.destroy();
});

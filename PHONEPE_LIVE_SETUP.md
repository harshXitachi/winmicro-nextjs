# PhonePe Live Integration Setup

## 🔑 Your PhonePe Credentials

```
PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
PHONEPE_KEY_INDEX=1
```

## 🌐 PhonePe Base URLs

### For Testing (Sandbox):
```
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### For Production (Live):
```
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

## 🔧 AWS Amplify Environment Variables

### Step 1: Add Environment Variables in AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your application
3. Go to **App settings** → **Environment variables**
4. Add these variables:

#### For Testing (Recommended first):
```
PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

#### For Production (After testing):
```
PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

### Step 2: Redeploy Your Application

After adding environment variables:
1. Click **Redeploy this version** in AWS Amplify Console
2. Wait for deployment to complete

## 🧪 Testing Your Setup

### Test Environment Variables:
```bash
# Test locally
node test-phonepe-env.js

# Test deployed app
node test-phonepe-env.js https://your-app-domain.com/api/test-phonepe-env
```

### Test PhonePe Credentials:
```bash
# Test your actual credentials
node test-phonepe-credentials.js
```

### Test Wallet Deposit:
1. Go to your wallet page
2. Enter amount (minimum ₹100)
3. Enter phone number (10 digits)
4. Click "Add Funds"
5. You'll be redirected to PhonePe payment page

## 📱 Frontend Update Required

Your frontend needs to collect phone numbers for PhonePe:

```tsx
// Add phone number input to your deposit form
const [phoneNumber, setPhoneNumber] = useState('');

// Update the deposit API call
const handleDeposit = async () => {
  const response = await fetch('/api/wallet/deposit-inr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: depositAmount,
      phoneNumber: phoneNumber  // ← Required for PhonePe
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect to PhonePe payment page
    window.location.href = data.paymentUrl;
  }
};
```

## 🔄 How It Works Now

### Development Mode:
- Uses mock implementation (no real payments)
- Perfect for testing

### Production Mode:
- Uses your real PhonePe credentials
- Processes real payments
- Handles real callbacks

## 📊 Verification Checklist

- [ ] Environment variables added in AWS Amplify Console
- [ ] Application redeployed after adding variables
- [ ] Test endpoint shows variables as "SET"
- [ ] Frontend updated to collect phone numbers
- [ ] Wallet deposit works with phone number
- [ ] Payment redirects to PhonePe page
- [ ] Callback updates wallet balance

## 🚀 Deployment Steps

1. **Add environment variables** in AWS Amplify Console (see above)
2. **Redeploy your application**
3. **Update frontend** to collect phone numbers
4. **Test the integration**
5. **Switch to production URL** when ready

## 🔍 Troubleshooting

### If you get "PhonePe credentials not configured":
- Check environment variables are set correctly
- Verify no typos in variable names
- Redeploy after adding variables

### If payment page doesn't load:
- Check phone number format (10 digits)
- Verify redirect URLs are correct
- Check browser console for errors

### If callback doesn't work:
- Ensure callback URL is accessible
- Check server logs for errors
- Verify transaction ID format

## 📞 Support

If you need help:
1. Check the test endpoint: `/api/test-phonepe-env`
2. Review AWS Amplify build logs
3. Verify PhonePe dashboard credentials
4. Test with sandbox first, then production

## ✅ Your PhonePe Integration is Ready!

With these credentials, your PhonePe integration will work for both localhost and AWS Amplify deployment. The system will automatically use your real credentials instead of the mock implementation.

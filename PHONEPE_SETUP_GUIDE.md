# PhonePe Payment Gateway Setup Guide

## Complete PhonePe Integration for INR Wallet Deposits

### 🎯 What You Need

#### PhonePe Credentials Required:
1. **Merchant ID** - Your unique business identifier
2. **Secret Key** - Used for API authentication
3. **Key Index** - Usually 1 for most merchants
4. **API Endpoint** - Sandbox or Production URL

### 📋 Step-by-Step Setup

#### Step 1: Get PhonePe Credentials

**For Testing (Sandbox):**
1. Visit [PhonePe Business Portal](https://business.phonepe.com/)
2. Sign up for a merchant account
3. Complete KYC process
4. Get your test credentials from the dashboard

**For Production:**
1. Complete merchant verification
2. Get live credentials from PhonePe support
3. Switch to production endpoints

#### Step 2: Environment Variables for AWS Amplify

Add these environment variables in AWS Amplify Console:

```
# PhonePe Configuration
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_SECRET_KEY=your_secret_key_here
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

**For Production, change the base URL to:**
```
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

#### Step 3: Local Development Setup

Create a `.env.local` file in your project root:

```bash
# PhonePe Test Configuration
PHONEPE_MERCHANT_ID=your_test_merchant_id
PHONEPE_SECRET_KEY=your_test_secret_key
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 🔧 Implementation Details

#### What's Already Implemented:

1. **PhonePe Payment Creation** (`src/lib/payments/phonepe.ts`)
   - Creates payment requests
   - Handles authentication
   - Generates secure checksums

2. **Mock Implementation** (`src/lib/payments/phonepe-mock.ts`)
   - For testing without real credentials
   - Simulates successful payments
   - Perfect for development

3. **Wallet Deposit API** (`src/app/api/wallet/deposit-inr/route.ts`)
   - Updated to use PhonePe instead of Razorpay
   - Handles phone number requirement
   - Automatic mock/live switching

4. **Callback Handler** (`src/app/api/wallet/phonepe-callback/route.ts`)
   - Processes payment callbacks
   - Updates wallet balances
   - Handles success/failure scenarios

### 🧪 Testing the Integration

#### Test Environment Variables:
Visit: `https://your-app-domain.com/api/test-phonepe-env`

#### Test Wallet Deposit:
1. Go to your wallet page
2. Enter amount (minimum ₹100)
3. Enter phone number
4. Click "Add Funds"
5. You'll be redirected to PhonePe payment page

### 📱 Frontend Changes Needed

The frontend needs to be updated to:
1. **Collect phone number** - Add phone number input field
2. **Handle PhonePe redirects** - Update payment flow
3. **Show payment status** - Update success/error handling

#### Example Frontend Update:

```tsx
// Add phone number field to your deposit form
const [phoneNumber, setPhoneNumber] = useState('');

// Update the deposit API call
const handleDeposit = async () => {
  const response = await fetch('/api/wallet/deposit-inr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: depositAmount,
      phoneNumber: phoneNumber
    })
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect to PhonePe payment page
    window.location.href = data.paymentUrl;
  }
};
```

### 🔄 Automatic Mock/Live Switching

The system automatically switches between mock and live implementations:

- **Development**: Uses mock implementation (no real payments)
- **Production with credentials**: Uses live PhonePe API
- **Production without credentials**: Falls back to mock

### 📊 Environment Variable Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PHONEPE_MERCHANT_ID` | Your PhonePe merchant ID | `MERCHANT123` |
| `PHONEPE_SECRET_KEY` | Your PhonePe secret key | `secret_key_here` |
| `PHONEPE_KEY_INDEX` | Key index (usually 1) | `1` |
| `PHONEPE_BASE_URL` | API endpoint URL | `https://api-preprod.phonepe.com/apis/pg-sandbox` |

### 🚀 Deployment Steps

1. **Add Environment Variables in AWS Amplify Console**
2. **Redeploy your application**
3. **Test the integration**
4. **Switch to production credentials when ready**

### 🧪 Testing Commands

```bash
# Test environment variables
node test-phonepe-env.js

# Test with your deployed app
node test-phonepe-env.js https://your-app-domain.com/api/test-phonepe-env
```

### 🔍 Troubleshooting

#### Common Issues:

1. **"PhonePe credentials not configured"**
   - Check environment variables are set correctly
   - Verify no typos in variable names
   - Redeploy after adding variables

2. **Payment page not loading**
   - Check phone number format (10 digits)
   - Verify redirect URLs are correct
   - Check browser console for errors

3. **Callback not working**
   - Ensure callback URL is accessible
   - Check server logs for errors
   - Verify transaction ID format

### 📞 Support

If you need help:
1. Check the test endpoint: `/api/test-phonepe-env`
2. Review AWS Amplify build logs
3. Verify PhonePe dashboard credentials
4. Test with mock implementation first

### ✅ Verification Checklist

- [ ] PhonePe credentials obtained
- [ ] Environment variables added in AWS Amplify
- [ ] Application redeployed
- [ ] Test endpoint shows variables as "SET"
- [ ] Wallet deposit works with phone number
- [ ] Payment redirects to PhonePe page
- [ ] Callback updates wallet balance

The PhonePe integration is now complete and ready for testing!

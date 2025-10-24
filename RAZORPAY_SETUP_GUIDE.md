# Razorpay Environment Variables Setup Guide

## Problem
You're getting the error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables in AWS Amplify Console."

## Solution Steps

### 1. Get Your Razorpay Credentials
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to **Settings** > **API Keys**
3. Copy your **Key ID** and **Key Secret**
4. Note: Use **Test Mode** credentials for development, **Live Mode** for production

### 2. Add Environment Variables in AWS Amplify Console

#### For AWS Amplify Console:
1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your application
3. Go to **App settings** > **Environment variables**
4. Add the following variables:

```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_MODE=test
```

**Important Notes:**
- Replace `rzp_test_xxxxxxxxxxxxxxxxx` with your actual Razorpay Key ID
- Replace `xxxxxxxxxxxxxxxxxxxxxxxx` with your actual Razorpay Key Secret
- Use `test` for development, `live` for production
- Make sure there are no extra spaces or quotes around the values

### 3. Redeploy Your Application
After adding the environment variables:
1. Go to your app in AWS Amplify Console
2. Click **Redeploy this version** or trigger a new deployment
3. Wait for the deployment to complete

### 4. Test the Configuration

#### Test Environment Variables:
Visit: `https://your-app-domain.com/api/test-razorpay-env`

This will show you:
- Which environment variables are set
- Configuration status
- Troubleshooting recommendations

#### Test Wallet Deposit:
1. Go to your wallet page
2. Try to deposit ₹100
3. Check if the Razorpay payment dialog appears

### 5. Troubleshooting

#### If you still get the error:

1. **Check Variable Names**: Ensure exact spelling:
   - `RAZORPAY_KEY_ID` (not `RAZORPAY_KEYID`)
   - `RAZORPAY_KEY_SECRET` (not `RAZORPAY_KEYSECRET`)

2. **Check Values**: 
   - No extra spaces
   - No quotes around values
   - Copy-paste directly from Razorpay dashboard

3. **Redeploy**: Environment variables only take effect after redeployment

4. **Check Build Logs**: 
   - Go to AWS Amplify Console
   - Click on your latest build
   - Check the build logs for any errors

#### Common Issues:

**Issue**: Variables show as "SET" but still get error
**Solution**: Check for typos in variable names or values

**Issue**: Variables not showing in test endpoint
**Solution**: Redeploy the application after adding variables

**Issue**: Works locally but not in AWS Amplify
**Solution**: Ensure variables are added in AWS Amplify Console, not just locally

### 6. Verification Checklist

- [ ] Razorpay credentials obtained from dashboard
- [ ] Environment variables added in AWS Amplify Console
- [ ] No typos in variable names
- [ ] No extra spaces in values
- [ ] Application redeployed after adding variables
- [ ] Test endpoint shows variables as "SET"
- [ ] Wallet deposit works without errors

### 7. Support

If you're still having issues:
1. Check the test endpoint: `/api/test-razorpay-env`
2. Review AWS Amplify build logs
3. Verify Razorpay dashboard credentials are correct
4. Ensure you're using the correct environment (test vs live)

## Quick Fix Commands

If you need to quickly test locally, create a `.env.local` file:

```bash
# .env.local
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxxxxx
RAZORPAY_MODE=test
```

**Note**: This is only for local testing. For production, use AWS Amplify Console environment variables.

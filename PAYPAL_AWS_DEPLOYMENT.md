# PayPal Integration - AWS Deployment Checklist

## Issues Fixed

1. ✅ **Missing Payment Success/Cancel Pages**
   - Created `/wallet/payment-success/page.tsx`
   - Created `/wallet/payment-cancel/page.tsx`

2. ✅ **Transaction ID Storage**
   - Updated `WalletSection.tsx` to store transaction ID in localStorage before PayPal redirect

3. ✅ **Firebase Authentication on AWS**
   - Updated `getCurrentUser()` to check custom `x-firebase-token` header
   - Updated `makeAuthenticatedRequest()` to send token in both headers

4. ✅ **Enhanced Logging**
   - Added detailed console logs to PayPal functions for debugging

## AWS Amplify Environment Variables

You **MUST** set these in AWS Amplify Console:

### Required PayPal Variables
```
PAYPAL_MODE=live
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
```

### Required URL Variables
```
NEXT_PUBLIC_APP_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
APP_NAME=WinMicro
```

### Firebase Admin SDK (for authentication)
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Deployment Steps

### 1. Set Environment Variables in AWS Amplify

1. Go to AWS Amplify Console
2. Select your app
3. Go to **Environment variables** (in left sidebar)
4. Add all variables listed above
5. **Important**: Click **Save** after adding all variables

### 2. Verify PayPal Configuration

Make sure your PayPal account has:
- Live credentials activated
- Return URL whitelisted: `https://main.dc7yjcdl4ndq.amplifyapp.com/wallet/payment-success`
- Cancel URL whitelisted: `https://main.dc7yjcdl4ndq.amplifyapp.com/wallet/payment-cancel`

### 3. Deploy to AWS

```bash
git add .
git commit -m "Fix PayPal integration for AWS deployment"
git push origin main
```

AWS Amplify will automatically rebuild and deploy.

### 4. Testing After Deployment

1. **Check Environment Variables**
   - View AWS Amplify build logs
   - Look for PayPal initialization logs

2. **Test PayPal Flow**
   - Go to dashboard → USD wallet
   - Click "Add Funds"
   - Enter amount (e.g., $10)
   - Should redirect to PayPal
   - Complete payment on PayPal
   - Should redirect back to `/wallet/payment-success`
   - Wallet should be credited

3. **Check Server Logs**
   - AWS Amplify → Logs
   - Look for PayPal-related logs:
     - `💰 Creating PayPal order`
     - `✅ PayPal order created`
     - `🔒 Capturing PayPal order`
     - `✅ PayPal payment captured`

## Common Issues and Solutions

### Issue 1: "PayPal credentials not configured"
**Cause**: Environment variables not set in AWS Amplify
**Solution**: 
- Go to AWS Amplify Console → Environment variables
- Add `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET`
- Redeploy the app

### Issue 2: "401 Unauthorized" when calling API
**Cause**: Firebase authentication issue
**Solution**:
- Verify Firebase Admin SDK credentials are set
- Check that `FIREBASE_PRIVATE_KEY` includes newlines: `\n`
- Verify token is being sent in `x-firebase-token` header

### Issue 3: Payment completes but wallet not credited
**Cause**: Missing transaction ID or callback failure
**Solution**:
- Check browser console for errors in `/wallet/payment-success`
- Verify transaction ID exists in localStorage
- Check server logs for callback API errors

### Issue 4: PayPal redirects to wrong URL
**Cause**: `NEXT_PUBLIC_APP_URL` pointing to localhost
**Solution**:
- Update `NEXT_PUBLIC_APP_URL` to production URL
- Redeploy the app

### Issue 5: "Return URL not whitelisted" error from PayPal
**Cause**: PayPal account doesn't have production URLs whitelisted
**Solution**:
- Log in to PayPal Developer Dashboard
- Go to your app settings
- Add return URLs to whitelist

## Testing Checklist

- [ ] Environment variables set in AWS Amplify
- [ ] App deployed successfully
- [ ] Can access dashboard
- [ ] USD wallet shows balance
- [ ] "Add Funds" button works
- [ ] PayPal redirect works
- [ ] Can complete payment on PayPal
- [ ] Redirected back to `/wallet/payment-success`
- [ ] Success message displayed
- [ ] Wallet balance updated
- [ ] Transaction appears in transaction history

## Monitoring

Check these logs after deployment:

1. **AWS Amplify Build Logs**
   - Verify build succeeds
   - No missing environment variables

2. **AWS Amplify Server Logs**
   - Look for PayPal API calls
   - Check for errors in callback processing

3. **Browser Console (Production)**
   - Check for client-side errors
   - Verify API calls succeed

## Support

If issues persist:
1. Check AWS Amplify logs
2. Check browser console errors
3. Verify all environment variables are set
4. Test with sandbox mode first: `PAYPAL_MODE=sandbox`

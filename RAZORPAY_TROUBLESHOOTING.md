# 🚨 Razorpay Environment Variables Not Loading - Troubleshooting Guide

## 🔍 **Step 1: Check Environment Variables in AWS Amplify**

1. **Go to AWS Amplify Console**
   - Navigate to: `https://console.aws.amazon.com/amplify/`
   - Select your microwin app

2. **Check Environment Variables**
   - Go to **App settings** → **Environment variables**
   - Verify these variables exist:
     ```
     RAZORPAY_KEY_ID=RKJJRRN5QBmU9V
     RAZORPAY_KEY_SECRET=rzp_live_RMEyuyGizJQ9DK
     RAZORPAY_MODE=live
     ```

3. **Common Issues:**
   - ❌ Variables not saved (click **Save** after adding)
   - ❌ Typos in variable names
   - ❌ Extra spaces in values
   - ❌ Variables on wrong branch

## 🔧 **Step 2: Test Environment Variables**

Visit this URL to check if variables are loaded:
```
https://main.dc7yjcdl4ndq.amplifyapp.com/api/debug/razorpay?key=debug123
```

**Expected Result:**
```json
{
  "success": true,
  "razorpay": {
    "keyId": "[SET]",
    "keySecret": "[SET]",
    "mode": "live",
    "keyIdValue": "RKJJRRN5Q...",
    "keySecretValue": "rzp_live_RM..."
  }
}
```

**If you see `[MISSING]`** - Environment variables are not set correctly.

## 🚀 **Step 3: Force Redeploy**

1. **Trigger Manual Redeploy:**
   - Go to **Deployments** tab in AWS Amplify
   - Click **Redeploy this version**
   - Wait for deployment to complete

2. **Or Push a Small Change:**
   ```bash
   git add .
   git commit -m "Force redeploy for Razorpay environment variables"
   git push origin main
   ```

## 🔍 **Step 4: Check Build Logs**

1. **Go to AWS Amplify Console**
2. **Click on latest deployment**
3. **Check build logs for:**
   - Environment variables being loaded
   - Any build errors
   - Razorpay configuration messages

## 🛠️ **Step 5: Alternative Solution - Hardcode for Testing**

If environment variables still don't work, temporarily hardcode for testing:

```typescript
// In src/lib/payments/razorpay.ts
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'RKJJRRN5QBmU9V';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_live_RMEyuyGizJQ9DK';
```

**⚠️ Remove hardcoded values after fixing environment variables!**

## 📋 **Step 6: Complete Environment Variables Checklist**

**Required Variables:**
- ✅ `RAZORPAY_KEY_ID=RKJJRRN5QBmU9V`
- ✅ `RAZORPAY_KEY_SECRET=rzp_live_RMEyuyGizJQ9DK`
- ✅ `RAZORPAY_MODE=live`

**Keep Existing Variables:**
- ✅ `PAYPAL_CLIENT_ID=...`
- ✅ `PAYPAL_SECRET=...`
- ✅ `PAYPAL_MODE=live`
- ✅ `NEXT_PUBLIC_APP_URL=https://main.dc7yjcdl4ndq.amplifyapp.com`
- ✅ `APP_NAME=WinMicro`

**Remove PhonePe Variables:**
- ❌ `PHONEPE_BASE_URL`
- ❌ `PHONEPE_KEY_INDEX`
- ❌ `PHONEPE_MERCHANT_ID`
- ❌ `PHONEPE_SECRET_KEY`

## 🎯 **Step 7: Test After Fix**

1. **Check Debug Endpoint:**
   ```
   https://main.dc7yjcdl4ndq.amplifyapp.com/api/debug/razorpay?key=debug123
   ```

2. **Test INR Deposit:**
   - Go to wallet page
   - Click "Add Funds" for INR
   - Should open Razorpay modal (no error)

## 🚨 **If Still Not Working:**

1. **Check AWS Amplify Build Logs**
2. **Verify all environment variables are set**
3. **Try manual redeploy**
4. **Contact AWS Support if needed**

---

**Expected Result:** Razorpay integration should work without "credentials not configured" error.

# 🚀 Razorpay Setup - Complete Guide

## 🔧 **Step 1: Get Razorpay Credentials**

You need to get the correct Razorpay credentials from your Razorpay dashboard:

1. **Go to Razorpay Dashboard:**
   - Visit: `https://dashboard.razorpay.com/`
   - Login to your account

2. **Get API Keys:**
   - Go to **Settings** → **API Keys**
   - Copy your **Key ID** and **Key Secret**
   - Make sure you're using **LIVE** credentials (not test)

## 🔑 **Step 2: Add Environment Variables to AWS Amplify**

1. **Go to AWS Amplify Console:**
   - `https://console.aws.amazon.com/amplify/`
   - Select your microwin app

2. **Add Environment Variables:**
   - Go to **App settings** → **Environment variables**
   - Add these variables:

   ```
   RAZORPAY_KEY_ID=your_actual_key_id_from_razorpay
   RAZORPAY_KEY_SECRET=your_actual_key_secret_from_razorpay
   RAZORPAY_MODE=live
   ```

3. **Click SAVE** (very important!)

## 🧪 **Step 3: Test Locally**

1. **Start local server:**
   ```bash
   npm run dev
   ```

2. **Visit debug page:**
   ```
   http://localhost:3000/debug/razorpay
   ```

3. **Test environment variables:**
   - Click "Check Environment Variables"
   - Should show [MISSING] locally (this is normal)

4. **Test Razorpay integration:**
   - Click "Test Razorpay Integration"
   - Should show error locally (this is normal without credentials)

## 🚀 **Step 4: Deploy and Test**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Add Razorpay debug page and testing"
   git push origin main
   ```

2. **Wait for AWS Amplify deployment**

3. **Test on live site:**
   - Go to your wallet page
   - Try adding funds in INR
   - Should work with Razorpay!

## 🔍 **Step 5: Debug on Live Site**

Visit this URL to check if environment variables are loaded:
```
https://main.dc7yjcdl4ndq.amplifyapp.com/debug/razorpay
```

**Expected Results:**
- ✅ Environment Variables: Should show [SET] for keyId and keySecret
- ✅ Integration Test: Should return orderId and keyId
- ✅ No errors in debug results

## 🚨 **Common Issues & Solutions:**

### Issue 1: "Credentials not configured" error
**Solution:** Add environment variables to AWS Amplify Console

### Issue 2: "Authentication failed" error
**Solution:** Check if Razorpay credentials are correct and live mode

### Issue 3: 404 error on debug page
**Solution:** Wait for deployment to complete, then try again

### Issue 4: Environment variables show [MISSING]
**Solution:** 
1. Check AWS Amplify Console
2. Make sure variables are saved
3. Redeploy the app

## 📋 **Complete Environment Variables List:**

**Razorpay (NEW):**
```
RAZORPAY_KEY_ID=your_key_id_from_razorpay_dashboard
RAZORPAY_KEY_SECRET=your_key_secret_from_razorpay_dashboard
RAZORPAY_MODE=live
```

**PayPal (KEEP):**
```
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
PAYPAL_MODE=live
```

**App Configuration (KEEP):**
```
NEXT_PUBLIC_APP_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
APP_NAME=WinMicro
```

## 🎯 **Expected Final Result:**

- ✅ Razorpay integration works on live site
- ✅ Users can add funds in INR via Razorpay
- ✅ Payment modal opens without errors
- ✅ Wallet balance updates after successful payment
- ✅ No more "credentials not configured" errors

---

**Next Steps:**
1. Get correct Razorpay credentials from dashboard
2. Add them to AWS Amplify environment variables
3. Test the integration
4. Enjoy seamless INR deposits! 🚀

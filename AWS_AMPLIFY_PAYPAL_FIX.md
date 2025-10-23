# AWS Amplify PayPal Integration Fix

## 🚨 Problem Identified
Your PayPal integration works on localhost but fails on AWS Amplify with "unauthorized" error because **environment variables are missing** in your AWS Amplify deployment.

## ✅ Solution Steps

### Step 1: Set Environment Variables in AWS Amplify Console

1. **Go to AWS Amplify Console**
   - Navigate to your app: `https://console.aws.amazon.com/amplify/`
   - Select your microwin app

2. **Add Environment Variables**
   - Go to **App settings** → **Environment variables**
   - Add these variables:

```
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
PAYPAL_MODE=live
NEXT_PUBLIC_APP_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
APP_NAME=WinMicro
```

### Step 2: Firebase Admin SDK Variables (if using Firebase auth)

```
FIREBASE_ADMIN_PROJECT_ID=your-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Step 3: Redeploy Your App

After adding environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy this version** or push a new commit
3. Wait for deployment to complete

## 🔧 Enhanced Error Handling

I'll also add better error handling to help debug future issues.

## 🧪 Testing Steps

1. **Check Environment Variables**
   - Add a test endpoint to verify variables are loaded
   - Check browser console for detailed error messages

2. **Test PayPal Integration**
   - Try adding funds in USD
   - Check if redirect to PayPal works
   - Verify payment completion

## 📋 Verification Checklist

- [ ] Environment variables added to AWS Amplify
- [ ] App redeployed with new variables
- [ ] PayPal credentials are LIVE (not sandbox)
- [ ] NEXT_PUBLIC_APP_URL points to correct domain
- [ ] Firebase Admin SDK configured (if using Firebase auth)
- [ ] Test payment flow works end-to-end

## 🚀 Quick Fix Commands

```bash
# Push any changes to trigger redeploy
git add .
git commit -m "Fix PayPal environment variables for AWS Amplify"
git push origin main
```

## 🔍 Debugging Tools

If issues persist, check:
1. AWS Amplify build logs
2. Browser console for detailed errors
3. PayPal developer dashboard for API logs
4. Network tab for failed requests

---

**Expected Result**: PayPal integration should work on live site after environment variables are properly configured.

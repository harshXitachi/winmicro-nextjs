# Deposit Error Fix - Quick Checklist

## Current Errors
- ❌ **401 Unauthorized** when calling `/api/wallet/deposit-inr`
- ❌ **Razorpay credentials not configured**

## Fix Steps

### 1. ✅ Add Environment Variables to AWS Amplify

Go to AWS Amplify Console → Your App → Environment variables

Add these variables:

#### Firebase Admin (for authentication)
```
FIREBASE_ADMIN_PROJECT_ID=<from Firebase Console>
FIREBASE_ADMIN_CLIENT_EMAIL=<from Firebase Console>
FIREBASE_ADMIN_PRIVATE_KEY=<from Firebase Console>
```

#### Razorpay (for payments)
```
RAZORPAY_KEY_ID=<from Razorpay Dashboard>
RAZORPAY_KEY_SECRET=<from Razorpay Dashboard>
RAZORPAY_MODE=live
```

### 2. ✅ Get Firebase Admin Credentials

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon ⚙️ → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate new private key**
6. Download JSON file
7. Open the JSON file and copy:
   - `project_id` → use for FIREBASE_ADMIN_PROJECT_ID
   - `client_email` → use for FIREBASE_ADMIN_CLIENT_EMAIL
   - `private_key` → use for FIREBASE_ADMIN_PRIVATE_KEY

### 3. ✅ Get Razorpay Credentials

1. Open [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **API Keys**
3. Click **Generate Key** (if you don't have one)
4. Copy:
   - **Key ID** (starts with `rzp_test_` or `rzp_live_`)
   - **Key Secret** (click "Show" to reveal)

**Note:** For production, use **Live Mode** keys. For testing, use **Test Mode** keys.

### 4. ✅ Save and Redeploy

1. Click **Save** in AWS Amplify Environment Variables
2. Go to **Deployments** tab
3. Click **Redeploy this version** (or push a new commit)
4. Wait for deployment to complete (~5-10 minutes)

### 5. ✅ Test the Fix

1. Open your deployed website
2. Log out and log back in (to get fresh token)
3. Go to Wallet page
4. Try to deposit INR
5. Should now see Razorpay payment dialog

## Verification Commands

After deployment, check logs in AWS Amplify:

Look for these success messages:
```
✅ Firebase token verified for user: xxx
✅ Razorpay order created: order_xxx
```

If you see errors, check:
```
❌ Firebase Admin not initialized!
❌ Razorpay credentials missing!
```

## Common Issues

### Issue 1: Still getting 401 error
**Solution:**
- Check if Firebase variables are saved in Amplify
- Check if variable names are exactly correct (case-sensitive)
- Try logging out and logging back in
- Clear browser cache

### Issue 2: Razorpay error still showing
**Solution:**
- Check if Razorpay variables are saved in Amplify
- Verify Key ID and Secret are correct
- Make sure RAZORPAY_MODE is set
- Redeploy application

### Issue 3: Private key format error
**Solution:**
- Make sure `\n` characters are preserved in the private key
- Don't add extra quotes or spaces
- Copy entire key including BEGIN and END lines

## Quick Test Locally (Optional)

If you want to test locally first:

1. Create `.env.local`:
```bash
cp .env.example .env.local
```

2. Add all environment variables to `.env.local`

3. Run:
```bash
npm run dev
```

4. Test at http://localhost:3000

## Need Help?

Check the detailed guide: `AWS_AMPLIFY_SETUP.md`

## Status Tracking

- [ ] Firebase credentials added to AWS Amplify
- [ ] Razorpay credentials added to AWS Amplify
- [ ] Application redeployed
- [ ] Login tested
- [ ] Deposit tested
- [ ] No errors in browser console
- [ ] No errors in AWS Amplify logs

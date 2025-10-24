# AWS Amplify Environment Variables Setup

## Problem
When deploying to AWS Amplify, the application shows these errors:
1. **401 Unauthorized** - Firebase authentication failing
2. **Razorpay credentials not configured** - Missing payment gateway credentials

## Solution

### Step 1: Access AWS Amplify Console

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app (winmicro-nextjs)
3. Click on **"Environment variables"** in the left sidebar under "App settings"

### Step 2: Add Required Environment Variables

Add the following environment variables:

#### Firebase Admin SDK (Required for Authentication)
```
FIREBASE_ADMIN_PROJECT_ID=your-firebase-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYour\nMultiline\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----
```

**How to get Firebase Admin credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click gear icon → Project Settings → Service Accounts
4. Click "Generate new private key"
5. Download the JSON file
6. Extract values:
   - `project_id` → FIREBASE_ADMIN_PROJECT_ID
   - `client_email` → FIREBASE_ADMIN_CLIENT_EMAIL
   - `private_key` → FIREBASE_ADMIN_PRIVATE_KEY (keep the \n characters)

#### Razorpay Payment Gateway (Required for Deposits)
```
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret_key
RAZORPAY_MODE=live
```

**How to get Razorpay credentials:**
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Navigate to Settings → API Keys
3. Generate new keys if needed
4. Copy:
   - Key ID → RAZORPAY_KEY_ID
   - Key Secret → RAZORPAY_KEY_SECRET
5. Set RAZORPAY_MODE to:
   - `test` for test mode (use test keys)
   - `live` for production mode (use live keys)

#### Other Required Variables
```
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id
```

### Step 3: Redeploy Application

After adding all environment variables:
1. Click **"Save"** in AWS Amplify Console
2. Go to **"Deployments"** tab
3. Click **"Redeploy this version"** or push a new commit
4. Wait for deployment to complete

### Step 4: Verify Setup

After deployment completes:
1. Open your deployed application
2. Try to log in
3. Try to deposit INR
4. Check browser console and AWS Amplify logs for any errors

## Troubleshooting

### Issue: Still getting 401 Unauthorized

**Possible causes:**
- Firebase Admin credentials not set correctly
- Private key format incorrect (ensure \n are preserved)
- User needs to log out and log back in
- Browser cache (try incognito mode)

**Solution:**
```bash
# Check AWS Amplify logs
# Go to Amplify Console → Your App → Monitoring → Logs
# Look for:
# ✅ Firebase token verified for user: xxx
# ❌ Firebase token verification failed: yyy
```

### Issue: Razorpay credentials not configured

**Possible causes:**
- Environment variables not set in AWS Amplify
- Variables not saved before deployment
- Typo in variable names

**Solution:**
1. Double-check variable names (case-sensitive)
2. Ensure no extra spaces in values
3. Redeploy after saving changes

### Issue: Private key format error

Firebase private key must preserve line breaks. In AWS Amplify:
- Use the actual `\n` characters (not actual line breaks)
- Example:
  ```
  -----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----
  ```

## Testing Locally

To test with the same environment variables locally:

1. Create `.env.local` file:
```bash
# Copy .env.example to .env.local
cp .env.example .env.local
```

2. Add all the above environment variables to `.env.local`

3. Run development server:
```bash
npm run dev
```

4. Test deposits at http://localhost:3000

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env.local` or any file with real credentials to Git
- Keep your Razorpay secret keys secure
- Use test mode for development
- Use live mode only in production
- Rotate keys if compromised

## Quick Reference

| Variable | Required | Where to Get |
|----------|----------|--------------|
| FIREBASE_ADMIN_PROJECT_ID | ✅ | Firebase Console → Project Settings |
| FIREBASE_ADMIN_CLIENT_EMAIL | ✅ | Firebase Console → Service Accounts |
| FIREBASE_ADMIN_PRIVATE_KEY | ✅ | Firebase Console → Generate Private Key |
| RAZORPAY_KEY_ID | ✅ | Razorpay Dashboard → API Keys |
| RAZORPAY_KEY_SECRET | ✅ | Razorpay Dashboard → API Keys |
| RAZORPAY_MODE | ✅ | Set to `test` or `live` |
| JWT_SECRET | ✅ | Generate random 32+ char string |

## Support

If issues persist after following this guide:
1. Check AWS Amplify build logs
2. Check AWS Amplify runtime logs
3. Check browser console for errors
4. Verify Firebase and Razorpay accounts are active

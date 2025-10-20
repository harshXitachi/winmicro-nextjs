# AWS Amplify Deployment Checklist

## ✅ Environment Variables to Add in AWS Amplify Console

### Step 1: Go to AWS Amplify Console
1. Open AWS Amplify Console
2. Select your app: **main.dc7yjcdl4ndq**
3. Click **Environment variables** (left sidebar)
4. Click **Manage variables**

---

### Step 2: Add These Variables (Copy & Paste)

```
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
PHONEPE_KEY_INDEX=1

PAYPAL_MODE=live
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm

NEXT_PUBLIC_APP_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
NEXT_PUBLIC_API_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
APP_NAME=WinMicro
```

---

### Step 3: Add One by One in Amplify

For each variable above:
1. Click **Add variable**
2. **Key**: Copy the name (e.g., `PHONEPE_BASE_URL`)
3. **Value**: Copy the value (e.g., `https://api.phonepe.com/apis/hermes`)
4. Click **Add**
5. Repeat for all variables

---

### Step 4: Redeploy

1. After adding all variables, click **Save**
2. Go to **App settings** → **Redeploy this version**
3. Or push a new commit to trigger automatic deployment

---

## 🔍 Verify Setup

After deployment completes:

### 1. Check Wallet Page:
- Visit: https://main.dc7yjcdl4ndq.amplifyapp.com/wallet
- Try depositing ₹10 or $5
- Should redirect to PhonePe/PayPal

### 2. Check Browser Console:
- Press F12 → Console tab
- Should NOT see any "credentials not configured" errors

### 3. Test Small Payment:
- Complete a real payment with small amount
- Verify balance updates
- Check admin wallet receives commission

---

## 📝 Important Notes

### ⚠️ Database Configuration
Make sure you also have these set in Amplify:
```
DATABASE_URL=your-actual-database-url
JWT_SECRET=your-strong-secret-key
```

### 🔒 Security
- All payment credentials are now LIVE
- Test with small amounts first
- Monitor transactions closely

### 🐛 If Payments Fail
1. Check Amplify build logs for errors
2. Verify all environment variables are set
3. Check PhonePe/PayPal dashboard for issues
4. Review `PAYMENT_SETUP_GUIDE.md` troubleshooting section

---

## ✅ Deployment Complete!

Once environment variables are added and app is redeployed:
- ✅ PhonePe will accept real INR payments
- ✅ PayPal will accept real USD payments
- ✅ Commissions will auto-credit to admin wallet
- ✅ Users can withdraw to bank accounts

**Your payment system is now LIVE!** 🎉

---

## 📞 Quick Support

**Payment not working?**
1. Check environment variables in Amplify Console
2. Redeploy the app
3. Clear browser cache and try again
4. Check server logs in Amplify Console → Logs

**Need to update credentials?**
1. Go to Environment variables in Amplify
2. Edit the variable
3. Save and redeploy

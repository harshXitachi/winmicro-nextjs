# Payment Gateway Setup Guide

## ✅ Payment Credentials Configured

Your PhonePe and PayPal credentials have been added to:
- `.env` (local development)
- `.env.production` (AWS/production deployment)

---

## 🚨 IMPORTANT: Update Your Domain URLs

**BEFORE DEPLOYING**, you MUST replace these placeholder URLs with your actual domain:

```env
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

### Find Your Domain:
1. **AWS Amplify**: Check your Amplify Console → Domain Management
2. **EC2/Custom**: Use your server's domain or IP

### Example:
```env
NEXT_PUBLIC_APP_URL=https://winmicro.amplifyapp.com
NEXT_PUBLIC_API_URL=https://winmicro.amplifyapp.com
```

---

## 📋 Next Steps

### For Local Development:
1. Update URLs in `.env`:
   ```bash
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_API_URL=http://localhost:3000
   ```

2. Restart your dev server:
   ```bash
   npm run dev
   ```

### For AWS Deployment:

#### Option A: AWS Amplify Console
1. Go to AWS Amplify Console
2. Select your app
3. Go to **Environment variables**
4. Add these variables:
   ```
   PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
   PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
   PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
   PHONEPE_KEY_INDEX=1
   
   PAYPAL_MODE=live
   PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
   PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
   
   NEXT_PUBLIC_APP_URL=https://your-actual-domain.com
   NEXT_PUBLIC_API_URL=https://your-actual-domain.com
   APP_NAME=WinMicro
   ```

5. Redeploy your app

#### Option B: EC2 or Other
1. SSH into your server
2. Update `.env` or `.env.production` with your domain
3. Restart your application:
   ```bash
   # If using pm2
   pm2 restart all
   
   # If using Docker
   docker-compose restart
   
   # If using systemd
   sudo systemctl restart your-app
   ```

---

## 🔐 Security Reminders

### ⚠️ NEVER commit `.env` to Git:
- `.env` is already in `.gitignore`
- Double-check before pushing code
- Use environment variables in production

### 🔒 Keep credentials secure:
- Don't share these credentials publicly
- Don't paste them in chat logs or screenshots
- Rotate keys if compromised

### 🛡️ Production checklist:
- [ ] Replace `JWT_SECRET` with a strong random string
- [ ] Update `DATABASE_URL` with your real database connection
- [ ] Set correct domain URLs
- [ ] Enable HTTPS on your domain
- [ ] Test payments in small amounts first

---

## 🧪 Testing Payments

### Test INR Payment (PhonePe):
1. Go to your website → Wallet → Deposit
2. Select **INR**
3. Enter amount (e.g., ₹10)
4. Enter phone number
5. Click "Proceed to PhonePe"
6. Complete payment
7. Check if:
   - User balance increases
   - Commission goes to admin wallet
   - Transaction shows in history

### Test USD Payment (PayPal):
1. Go to Wallet → Deposit
2. Select **USD**
3. Enter amount (e.g., $5)
4. Click "Proceed to PayPal"
5. Complete payment
6. Verify same checks as above

---

## 🐛 Troubleshooting

### "PhonePe credentials not configured"
- Check environment variables are set
- Restart your server after updating .env
- Verify no typos in variable names

### "Payment gateway timeout"
- Check your internet connection
- Verify PhonePe/PayPal services are up
- Check server logs for errors

### Callback not working:
- Ensure `NEXT_PUBLIC_API_URL` is publicly accessible
- PhonePe/PayPal must be able to reach your callback URL
- If localhost, use ngrok for testing

### Commission not credited:
- Check admin wallet exists in database:
  ```sql
  SELECT * FROM admin_wallets WHERE currency = 'INR';
  ```
- Verify commission settings are enabled
- Check transaction logs

---

## 📊 Admin Panel

### View Commission Earnings:
1. Login as admin
2. Go to Admin Dashboard
3. Click "Wallet Management"
4. See commission balance by currency

### Withdraw Commission:
1. In Admin Wallet panel
2. Select currency
3. Enter withdrawal amount
4. Provide bank details
5. Submit request

---

## 🎉 You're All Set!

Once you:
1. ✅ Update domain URLs in `.env` or AWS Console
2. ✅ Restart/redeploy your app
3. ✅ Test a small payment

Your payment system will be **LIVE** and accepting real money! 💰

**Support**: Check `COMMISSION_WALLET_FIXES.md` for detailed implementation docs.

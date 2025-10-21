# 🚨 PhonePe Merchant Activation Required

## Current Issue
Your PhonePe payment integration is returning error:
```
"Key not found for the merchant"
Error Code: KEY_NOT_CONFIGURED or CK015
```

This means your merchant account needs activation or credentials are incorrect.

---

## ✅ Steps to Activate Your PhonePe Merchant Account

### 1. **Verify Your Credentials**
Your current credentials in `.env`:
```env
PHONEPE_MERCHANT_ID=M22AFUJH1IZRR
PHONEPE_SECRET_KEY=c7199d0e-5854-41f5-9604-3ae51eb8b3d1
PHONEPE_KEY_INDEX=1
```

**Questions to verify:**
- [ ] Did you get these credentials from PhonePe's official dashboard?
- [ ] Is your merchant account fully activated?
- [ ] Have you completed KYC verification?
- [ ] Are these production credentials (not sandbox)?

---

### 2. **Contact PhonePe Support**

#### Option A: Email Support
📧 **Email:** business@phonepe.com

**Template Email:**
```
Subject: Merchant Account Activation - M22AFUJH1IZRR

Dear PhonePe Team,

I am facing "Key not found for merchant" error with my merchant account.

Merchant ID: M22AFUJH1IZRR
Error Code: KEY_NOT_CONFIGURED
Issue: Unable to initiate payments via Payment Gateway API

Please help me:
1. Verify if my merchant account is fully activated
2. Confirm if my secret key is correct
3. Check if I need to complete any additional steps

Thank you!
```

#### Option B: PhonePe Merchant Portal
🌐 **Portal:** https://merchant.phonepe.com
1. Login with your merchant credentials
2. Check account status
3. Verify API credentials
4. Check for pending verifications

#### Option C: PhonePe Support Portal
🌐 **Support:** https://business.phonepe.com/support
- Create a support ticket
- Select "Payment Gateway Integration"
- Provide your merchant ID

---

### 3. **Check Account Status**

Your merchant account might need:
- ✅ Business registration documents
- ✅ Bank account verification
- ✅ KYC completion (Aadhaar, PAN, GST)
- ✅ Website/app verification
- ✅ Callback URL whitelisting

---

### 4. **Whitelist Callback URLs**

PhonePe requires you to whitelist your callback URLs:

**Your current URLs:**
```
Redirect URL: https://main.dc7yjcdl4ndq.amplifyapp.com
Callback URL: https://main.dc7yjcdl4ndq.amplifyapp.com/api/wallet/phonepe-callback
```

**Steps:**
1. Login to PhonePe merchant dashboard
2. Go to Settings → API Configuration
3. Add your callback URLs
4. Save and wait for approval (24-48 hours)

---

### 5. **Test with PhonePe Sandbox (Alternative)**

If you want to test immediately while waiting for production activation:

#### Update `.env` with sandbox credentials:
```env
# PhonePe Sandbox/UAT Environment
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/hermes
PHONEPE_MERCHANT_ID=PGTESTPAYUAT
PHONEPE_SECRET_KEY=099eb0cd-02cf-4e2a-8aca-3e6c6aff0399
PHONEPE_KEY_INDEX=1
```

**Note:** Sandbox credentials are publicly available and meant for testing only. No real money is processed.

---

## 🔧 Quick Test (After Activation)

Once your account is activated, test with this command:

```bash
node -e "
const crypto = require('crypto');
const merchantId = 'M22AFUJH1IZRR';
const secretKey = 'c7199d0e-5854-41f5-9604-3ae51eb8b3d1';
const payload = JSON.stringify({merchantId, merchantTransactionId: 'TEST_' + Date.now(), merchantUserId: 'test', amount: 100, redirectUrl: 'http://test.com', callbackUrl: 'http://test.com', mobileNumber: '9999999999', paymentInstrument: {type: 'PAY_PAGE'}});
const base64 = Buffer.from(payload).toString('base64');
const hash = crypto.createHash('sha256').update(base64 + secretKey).digest('hex');
const xVerify = hash + '###1';
fetch('https://api.phonepe.com/apis/hermes/pg/v1/pay', {
  method: 'POST',
  headers: {'Content-Type': 'application/json', 'X-VERIFY': xVerify, 'X-MERCHANT-ID': merchantId},
  body: JSON.stringify({request: base64})
}).then(r => r.json()).then(d => console.log('PhonePe Response:', JSON.stringify(d, null, 2))).catch(e => console.error('Error:', e));
"
```

Expected success response:
```json
{
  "success": true,
  "code": "PAYMENT_INITIATED",
  "message": "Payment initiated",
  "data": {
    "instrumentResponse": {
      "redirectInfo": {
        "url": "https://..."
      }
    }
  }
}
```

---

## 📞 PhonePe Contact Information

| Contact Type | Details |
|--------------|---------|
| **Business Email** | business@phonepe.com |
| **Support Email** | merchantsupport@phonepe.com |
| **Merchant Portal** | https://merchant.phonepe.com |
| **Developer Docs** | https://developer.phonepe.com/docs |
| **Support Phone** | Check merchant dashboard for dedicated account manager |

---

## 🎯 Timeline

| Step | Estimated Time |
|------|---------------|
| KYC Verification | 1-2 business days |
| Account Activation | 2-3 business days |
| Callback URL Whitelisting | 24-48 hours |
| First Test Payment | Immediate after activation |

---

## ⚠️ Important Notes

1. **Don't share credentials publicly** - Keep your secret key secure
2. **Use production credentials only in production** - Don't commit to Git
3. **Test small amounts first** - Try ₹1-10 transactions initially
4. **Monitor transaction logs** - Check PhonePe dashboard regularly
5. **Keep backup payment method** - Consider adding PayPal as alternative

---

## 🚀 What Happens After Activation

Once PhonePe activates your account:
1. ✅ The error will disappear
2. ✅ Users will redirect to real PhonePe payment page
3. ✅ Payments will be processed normally
4. ✅ Money will be credited to your business account
5. ✅ All transactions will appear in PhonePe merchant dashboard

---

## 💡 Alternative: Use PayPal (Already Configured)

Your PayPal integration is already set up and working. You can:
- Use PayPal for USD payments
- Use it as primary payment method until PhonePe is activated
- Offer both options to users

PayPal credentials in `.env`:
```env
PAYPAL_CLIENT_ID=AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE
PAYPAL_SECRET=EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm
PAYPAL_MODE=production
```

---

## 📝 Summary

**Current Status:** ❌ PhonePe not activated  
**Action Required:** Contact PhonePe support  
**Estimated Time:** 2-5 business days  
**Alternative:** Use PayPal or mock mode for testing  

**Your app is configured correctly** - it's just waiting for PhonePe to activate your merchant account! 🎉

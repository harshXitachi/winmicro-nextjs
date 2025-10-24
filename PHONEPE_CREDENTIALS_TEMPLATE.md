# PhonePe Credentials Template

## 🔑 **PhonePe Merchant Credentials**

### **For AWS Amplify Environment Variables:**

```bash
# PhonePe Production Credentials
PHONEPE_MERCHANT_ID=PHONEPE_MERCHANT_ID_HERE
PHONEPE_SECRET_KEY=PHONEPE_SECRET_KEY_HERE
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes

# For Testing (Sandbox) - Use this first
# PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### **How to Get These Credentials:**

1. **Visit**: https://business.phonepe.com/
2. **Sign Up** as a merchant
3. **Complete KYC** process
4. **Get credentials** from PhonePe dashboard
5. **Replace the placeholder values** above

### **Example (DO NOT USE THESE - GET YOUR OWN):**
```bash
PHONEPE_MERCHANT_ID=PHONEPE123456789
PHONEPE_SECRET_KEY=sk_test_1234567890abcdef
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

### **Important Notes:**
- ✅ **Never commit real credentials to code**
- ✅ **Only add them to AWS Amplify environment variables**
- ✅ **Test with sandbox first, then production**
- ✅ **Keep credentials secure and private**

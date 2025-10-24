# 🚀 PhonePe Live Production Setup - AWS Amplify

## 📋 **Step 1: Get PhonePe Merchant Credentials**

### **PhonePe Business Account Setup:**
1. **Visit**: [PhonePe Business Portal](https://business.phonepe.com/)
2. **Sign Up**: Create a merchant account
3. **Complete KYC**: Submit required documents
4. **Get Credentials**: From your PhonePe dashboard

### **Required Credentials:**
- **Merchant ID**: Your unique merchant identifier
- **Secret Key**: Your API secret key
- **Key Index**: Usually `1` (default)

---

## 🔑 **Step 2: AWS Amplify Environment Variables**

Add these environment variables in **AWS Amplify Console**:

### **Go to AWS Amplify Console:**
1. **AWS Console** → **AWS Amplify**
2. **Select your app** → **App settings** → **Environment variables**
3. **Add the following variables:**

```bash
# PhonePe Production Credentials
PHONEPE_MERCHANT_ID=your_merchant_id_here
PHONEPE_SECRET_KEY=your_secret_key_here
PHONEPE_KEY_INDEX=1
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes

# Existing Variables (Keep These)
NEXT_PUBLIC_APP_URL=https://your-app-domain.amplifyapp.com
APP_NAME=WinMicro
```

### **For Testing (Sandbox):**
```bash
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pg-sandbox
```

### **For Production (Live):**
```bash
PHONEPE_BASE_URL=https://api.phonepe.com/apis/hermes
```

---

## 🧪 **Step 3: Test PhonePe Integration**

### **Test Environment Variables:**
Visit: `https://your-app-domain.amplifyapp.com/api/test-phonepe-env`

Should show:
- ✅ PhonePe credentials configured
- ✅ Using live PhonePe integration
- ✅ All environment variables set

---

## 🔄 **Step 4: Deploy Updates**

### **Commit and Push Changes:**
```bash
git add .
git commit -m "Enable PhonePe live integration for production"
git push origin main
```

### **AWS Amplify will automatically:**
- ✅ Build your application
- ✅ Deploy to production
- ✅ Use live PhonePe credentials
- ✅ Enable real payment processing

---

## 📱 **Step 5: Test Live Payment**

### **After Deployment:**
1. **Visit your live app**
2. **Go to Dashboard** → **Add Funds**
3. **Enter amount & phone number**
4. **Click "Proceed to PhonePe"**
5. **Complete real payment**
6. **Check wallet balance updates**

---

## 🚨 **Important Notes**

### **Mock vs Live Mode:**
- **Development**: Always uses mock mode (safe for testing)
- **Production**: Uses live mode when credentials are set
- **Automatic Detection**: No code changes needed

### **Security:**
- ✅ Credentials are stored securely in AWS Amplify
- ✅ Never commit credentials to code
- ✅ Environment variables are encrypted

### **Monitoring:**
- **Check AWS Amplify logs** for any errors
- **Monitor PhonePe dashboard** for transactions
- **Test with small amounts** first

---

## 🆘 **Troubleshooting**

### **If Payment Fails:**
1. **Check AWS Amplify logs**
2. **Verify PhonePe credentials**
3. **Check PhonePe merchant account status**
4. **Test with sandbox first**

### **If Balance Doesn't Update:**
1. **Check callback URL accessibility**
2. **Verify database connection**
3. **Check transaction logs**

---

## ✅ **Success Checklist**

- [ ] PhonePe merchant account created
- [ ] KYC completed
- [ ] Credentials obtained
- [ ] Environment variables added to AWS Amplify
- [ ] Code pushed to GitHub
- [ ] AWS Amplify deployment successful
- [ ] Live payment tested
- [ ] Wallet balance updates confirmed

---

## 📞 **Support**

If you need help:
1. **PhonePe Support**: Contact PhonePe business support
2. **AWS Support**: Check AWS Amplify documentation
3. **Code Issues**: Check GitHub repository logs

**Your PhonePe integration is now ready for production! 🚀**

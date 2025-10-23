# Razorpay Environment Variables Debug Guide

## 🎯 **Current Issue**
Your Razorpay credentials are set in AWS Amplify, but the backend is still saying "Razorpay credentials not configured."

## 🔍 **Debugging Steps**

### **Step 1: Test Environment Variables (Wait 2-3 minutes for deployment)**
1. **Visit**: `https://main.dc7yjcdl4ndq.amplifyapp.com/api/test-razorpay-env`
2. **Check the response** - it should show:
   ```json
   {
     "RAZORPAY_KEY_ID": "SET",
     "RAZORPAY_KEY_SECRET": "SET",
     "RAZORPAY_MODE": "live"
   }
   ```

### **Step 2: Check AWS Amplify Environment Variables**
1. **Go to AWS Amplify Console**
2. **Select your app**: `main.dc7yjcdl4ndq.amplifyapp.com`
3. **Go to**: Environment variables
4. **Verify these exact variables exist**:
   ```
   RAZORPAY_KEY_ID=your_actual_key_id
   RAZORPAY_KEY_SECRET=your_actual_key_secret
   RAZORPAY_MODE=live
   ```

### **Step 3: Common Issues & Solutions**

#### **Issue A: Variable Names**
- ❌ **Wrong**: `RAZORPAY_KEYID` (no underscore)
- ❌ **Wrong**: `RAZORPAY_KEYSECRET` (no underscore)
- ✅ **Correct**: `RAZORPAY_KEY_ID` (with underscore)
- ✅ **Correct**: `RAZORPAY_KEY_SECRET` (with underscore)

#### **Issue B: Case Sensitivity**
- ❌ **Wrong**: `razorpay_key_id` (lowercase)
- ❌ **Wrong**: `Razorpay_Key_Id` (mixed case)
- ✅ **Correct**: `RAZORPAY_KEY_ID` (uppercase)

#### **Issue C: Extra Spaces**
- ❌ **Wrong**: `RAZORPAY_KEY_ID = value` (spaces around =)
- ✅ **Correct**: `RAZORPAY_KEY_ID=value` (no spaces)

#### **Issue D: Branch Settings**
- Make sure variables are set for **"All branches"** or your specific branch

### **Step 4: Redeploy After Changes**
If you make any changes to environment variables:
1. **Save the changes** in AWS Amplify Console
2. **Wait for automatic redeploy** (2-3 minutes)
3. **Test again** with the debug endpoint

## 🛠️ **Alternative Solutions**

### **Solution 1: Double-Check Your Credentials**
Make sure you're using the **correct Razorpay credentials**:
1. **Go to**: `https://dashboard.razorpay.com/`
2. **Navigate to**: Settings → API Keys
3. **Copy the exact values** (don't add extra spaces or characters)

### **Solution 2: Try Different Variable Names**
If the standard names don't work, try these alternatives:
```
RAZORPAY_KEYID=your_key_id
RAZORPAY_KEYSECRET=your_key_secret
```

### **Solution 3: Check AWS Amplify Logs**
1. **Go to AWS Amplify Console**
2. **Click on your app**
3. **Go to**: Build history
4. **Click on the latest build**
5. **Check the logs** for any environment variable errors

## 🎯 **Expected Results After Fix**

### **Debug Endpoint Response:**
```json
{
  "success": true,
  "environment": {
    "RAZORPAY_KEY_ID": "SET",
    "RAZORPAY_KEY_SECRET": "SET", 
    "RAZORPAY_MODE": "live",
    "NODE_ENV": "production"
  }
}
```

### **Live Site Behavior:**
1. **Deposit form**: Shows "Gateway: Razorpay" ✅
2. **Button**: Shows "Proceed to Razorpay" ✅
3. **Click deposit**: Opens Razorpay checkout popup ✅
4. **No error messages** ✅

## 🚨 **If Still Not Working**

### **Check These:**
1. **Are you using LIVE credentials?** (not test credentials)
2. **Are the credentials active?** (not expired or disabled)
3. **Is the Razorpay account active?** (not suspended)
4. **Are there any typos in the credentials?**

### **Final Test:**
1. **Visit**: `https://main.dc7yjcdl4ndq.amplifyapp.com/debug/razorpay`
2. **Click**: "Environment Variables Check"
3. **Should show**: `keyId: "[SET]"` and `keySecret: "[SET]"`

## 📞 **Need Help?**
If the debug endpoint still shows "MISSING" for the credentials, please share:
1. **The exact response** from `/api/test-razorpay-env`
2. **Screenshot** of your AWS Amplify environment variables
3. **Your Razorpay Key ID** (first 10 characters only for security)

This will help identify the exact issue! 🔍

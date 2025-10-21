# Auth0 Integration Guide

## ✅ Integration Complete!

Your application has been successfully integrated with Auth0 authentication, replacing Google OAuth.

## 🔧 What Was Done

### 1. **Installed Auth0 SDK**
- Added `@auth0/nextjs-auth0` package

### 2. **Created Auth0 Configuration**
- **File**: `src/lib/auth0.ts`
- Configured with your Auth0 credentials:
  - Domain: `microwin.us.auth0.com`
  - Client ID: `LQDSAe1cj6fOCg2XUFMCc7NQAy4cPeNJ`

### 3. **Created Auth0 API Routes**
- **File**: `src/app/api/auth/[auth0]/route.ts` - Handles Auth0 login/logout/callback
- **File**: `src/app/api/auth/callback/route.ts` - Custom callback handler that syncs Auth0 users with your database

### 4. **Updated Auth Page**
- **File**: `src/app/auth/page.tsx`
- Replaced Google OAuth button with Auth0 login
- Simplified authentication flow

### 5. **Updated Environment Variables**
- Added Auth0 credentials to `.env.local`, `.env.production`, and `.env.example`
- Deprecated Google OAuth credentials

### 6. **Removed Google OAuth Files**
- Deleted `src/lib/google-auth.ts`
- Deleted `src/app/api/auth/google/` directory

---

## 🚀 How to Use

### **For Local Development**

1. Your `.env.local` is already configured with Auth0 credentials

2. Start the development server:
```bash
npm run dev
```

3. Visit `http://localhost:3000/auth` and click "Sign in with Auth0"

4. You'll be redirected to Auth0 login page where users can:
   - Sign in with email/password
   - Sign in with Google (if configured in Auth0)
   - Sign in with other social providers (if configured in Auth0)

---

## 🌐 For AWS Amplify Deployment

### **IMPORTANT: Add Environment Variables to AWS Amplify Console**

You need to add these environment variables in AWS Amplify Console:

1. Go to your [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Select your app
3. Go to **App settings** > **Environment variables**
4. Add the following:

| Variable | Value |
|----------|-------|
| `AUTH0_SECRET` | `use-a-long-random-string-in-production-minimum-32-characters` |
| `AUTH0_BASE_URL` | `https://main.dc7yjcdl4ndq.amplifyapp.com` |
| `AUTH0_ISSUER_BASE_URL` | `https://microwin.us.auth0.com` |
| `AUTH0_CLIENT_ID` | `LQDSAe1cj6fOCg2XUFMCc7NQAy4cPeNJ` |
| `AUTH0_CLIENT_SECRET` | `a-4d1m1G9so8LmNRqU4AuBJAK09Gw5j1gyBCoEpwbV9qoyd7NcNvU6mmWs1Wt-L9` |
| `AUTH0_DOMAIN` | `microwin.us.auth0.com` |
| `DATABASE_URL` | Your Neon database URL |
| `JWT_SECRET` | Your JWT secret |

**⚠️ IMPORTANT**: Generate a secure random string for `AUTH0_SECRET` (at least 32 characters)

---

## 🔐 Auth0 Configuration (Already Done)

Your Auth0 application is already configured with:

✅ **Allowed Callback URLs**:
- `https://main.dc7yjcdl4ndq.amplifyapp.com/api/auth/callback`
- `http://localhost:3000/api/auth/callback`

✅ **Allowed Logout URLs**:
- `https://main.dc7yjcdl4ndq.amplifyapp.com`
- `http://localhost:3000`

✅ **Allowed Web Origins**:
- `https://main.dc7yjcdl4ndq.amplifyapp.com`
- `http://localhost:3000`

---

## 🔄 Authentication Flow

1. User clicks "Sign in with Auth0" on `/auth` page
2. User is redirected to `https://microwin.us.auth0.com` (Auth0 Universal Login)
3. User signs in with their preferred method (email/password, Google, etc.)
4. Auth0 redirects back to `/api/auth/callback`
5. Callback handler:
   - Verifies Auth0 session
   - Checks if user exists in database
   - Creates new user if not exists
   - Creates user profile
6. User is redirected to dashboard

---

## 🔗 Available Auth Routes

| Route | Description |
|-------|-------------|
| `/api/auth/login` | Initiates Auth0 login |
| `/api/auth/logout` | Logs out user |
| `/api/auth/callback` | Handles Auth0 callback |
| `/api/auth/me` | Get current user (existing endpoint) |

---

## 🎨 Auth0 Customization Options

In your [Auth0 Dashboard](https://manage.auth0.com/):

### **Add Social Connections**
- Go to **Authentication** > **Social**
- Enable Google, Facebook, GitHub, etc.
- Users can sign in with these providers

### **Customize Login Page**
- Go to **Branding** > **Universal Login**
- Customize colors, logo, and styling
- Add your brand identity

### **Enable Multi-Factor Authentication (MFA)**
- Go to **Security** > **Multi-factor Auth**
- Enable SMS, Authenticator App, etc.

---

## 🧪 Testing

### **Test Locally**
1. Run `npm run dev`
2. Go to `http://localhost:3000/auth`
3. Click "Sign in with Auth0"
4. Sign in with a test account
5. Verify you're redirected to dashboard

### **Test on Production**
1. After deploying to AWS Amplify
2. Go to `https://main.dc7yjcdl4ndq.amplifyapp.com/auth`
3. Test the authentication flow
4. Check database to verify user was created

---

## 📝 Next Steps

1. **Add Auth0 environment variables to AWS Amplify Console** (see above)
2. **Deploy to AWS Amplify**
3. **Test authentication on production**
4. **Customize Auth0 branding** (optional)
5. **Enable social providers** (optional)
6. **Enable MFA** (optional)

---

## 🐛 Troubleshooting

### **"Authentication failed" error**
- Check that all environment variables are set correctly
- Verify Auth0 credentials are correct
- Check Auth0 dashboard for error logs

### **Redirect URI mismatch**
- Ensure callback URLs in Auth0 match your deployment URL
- Check that `AUTH0_BASE_URL` is correct

### **Database connection error**
- Verify `DATABASE_URL` is set correctly
- Check that database is accessible

### **Session not persisting**
- Ensure `AUTH0_SECRET` is set and is at least 32 characters
- Check browser cookies are enabled

---

## 📚 Resources

- [Auth0 Next.js SDK Documentation](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 Dashboard](https://manage.auth0.com/)
- [Auth0 Community](https://community.auth0.com/)

---

## ✨ Benefits of Auth0

✅ **Enterprise-grade security**
✅ **Multiple authentication methods** (email/password, social, passwordless)
✅ **Built-in MFA support**
✅ **Customizable login experience**
✅ **Comprehensive user management**
✅ **Detailed analytics and logs**
✅ **Scalable infrastructure**

---

**Your application is now ready to use Auth0 for authentication! 🎉**

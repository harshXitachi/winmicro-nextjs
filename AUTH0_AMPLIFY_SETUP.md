# Auth0 Setup for AWS Amplify

## The Problem
The error `Cannot set properties of null (setting 'valueAsNumber')` occurs because Auth0 can't find a valid callback URL configuration.

## Solution

### 1. Update AWS Amplify Environment Variables

Go to your AWS Amplify console and add/update these environment variables:

```
APP_BASE_URL=https://main.dc7yjcdl4ndq.amplifyapp.com
AUTH0_DOMAIN=microwin.us.auth0.com
AUTH0_CLIENT_ID=LQDSAe1cj6fOCg2XUFMCc7NQAy4cPeNJ
AUTH0_CLIENT_SECRET=<your_secret>
AUTH0_SECRET=<generate_a_random_32_char_string>
JWT_SECRET=<your_jwt_secret>
```

### 2. Update Auth0 Dashboard Settings

Go to https://manage.auth0.com → Applications → Your App → Settings

Update these fields:

**Allowed Callback URLs:**
```
https://main.dc7yjcdl4ndq.amplifyapp.com/api/auth/callback
http://localhost:3000/api/auth/callback
```

**Allowed Logout URLs:**
```
https://main.dc7yjcdl4ndq.amplifyapp.com
http://localhost:3000
```

**Allowed Web Origins:**
```
https://main.dc7yjcdl4ndq.amplifyapp.com
http://localhost:3000
```

**Allowed Origins (CORS):**
```
https://main.dc7yjcdl4ndq.amplifyapp.com
http://localhost:3000
```

### 3. Redeploy

After updating:
1. Save changes in Auth0
2. Update environment variables in Amplify
3. Trigger a new deployment (or it will auto-deploy)

## Testing

1. Visit https://main.dc7yjcdl4ndq.amplifyapp.com/auth
2. Click "Sign in with Auth0"
3. You should be redirected to Auth0 login
4. After authentication, you'll be redirected back to /dashboard

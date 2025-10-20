# Google OAuth Setup Guide

## Overview
The application now uses Google OAuth for authentication. Here's how to set it up:

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing one)
3. Enable the following APIs:
   - Google+ API
   - Google Identity Services API

## Step 2: Create OAuth 2.0 Credentials

1. In Google Cloud Console, go to "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Add Authorized Redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/api/auth/google/callback`
   - Your production domain (e.g., `https://yourdomain.com`)

5. Copy your:
   - **Client ID** (NEXT_PUBLIC_GOOGLE_CLIENT_ID)
   - **Client Secret** (GOOGLE_CLIENT_SECRET)

## Step 3: Environment Variables

Add the following to your `.env.local` file:

```env
# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

For production, update with:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_production_client_id
GOOGLE_CLIENT_SECRET=your_production_client_secret
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/auth/google/callback
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Authentication Flow

### For Existing Users (with Google account)
1. User clicks "Sign in with Google"
2. Google verification happens
3. System checks if email exists in database
4. User is redirected to **Dashboard**

### For New Users
1. User clicks "Sign in with Google"
2. Google verification happens
3. System checks if email exists (it doesn't)
4. New user account is created
5. User is redirected to **Profile Setup** page
6. User fills in:
   - First Name
   - Last Name
   - **Username** (with real-time availability check)
   - Bio (optional)
   - Location (optional)
   - Phone (optional)
   - Skills (optional, max 10)
7. After profile completion, user is redirected to **Dashboard**

## API Endpoints

### Authentication

**POST /api/auth/google/callback**
- Handles Google OAuth token verification
- Creates new user account if needed
- Returns auth token and user status
- Body: `{ idToken: string }`

**POST /api/auth/me**
- Get current authenticated user
- Requires auth cookie

**POST /api/auth/signout**
- Sign out current user

### Profile

**POST /api/profile/check-username**
- Check if username is available
- Body: `{ username: string }`
- Returns: `{ available: boolean, message: string }`

**POST /api/profile/complete**
- Complete user profile after signup
- Requires authentication
- Body: Profile data with username

## Files Modified/Created

### New Files:
- `src/lib/google-auth.ts` - Google OAuth configuration
- `src/app/api/auth/google/callback/route.ts` - OAuth callback handler
- `src/app/api/profile/check-username/route.ts` - Username availability check
- `src/app/api/profile/complete/route.ts` - Profile completion handler
- `src/app/profile-setup/page.tsx` - Profile setup page
- `package.json` - Updated with google-auth-library dependency

### Modified Files:
- `src/app/auth/page.tsx` - Replaced with Google OAuth only
- Database schema supports OAuth users (empty password field)

## Testing Locally

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables in `.env.local`

3. Run development server:
```bash
npm run dev
```

4. Visit http://localhost:3000/auth and test the flow

## Features

✅ Google OAuth 2.0 integration
✅ Automatic user creation for new users
✅ Profile setup flow for new users
✅ Real-time username availability check
✅ Secure authentication with JWT tokens
✅ Optional profile fields (bio, location, phone, skills)
✅ Multi-skill support (max 10 skills per user)

## Troubleshooting

### "Failed to load Google Sign-In"
- Check if Google Client ID is set correctly in `.env.local`
- Verify NEXT_PUBLIC_ prefix for client-side environment variables
- Check browser console for CORS errors

### "Invalid Google token"
- Ensure token is passed correctly to callback
- Check if credentials in Google Cloud Console are updated

### Username not being checked
- Verify `/api/profile/check-username` endpoint exists
- Check network tab in browser DevTools for API errors

## Production Deployment

1. Update all environment variables with production values
2. Add production domain to Google OAuth authorized URLs
3. Update `NEXT_PUBLIC_APP_URL` to production domain
4. Ensure database migrations are applied
5. Test the complete flow on staging before production

# Firebase Authentication Migration Guide

## ✅ Completed Steps

1. **Removed Auth0 dependencies** and installed Firebase SDK
2. **Created Firebase configuration** (`src/lib/firebase.ts`)
3. **Created Firebase Auth Context** (`src/context/FirebaseAuthContext.tsx`)
4. **Updated authentication pages**:
   - `/auth` - Sign in page with Google and Email/Password
   - `/signup` - New signup page
5. **Created API routes** for user sync with PostgreSQL
6. **Updated app layout** to use FirebaseAuthProvider
7. **Removed Auth0 files**:
   - `src/lib/auth0.ts`
   - `src/app/api/auth/login/`
   - `src/app/api/auth/logout/`
   - `src/app/api/auth/callback/`
8. **Updated environment variables** in `.env.local`

## 🔧 Setup Instructions

### Step 1: Get Firebase Admin SDK Credentials

To use Firebase Authentication on the server-side, you need to get your Firebase Admin SDK private key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`mriwojsfh`)
3. Click the gear icon ⚙️ next to "Project Overview"
4. Go to **Project settings** → **Service accounts** tab
5. Click **"Generate new private key"** button
6. Download the JSON file

### Step 2: Update .env.local with Firebase Admin Credentials

Open the downloaded JSON file and extract these values:

```json
{
  "project_id": "mriwojsfh",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@mriwojsfh.iam.gserviceaccount.com"
}
```

Update your `.env.local` file with the actual values:

```bash
FIREBASE_ADMIN_PROJECT_ID=mriwojsfh
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@mriwojsfh.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

**Important**: Keep the quotes around `FIREBASE_ADMIN_PRIVATE_KEY` and preserve the `\n` characters.

### Step 3: Configure Firebase Authorized Domains

For production deployment on AWS Amplify:

1. Go to Firebase Console → **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add your Amplify domain (e.g., `your-app.amplifyapp.com`)

### Step 4: Update AWS Amplify Environment Variables

In AWS Amplify Console, remove these Auth0 variables and add Firebase ones:

**Remove:**
- `AUTH0_SECRET`
- `AUTH0_BASE_URL`
- `APP_BASE_URL`
- `AUTH0_DOMAIN`
- `AUTH0_ISSUER_BASE_URL`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`

**Add:**
- `NEXT_PUBLIC_FIREBASE_API_KEY` = `AIzaSyBUQthyqxgcrH0UTNKbsIIFYoWHEh8xeA8`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` = `mriwojsfh.firebaseapp.com`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` = `mriwojsfh`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` = `mriwojsfh.firebasestorage.app`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` = `956697482313`
- `NEXT_PUBLIC_FIREBASE_APP_ID` = `1:956697482313:web:05a40dfa875ed3a12c1b98`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` = `G-B7CCQ2TLXS`
- `FIREBASE_ADMIN_PROJECT_ID` = `mriwojsfh`
- `FIREBASE_ADMIN_CLIENT_EMAIL` = (from your downloaded JSON)
- `FIREBASE_ADMIN_PRIVATE_KEY` = (from your downloaded JSON)

### Step 5: Test Locally

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/auth` or `http://localhost:3000/signup`

3. Test both authentication methods:
   - **Google Sign-in**: Click "Continue with Google"
   - **Email/Password**: Create an account with email and password

4. Verify that:
   - Users are created in Firebase Authentication
   - User data is synced to your PostgreSQL database
   - You can navigate to `/dashboard` after login

### Step 6: Deploy to AWS Amplify

1. Commit and push your changes:
   ```bash
   git add .
   git commit -m "Migrate from Auth0 to Firebase Authentication"
   git push origin main
   ```

2. AWS Amplify will automatically detect changes and start building

3. Monitor the build logs for any errors

## 📝 What Changed

### Database Schema
No changes required! Firebase users are stored in your existing PostgreSQL `users` and `profiles` tables:
- `users.id` = Firebase UID
- `users.email` = Firebase email
- `users.password` = Empty (managed by Firebase)
- Profile data continues to work the same way

### Authentication Flow
1. User signs in with Firebase (Google or Email/Password)
2. Firebase returns authenticated user with UID
3. Client calls `/api/auth/sync-user` with Firebase ID token
4. Server verifies token with Firebase Admin SDK
5. Server creates/updates user in PostgreSQL
6. User data is fetched and stored in context

### Components Using Authentication
All components using `useAuth()` hook will continue to work, but now it uses `useFirebaseAuth()` internally.

## 🚨 Important Notes

1. **Firebase Admin Private Key**: Never commit this to version control! Always use environment variables.

2. **Google Sign-in**: Make sure your authorized domains are configured in Firebase Console.

3. **Existing Users**: Users who previously logged in with Auth0 will need to create new accounts with Firebase. You can migrate existing emails if needed.

4. **Password Reset**: Firebase handles password reset emails automatically. Configure email templates in Firebase Console → Authentication → Templates.

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/unauthorized-domain)"
**Solution**: Add your domain to Firebase Console → Authentication → Settings → Authorized domains

### Issue: "Token verification failed"
**Solution**: Make sure `FIREBASE_ADMIN_PRIVATE_KEY` is correctly formatted with `\n` characters preserved

### Issue: "User not syncing to database"
**Solution**: Check `/api/auth/sync-user` logs and verify database connection string

## 📚 Next Steps

1. Test all authentication flows thoroughly
2. Update any remaining Auth0 references in your codebase
3. Configure Firebase email templates for password reset
4. Set up Firebase security rules if using Firestore (optional)
5. Monitor Firebase Authentication usage in Firebase Console

## 🎉 Benefits of Firebase Auth

- ✅ **Simpler setup**: No callback URLs or complex configuration
- ✅ **Better integration**: Works seamlessly with client-side apps
- ✅ **Free tier**: 50,000 MAU on free plan vs Auth0's 7,000
- ✅ **Built-in features**: Email verification, password reset, etc.
- ✅ **Multiple providers**: Easy to add more auth providers later

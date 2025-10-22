# Temporary Auth Fix

The issue is that ALL API routes are still checking for old JWT auth tokens, but we're using Firebase now.

## Quick Fix Options:

### Option 1: Temporarily Disable Auth Checks (FASTEST)
Update `src/lib/auth.ts` getCurrentUser to return a mock user based on query params until all routes are migrated.

### Option 2: Update All API Routes (PROPER)
Update every API route to accept Firebase tokens - but this requires updating 25+ files.

### Option 3: Create Auth Middleware (RECOMMENDED)
Create a Next.js middleware that converts Firebase tokens to session cookies that getCurrentUser can read.

## Implementing Option 3 (Best Solution):

The middleware will:
1. Intercept all API requests
2. Check for Firebase token in Authorization header  
3. Verify it with Firebase Admin
4. Set a session cookie with user info
5. getCurrentUser reads from cookie

This way NO API routes need to change!

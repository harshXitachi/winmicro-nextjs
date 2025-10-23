import { User as FirebaseUser } from 'firebase/auth';
import { ErrorHandler, RateLimiter } from './error-handler';

// Token cache to reduce Firebase quota usage
const tokenCache = new Map<string, { token: string; expires: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function makeAuthenticatedRequest(
  firebaseUser: FirebaseUser | null,
  url: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<Response> {
  if (!firebaseUser) {
    console.error('❌ makeAuthenticatedRequest: No Firebase user');
    throw new Error('User not authenticated');
  }

  // Check rate limiting
  const operation = `api-${url}`;
  if (!RateLimiter.canMakeCall(operation)) {
    throw new Error('Rate limit exceeded. Please wait before trying again.');
  }

  console.log('🔑 Getting Firebase ID token for user:', firebaseUser.uid);
  
  let idToken: string;
  
  try {
    // Check cache first to reduce Firebase quota usage
    const cached = tokenCache.get(firebaseUser.uid);
    const now = Date.now();
    
    if (cached && cached.expires > now) {
      console.log('📋 Using cached token');
      idToken = cached.token;
    } else {
      console.log('🔄 Fetching fresh token');
      // Only force refresh if we don't have a cached token or it's expired
      idToken = await firebaseUser.getIdToken(false);
      
      // Cache the token
      tokenCache.set(firebaseUser.uid, {
        token: idToken,
        expires: now + CACHE_DURATION
      });
    }
    
    console.log('✅ Got Firebase token, length:', idToken.length);
    console.log('🔍 Token preview:', idToken.substring(0, 20) + '...');
  } catch (error: any) {
    console.error('❌ Failed to get Firebase token:', error.message);
    
    // Handle quota exceeded error with better fallback
    if (error.code === 'auth/quota-exceeded') {
      console.error('🚨 Firebase quota exceeded - using cached token if available');
      const cached = tokenCache.get(firebaseUser.uid);
      if (cached) {
        idToken = cached.token;
        console.log('📋 Using cached token due to quota exceeded');
      } else {
        // If no cached token and quota exceeded, wait and try again
        if (retryCount < 2) {
          console.log('⏳ Waiting before retry due to quota exceeded...');
          await ErrorHandler.delay(2000);
          return makeAuthenticatedRequest(firebaseUser, url, options, retryCount + 1);
        }
        throw new Error('Firebase quota exceeded and no cached token available');
      }
    } else {
      // Handle other Firebase errors
      const shouldRetry = await ErrorHandler.handleFirebaseError(error, 'token-fetch');
      if (shouldRetry && retryCount < 2) {
        await ErrorHandler.delay(1000);
        return makeAuthenticatedRequest(firebaseUser, url, options, retryCount + 1);
      }
      throw error;
    }
  }

  // Merge headers - ensure they override any existing headers
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('x-firebase-token', idToken);
  headers.set('Authorization', `Bearer ${idToken}`);

  console.log('📤 Sending request to:', url);
  console.log('📋 Headers being sent:', {
    'Content-Type': headers.get('Content-Type'),
    'x-firebase-token': headers.get('x-firebase-token') ? '[PRESENT]' : '[MISSING]',
    'Authorization': headers.get('Authorization') ? '[PRESENT]' : '[MISSING]',
  });

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important for sending cookies
    mode: 'cors',
    cache: 'no-cache',
  });
  
  console.log('📥 Response status:', response.status);
  
  // Handle errors with improved logic
  if (!response.ok) {
    const shouldRetry = await ErrorHandler.handleApiError(response, url);
    
    if (shouldRetry && retryCount < 2) {
      console.log(`🔄 Retrying request (attempt ${retryCount + 1}/2)`);
      
      // Clear cached token and force refresh
      tokenCache.delete(firebaseUser.uid);
      
      // Wait before retry
      await ErrorHandler.delay(1000);
      
      return makeAuthenticatedRequest(firebaseUser, url, options, retryCount + 1);
    }
    
    // Log error details for debugging
    const errorText = await response.clone().text();
    console.error('❌ API Error response:', errorText);
  }
  
  return response;
}

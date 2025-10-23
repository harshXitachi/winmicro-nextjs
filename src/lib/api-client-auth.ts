import { User as FirebaseUser } from 'firebase/auth';

export async function makeAuthenticatedRequest(
  firebaseUser: FirebaseUser | null,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!firebaseUser) {
    console.error('❌ makeAuthenticatedRequest: No Firebase user');
    throw new Error('User not authenticated');
  }

  console.log('🔑 Getting Firebase ID token for user:', firebaseUser.uid);
  
  // Get fresh Firebase ID token
  const idToken = await firebaseUser.getIdToken();
  console.log('✅ Got Firebase token, length:', idToken.length);

  // Merge headers
  // Note: Using 'x-firebase-token' instead of 'Authorization' 
  // because AWS Amplify sometimes strips the Authorization header
  const headers = {
    'Content-Type': 'application/json',
    'x-firebase-token': idToken,
    'Authorization': `Bearer ${idToken}`, // Keep both for compatibility
    ...options.headers,
  };

  console.log('📤 Sending request to:', url);
  console.log('📋 Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });

  return fetch(url, {
    ...options,
    headers,
  });
}

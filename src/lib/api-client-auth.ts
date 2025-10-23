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
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    ...options.headers,
  };

  console.log('📤 Sending request to:', url);
  console.log('📋 Headers:', { ...headers, Authorization: 'Bearer [REDACTED]' });

  return fetch(url, {
    ...options,
    headers,
  });
}

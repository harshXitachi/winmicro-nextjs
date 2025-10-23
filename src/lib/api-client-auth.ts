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
  const idToken = await firebaseUser.getIdToken(true); // Force refresh
  console.log('✅ Got Firebase token, length:', idToken.length);
  console.log('🔍 Token preview:', idToken.substring(0, 20) + '...');

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
  
  // If still getting 401, log the response for debugging
  if (response.status === 401) {
    const errorText = await response.clone().text();
    console.error('❌ 401 Error response:', errorText);
  }
  
  return response;
}

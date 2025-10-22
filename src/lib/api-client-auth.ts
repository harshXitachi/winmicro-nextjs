import { User as FirebaseUser } from 'firebase/auth';

export async function makeAuthenticatedRequest(
  firebaseUser: FirebaseUser | null,
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  if (!firebaseUser) {
    throw new Error('User not authenticated');
  }

  // Get fresh Firebase ID token
  const idToken = await firebaseUser.getIdToken();

  // Merge headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
}

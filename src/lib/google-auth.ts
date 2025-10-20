import { jwtDecode } from 'jwt-decode';

export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash?: string;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  locale?: string;
  iat: number;
  exp: number;
}

export async function verifyGoogleToken(token: string): Promise<GoogleTokenPayload | null> {
  try {
    const decoded = jwtDecode<GoogleTokenPayload>(token);
    
    // Check if token is expired
    if (decoded.exp * 1000 < Date.now()) {
      console.error('Google token expired');
      return null;
    }

    // Verify audience
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (decoded.aud !== clientId) {
      console.error('Invalid audience in Google token');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error verifying Google token:', error);
    return null;
  }
}

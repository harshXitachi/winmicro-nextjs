// Auth0 configuration is handled via environment variables
// The SDK automatically reads these:
// - AUTH0_SECRET
// - AUTH0_BASE_URL
// - AUTH0_ISSUER_BASE_URL
// - AUTH0_CLIENT_ID
// - AUTH0_CLIENT_SECRET

export const auth0Config = {
  secret: process.env.AUTH0_SECRET || 'use-a-long-random-string-in-production',
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL || `https://${process.env.AUTH0_DOMAIN}`,
  baseURL: process.env.AUTH0_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  clientID: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
};

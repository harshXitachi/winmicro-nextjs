/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  images: {
    domains: ['fdjjhpbwbznfoshycydt.supabase.co', 'readdy.ai'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Disable static optimization for API routes to prevent build-time database calls
  experimental: {
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        'main.dc7yjcdl4ndq.amplifyapp.com',
      ],
    },
  },
}

module.exports = nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['fdjjhpbwbznfoshycydt.supabase.co', 'readdy.ai'],
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    // PhonePe environment variables
    PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
    PHONEPE_SECRET_KEY: process.env.PHONEPE_SECRET_KEY,
    PHONEPE_KEY_INDEX: process.env.PHONEPE_KEY_INDEX,
    PHONEPE_BASE_URL: process.env.PHONEPE_BASE_URL,
    // Razorpay environment variables (keeping for backward compatibility)
    RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,
    RAZORPAY_MODE: process.env.RAZORPAY_MODE,
    RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET,
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

// Temporary fallback for Razorpay credentials
// This file should be removed once environment variables are working

export const RAZORPAY_FALLBACK_CONFIG = {
  keyId: 'RKJJRRN5QBmU9V',
  keySecret: 'rzp_live_RMEyuyGizJQ9DK',
  mode: 'live'
};

// Use this if environment variables are not loading
export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID || RAZORPAY_FALLBACK_CONFIG.keyId,
    keySecret: process.env.RAZORPAY_KEY_SECRET || RAZORPAY_FALLBACK_CONFIG.keySecret,
    mode: process.env.RAZORPAY_MODE || RAZORPAY_FALLBACK_CONFIG.mode,
  };
}

// Razorpay Gateway Configuration - Enhanced with comprehensive fallbacks
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEYID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEYSECRET || process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET || '';
const RAZORPAY_MODE = process.env.RAZORPAY_MODE === 'test' ? 'test' : 'live';
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || '';

// Comprehensive environment variable validation
const validateRazorpayConfig = () => {
  const config = {
    hasKeyId: !!RAZORPAY_KEY_ID,
    hasKeySecret: !!RAZORPAY_KEY_SECRET,
    mode: RAZORPAY_MODE,
    nodeEnv: process.env.NODE_ENV,
    keyIdPreview: RAZORPAY_KEY_ID ? RAZORPAY_KEY_ID.substring(0, 10) + '...' : 'NOT SET',
    keySecretPreview: RAZORPAY_KEY_SECRET ? RAZORPAY_KEY_SECRET.substring(0, 10) + '...' : 'NOT SET',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('RAZORPAY')),
    timestamp: new Date().toISOString(),
    // Additional environment sources
    fromNextConfig: {
      RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID ? 'SET' : 'MISSING',
      RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'MISSING',
    },
    // Check for common alternative names
    alternativeNames: {
      RAZORPAY_KEYID: process.env.RAZORPAY_KEYID ? 'SET' : 'MISSING',
      RAZORPAY_KEYSECRET: process.env.RAZORPAY_KEYSECRET ? 'SET' : 'MISSING',
    }
  };

  console.log('🔍 Razorpay Environment Check:', config);
  return config;
};

// Run validation
const envCheck = validateRazorpayConfig();

// Enhanced error handling for missing credentials
if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials missing!');
  console.error('Please ensure these environment variables are set in AWS Amplify Console:');
  console.error('1. RAZORPAY_KEY_ID=your_razorpay_key_id');
  console.error('2. RAZORPAY_KEY_SECRET=your_razorpay_key_secret');
  console.error('3. RAZORPAY_MODE=live (or test for testing)');
  console.error('\nCurrent environment status:', envCheck);
  
  // In production, this will cause the app to fail gracefully
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ PRODUCTION: Razorpay credentials are required!');
  }
}

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
  receipt: string;
  created_at: number;
}

interface RazorpayPaymentResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  status: string;
  order_id: string;
  method: string;
  description: string;
  email: string;
  contact: string;
  created_at: number;
}

interface RazorpayRefundResponse {
  id: string;
  entity: string;
  amount: number;
  currency: string;
  payment_id: string;
  status: string;
  created_at: number;
}

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(
  userId: string,
  amount: number, // in paise (INR * 100)
  description: string,
  receipt: string
): Promise<{ orderId: string; keyId: string; amount: number; currency: string }> {
  try {
    console.log(`💰 Creating Razorpay order for ₹${amount / 100} (user: ${userId})`);
    
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('❌ Razorpay credentials missing!');
      console.error('Please add these environment variables to AWS Amplify Console:');
      console.error('1. RAZORPAY_KEY_ID=your_key_id');
      console.error('2. RAZORPAY_KEY_SECRET=your_key_secret');
      console.error('3. RAZORPAY_MODE=live (or test for testing)');
      console.error('\nCurrent environment:', {
        nodeEnv: process.env.NODE_ENV,
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET,
        allRazorpayEnvVars: Object.keys(process.env).filter(key => key.includes('RAZORPAY')),
        timestamp: new Date().toISOString()
      });
      
      // Provide more specific error message based on environment
      const errorMessage = process.env.NODE_ENV === 'production' 
        ? 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables in AWS Amplify Console, then redeploy your application.'
        : 'Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables in your .env.local file or AWS Amplify Console.';
      
      throw new Error(errorMessage);
    }

    const orderData = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: receipt,
      notes: {
        user_id: userId,
        description: description,
      },
    };

    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const data: RazorpayOrderResponse = await response.json();

    if (!response.ok) {
      console.error('❌ Razorpay order creation failed:', data);
      throw new Error('Failed to create Razorpay order');
    }

    console.log('✅ Razorpay order created:', data.id);

    return {
      orderId: data.id,
      keyId: RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw error;
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  try {
    const crypto = require('crypto');
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error('Razorpay signature verification error:', error);
    return false;
  }
}

/**
 * Get Razorpay payment details
 */
export async function getRazorpayPaymentDetails(paymentId: string): Promise<RazorpayPaymentResponse> {
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const data: RazorpayPaymentResponse = await response.json();

    if (!response.ok) {
      throw new Error('Failed to get Razorpay payment details');
    }

    return data;
  } catch (error) {
    console.error('Razorpay get payment error:', error);
    throw error;
  }
}

/**
 * Refund Razorpay payment
 */
export async function refundRazorpayPayment(
  paymentId: string,
  amount?: number
): Promise<{ refundId: string; status: string }> {
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const refundData: any = {
      amount: amount, // Amount in paise, if not provided, full refund
    };

    const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(refundData),
    });

    const data: RazorpayRefundResponse = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refund Razorpay payment');
    }

    return {
      refundId: data.id,
      status: data.status,
    };
  } catch (error) {
    console.error('Razorpay refund error:', error);
    throw error;
  }
}

/**
 * Get Razorpay order details
 */
export async function getRazorpayOrderDetails(orderId: string): Promise<RazorpayOrderResponse> {
  try {
    const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    const response = await fetch(`https://api.razorpay.com/v1/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    const data: RazorpayOrderResponse = await response.json();

    if (!response.ok) {
      throw new Error('Failed to get Razorpay order details');
    }

    return data;
  } catch (error) {
    console.error('Razorpay get order error:', error);
    throw error;
  }
}

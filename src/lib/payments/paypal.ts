// PayPal Gateway Configuration (require env credentials; select API base by mode)
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || '';
const PAYPAL_MODE = process.env.PAYPAL_MODE === 'sandbox' ? 'sandbox' : 'live';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || (PAYPAL_MODE === 'sandbox' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com');

let cachedAccessToken: string | null = null;
let tokenExpiry: number = 0;

interface PayPalTokenResponse {
  access_token: string;
  app_id: string;
  expires_in: number;
  nonce?: string;
}

interface PayPalOrderResponse {
  id: string;
  status: string;
  links: Array<{
    rel: string;
    href: string;
  }>;
}

interface PayPalCaptureResponse {
  id: string;
  status: string;
  payer: {
    email_address: string;
    name: {
      given_name: string;
      surname: string;
    };
  };
  purchase_units: Array<{
    amount: {
      value: string;
      currency_code: string;
    };
    payments: {
      captures: Array<{
        id: string;
        status: string;
        amount: {
          value: string;
          currency_code: string;
        };
      }>;
    };
  }>;
}

/**
 * Get PayPal access token
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if valid
  if (cachedAccessToken && tokenExpiry > Date.now()) {
    console.log('✅ Using cached PayPal token');
    return cachedAccessToken;
  }

  try {
    // Enhanced environment variable checking
    console.log('🔍 PayPal Environment Check:', {
      hasClientId: !!PAYPAL_CLIENT_ID,
      hasSecret: !!PAYPAL_SECRET,
      mode: PAYPAL_MODE,
      apiBase: PAYPAL_API_BASE,
      nodeEnv: process.env.NODE_ENV
    });

    if (!PAYPAL_CLIENT_ID || !PAYPAL_SECRET) {
      console.error('❌ PayPal credentials missing!');
      console.error('Missing variables:', {
        PAYPAL_CLIENT_ID: !PAYPAL_CLIENT_ID,
        PAYPAL_SECRET: !PAYPAL_SECRET
      });
      throw new Error('PayPal credentials not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_SECRET environment variables in AWS Amplify Console.');
    }
    
    console.log(`🔐 Getting PayPal token from ${PAYPAL_API_BASE} (mode: ${PAYPAL_MODE})...`);
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');

    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data: PayPalTokenResponse = await response.json();

    if (!response.ok) {
      console.error('❌ PayPal token error:', data);
      throw new Error('Failed to get PayPal access token');
    }

    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Cache for expires_in - 1 minute
    console.log('✅ PayPal token obtained successfully');

    return data.access_token;
  } catch (error) {
    console.error('PayPal token error:', error);
    throw error;
  }
}

/**
 * Create PayPal order
 */
export async function createPayPalOrder(
  userId: string,
  amount: number, // in USD
  description: string
): Promise<{ orderId: string; approvalUrl: string }> {
  try {
    console.log(`💰 Creating PayPal order for $${amount} (user: ${userId})`);
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: userId,
            amount: {
              currency_code: 'USD',
              value: amount.toFixed(2),
            },
            description: description,
          },
        ],
        application_context: {
          brand_name: process.env.APP_NAME || 'WinMicro',
          locale: 'en-US',
          landing_page: 'LOGIN',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/wallet/payment-cancel`,
        },
      }),
    });

    const data: PayPalOrderResponse = await response.json();

    if (!response.ok || data.status !== 'CREATED') {
      console.error('❌ PayPal order creation failed:', data);
      throw new Error('Failed to create PayPal order');
    }
    console.log('✅ PayPal order created:', data.id);

    const approvalLink = data.links.find((link) => link.rel === 'approve');
    if (!approvalLink) {
      throw new Error('No approval link in PayPal response');
    }

    return {
      orderId: data.id,
      approvalUrl: approvalLink.href,
    };
  } catch (error) {
    console.error('PayPal order creation error:', error);
    throw error;
  }
}

/**
 * Capture PayPal payment
 */
export async function capturePayPalOrder(
  orderId: string
): Promise<{ transactionId: string; status: string; amount: number; payerEmail: string }> {
  try {
    console.log(`🔒 Capturing PayPal order: ${orderId}`);
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data: PayPalCaptureResponse = await response.json();

    if (!response.ok) {
      console.error('❌ PayPal capture failed:', data);
      throw new Error('Failed to capture PayPal payment');
    }
    console.log('✅ PayPal payment captured:', data.id);

    const capture = data.purchase_units[0]?.payments?.captures?.[0];
    if (!capture) {
      throw new Error('No capture details in PayPal response');
    }

    return {
      transactionId: capture.id,
      status: capture.status,
      amount: parseFloat(capture.amount.value),
      payerEmail: data.payer?.email_address || '',
    };
  } catch (error) {
    console.error('PayPal capture error:', error);
    throw error;
  }
}

/**
 * Refund PayPal payment
 */
export async function refundPayPalPayment(
  captureId: string,
  amount?: number
): Promise<{ refundId: string; status: string }> {
  try {
    const accessToken = await getAccessToken();

    const body: any = {};
    if (amount) {
      body.amount = {
        value: amount.toFixed(2),
        currency_code: 'USD',
      };
    }

    const response = await fetch(
      `${PAYPAL_API_BASE}/v2/payments/captures/${captureId}/refund`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data: any = await response.json();

    if (!response.ok) {
      throw new Error('Failed to refund PayPal payment');
    }

    return {
      refundId: data.id,
      status: data.status,
    };
  } catch (error) {
    console.error('PayPal refund error:', error);
    throw error;
  }
}

/**
 * Get PayPal order details
 */
export async function getPayPalOrderDetails(orderId: string): Promise<PayPalOrderResponse> {
  try {
    const accessToken = await getAccessToken();

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    const data: PayPalOrderResponse = await response.json();

    if (!response.ok) {
      throw new Error('Failed to get PayPal order details');
    }

    return data;
  } catch (error) {
    console.error('PayPal get order error:', error);
    throw error;
  }
}

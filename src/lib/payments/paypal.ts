// PayPal Gateway Configuration
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || 'AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE';
const PAYPAL_SECRET = process.env.PAYPAL_SECRET || 'EElmez_2nNLl8SohHumQZsTTIv3_Lk3OwVagVvjesSYVsqr_2uGebrPB5WeTbWD-Kf9cWR7FsFUdn-sm';
const PAYPAL_API_BASE = process.env.PAYPAL_API_BASE || 'https://api.paypal.com';
const IS_SANDBOX = process.env.PAYPAL_MODE === 'sandbox' || true;

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
    return cachedAccessToken;
  }

  try {
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
      throw new Error('Failed to get PayPal access token');
    }

    cachedAccessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Cache for expires_in - 1 minute

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
      throw new Error('Failed to create PayPal order');
    }

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
      throw new Error('Failed to capture PayPal payment');
    }

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

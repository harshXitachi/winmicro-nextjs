import crypto from 'crypto';

// PhonePay Gateway Configuration
const PHONEPE_BASE_URL = process.env.PHONEPE_BASE_URL || 'https://api-preprod.phonepe.com/apis/hermes';
const PHONEPE_MERCHANT_ID = process.env.PHONEPE_MERCHANT_ID || 'M22AFUJH1IZRR';
const PHONEPE_SECRET_KEY = process.env.PHONEPE_SECRET_KEY || 'c7199d0e-5854-41f5-9604-3ae51eb8b3d1';
const PHONEPE_KEY_INDEX = process.env.PHONEPE_KEY_INDEX ? parseInt(process.env.PHONEPE_KEY_INDEX) : 1;

interface PhonePePaymentPayload {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number; // in paise (1 rupee = 100 paise)
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber: string;
  paymentInstrument: {
    type: string;
  };
}

interface PhonePeResponse {
  success: boolean;
  code: string;
  message: string;
  data?: {
    instrumentResponse?: {
      redirectInfo?: {
        url: string;
      };
    };
  };
}

/**
 * Generate X-VERIFY header for PhonePay authentication
 * Format: SHA256(payload + SECRET_KEY)###KEY_INDEX
 */
function generateXVerify(payload: string): string {
  const digest = crypto
    .createHash('sha256')
    .update(payload + PHONEPE_SECRET_KEY)
    .digest('hex');
  return digest + '###' + PHONEPE_KEY_INDEX;
}

/**
 * Generate X-VERIFY for status check
 * Format: SHA256(path + SECRET_KEY)###KEY_INDEX
 */
function generateXVerifyForStatus(path: string): string {
  const digest = crypto
    .createHash('sha256')
    .update(path + PHONEPE_SECRET_KEY)
    .digest('hex');
  return digest + '###' + PHONEPE_KEY_INDEX;
}

/**
 * Create PhonePay payment request
 */
export async function createPhonePePayment(
  userId: string,
  transactionId: string,
  amount: number, // in rupees
  phoneNumber: string,
  redirectUrl: string,
  callbackUrl: string
): Promise<{ url: string; transactionId: string }> {
  try {
    const amountInPaise = amount * 100;

    const payload: PhonePePaymentPayload = {
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: userId,
      amount: amountInPaise,
      redirectUrl: redirectUrl,
      callbackUrl: callbackUrl,
      mobileNumber: phoneNumber,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    };

    const payloadString = JSON.stringify(payload);
    const base64Payload = Buffer.from(payloadString).toString('base64');
    const xVerify = generateXVerify(base64Payload);

    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/pay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    let data: any;
    try {
      data = await response.json();
    } catch (e) {
      const text = await response.text();
      console.error('PhonePay response text:', text);
      throw new Error(`Failed to parse PhonePay response: ${text}`);
    }

    console.log('PhonePay response:', data);

    if (!response.ok || !data.success) {
      throw new Error(`PhonePay error: ${data.message || data.error || 'Unknown error'}`);
    }

    const redirectUrl2 = data.data?.instrumentResponse?.redirectInfo?.url;
    if (!redirectUrl2) {
      throw new Error(`No redirect URL received from PhonePay. Response: ${JSON.stringify(data)}`);
    }

    return {
      url: redirectUrl2,
      transactionId: transactionId,
    };
  } catch (error) {
    console.error('PhonePay payment creation error:', error);
    throw error;
  }
}

/**
 * Verify PhonePay payment callback
 */
export async function verifyPhonePePayment(
  merchantTransactionId: string
): Promise<{ status: string; amount: number; transactionId: string }> {
  try {
    const path = `/pg/v1/status/${PHONEPE_MERCHANT_ID}/${merchantTransactionId}`;
    const xVerify = generateXVerifyForStatus(path);

    const response = await fetch(
      `${PHONEPE_BASE_URL}${path}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': xVerify,
          'X-MERCHANT-ID': PHONEPE_MERCHANT_ID,
        },
      }
    );

    const data: any = await response.json();

    if (!data.success) {
      throw new Error(`PhonePay verification failed: ${data.message}`);
    }

    return {
      status: data.data?.state || 'UNKNOWN',
      amount: (data.data?.amount || 0) / 100, // convert back to rupees
      transactionId: data.data?.transactionId || merchantTransactionId,
    };
  } catch (error) {
    console.error('PhonePay verification error:', error);
    throw error;
  }
}

/**
 * Refund PhonePay payment
 */
export async function refundPhonePePayment(
  merchantTransactionId: string,
  amount: number
): Promise<{ success: boolean; refundId: string }> {
  try {
    const refundId = `REFUND_${Date.now()}`;
    const amountInPaise = amount * 100;

    const payload = JSON.stringify({
      merchantId: PHONEPE_MERCHANT_ID,
      merchantTransactionId: merchantTransactionId,
      originalTransactionId: merchantTransactionId,
      amount: amountInPaise,
      refundMerchantId: refundId,
    });

    const base64Payload = Buffer.from(payload).toString('base64');
    const xVerify = generateXVerify(base64Payload);

    const response = await fetch(`${PHONEPE_BASE_URL}/pg/v1/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-VERIFY': xVerify,
      },
      body: JSON.stringify({
        request: base64Payload,
      }),
    });

    const data: PhonePeResponse = await response.json();

    if (!data.success) {
      throw new Error(`PhonePay refund failed: ${data.message}`);
    }

    return {
      success: true,
      refundId: refundId,
    };
  } catch (error) {
    console.error('PhonePay refund error:', error);
    throw error;
  }
}

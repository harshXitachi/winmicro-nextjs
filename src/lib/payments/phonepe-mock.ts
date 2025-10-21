import crypto from 'crypto';

/**
 * MOCK PhonePe Implementation - For Testing Only
 * This bypasses the actual PhonePe API and simulates successful payments
 * Use this while waiting for your merchant account to be activated
 */

interface MockPhonePePaymentPayload {
  merchantId: string;
  merchantTransactionId: string;
  merchantUserId: string;
  amount: number;
  redirectUrl: string;
  callbackUrl: string;
  mobileNumber: string;
  paymentInstrument: {
    type: string;
  };
}

/**
 * Create MOCK PhonePe payment request
 * This will simulate a successful payment flow
 */
export async function createPhonePePaymentMock(
  userId: string,
  transactionId: string,
  amount: number,
  phoneNumber: string,
  redirectUrl: string,
  callbackUrl: string
): Promise<{ url: string; transactionId: string }> {
  try {
    console.log('🧪 MOCK PhonePe Payment Created:', {
      userId,
      transactionId,
      amount,
      phoneNumber,
    });

    // Generate a mock payment URL that will redirect to success
    const mockPaymentUrl = `${process.env.NEXT_PUBLIC_APP_URL}/wallet/mock-payment?` +
      `transactionId=${transactionId}&amount=${amount}&phone=${phoneNumber}&redirect=${encodeURIComponent(redirectUrl)}`;

    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      url: mockPaymentUrl,
      transactionId: transactionId,
    };
  } catch (error) {
    console.error('Mock PhonePe payment creation error:', error);
    throw error;
  }
}

/**
 * Verify MOCK PhonePe payment callback
 * This will always return success for testing
 */
export async function verifyPhonePePaymentMock(
  merchantTransactionId: string
): Promise<{ status: string; amount: number; transactionId: string }> {
  try {
    console.log('🧪 MOCK PhonePe Payment Verified:', merchantTransactionId);
    
    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      status: 'COMPLETED',
      amount: 0, // Amount will be fetched from transaction record
      transactionId: merchantTransactionId,
    };
  } catch (error) {
    console.error('Mock PhonePe verification error:', error);
    throw error;
  }
}

/**
 * MOCK Refund PhonePe payment
 */
export async function refundPhonePePaymentMock(
  merchantTransactionId: string,
  amount: number
): Promise<{ success: boolean; refundId: string }> {
  try {
    console.log('🧪 MOCK PhonePe Refund:', { merchantTransactionId, amount });
    
    const refundId = `MOCK_REFUND_${Date.now()}`;
    
    // Simulate async processing delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      refundId: refundId,
    };
  } catch (error) {
    console.error('Mock PhonePe refund error:', error);
    throw error;
  }
}
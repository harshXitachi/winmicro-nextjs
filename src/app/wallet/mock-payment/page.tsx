'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const transactionId = searchParams.get('transactionId');
  const amount = searchParams.get('amount');
  const phone = searchParams.get('phone');
  const redirectUrl = searchParams.get('redirect');

  useEffect(() => {
    // Simulate payment processing
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentStatus('success');
          // Trigger callback after successful payment
          triggerCallback();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const triggerCallback = async () => {
    try {
      // Simulate PhonePe callback
      await fetch('/api/wallet/phonepe-callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          merchantTransactionId: transactionId,
          code: 'PAYMENT_SUCCESS',
          message: 'Payment completed successfully',
          transactionId: transactionId,
          merchantId: 'MOCK_MERCHANT',
          amount: parseFloat(amount || '0') * 100, // Convert to paise
          state: 'COMPLETED',
          responseCode: 'SUCCESS'
        }),
      });
    } catch (error) {
      console.error('Mock callback failed:', error);
      setPaymentStatus('failed');
    }
  };

  const handleSuccess = () => {
    if (redirectUrl) {
      window.location.href = decodeURIComponent(redirectUrl);
    } else {
      router.push('/wallet/payment-success');
    }
  };

  const handleRetry = () => {
    setPaymentStatus('pending');
    setCountdown(5);
    triggerCallback();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <span className="text-purple-600">🧪 Mock PhonePe</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            Testing Mode - No Real Payment
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-2xl font-bold">₹{amount}</div>
            <p className="text-sm text-gray-600">Transaction ID: {transactionId}</p>
            <p className="text-sm text-gray-600">Phone: {phone}</p>
          </div>

          {paymentStatus === 'pending' && (
            <div className="text-center space-y-4">
              <Clock className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
              <div>
                <h3 className="text-lg font-semibold">Processing Payment...</h3>
                <p className="text-sm text-gray-600">
                  Payment will complete in {countdown} seconds
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${((5 - countdown) / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentStatus === 'success' && (
            <div className="text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
                <p className="text-sm text-gray-600">
                  Your wallet will be credited shortly
                </p>
              </div>
              <Button onClick={handleSuccess} className="w-full">
                Continue to Wallet
              </Button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="text-center space-y-4">
              <XCircle className="w-12 h-12 text-red-500 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-600">Payment Failed</h3>
                <p className="text-sm text-gray-600">
                  Unable to process the payment
                </p>
              </div>
              <div className="space-y-2">
                <Button onClick={handleRetry} variant="outline" className="w-full">
                  Retry Payment
                </Button>
                <Button 
                  onClick={() => router.push('/wallet')} 
                  variant="ghost" 
                  className="w-full"
                >
                  Go Back to Wallet
                </Button>
              </div>
            </div>
          )}

          <div className="text-xs text-center text-gray-500 border-t pt-4">
            <p>🚨 <strong>Mock Mode Active</strong></p>
            <p>This is a testing environment. No real money is processed.</p>
            <p>Disable mock mode when PhonePe merchant account is activated.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 text-purple-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading payment...</p>
        </div>
      </div>
    }>
      <MockPaymentContent />
    </Suspense>
  );
}

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser } = useFirebaseAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  const transactionId = searchParams.get('transactionId');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setStatus('failed');
      setMessage('Payment failed. Please try again.');
      return;
    }

    if (!transactionId) {
      setStatus('failed');
      setMessage('No transaction ID found.');
      return;
    }

    // Simulate checking payment status
    setTimeout(() => {
      setStatus('success');
      setMessage('Payment successful! Your wallet has been credited.');
    }, 2000);
  }, [transactionId, error]);

  const handleContinue = () => {
    router.push('/wallet');
  };

  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we verify your payment...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-check-line text-3xl text-green-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            Continue to Wallet
          </button>
        </>
      )}

      {status === 'failed' && (
        <>
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-close-line text-3xl text-red-600"></i>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Payment Failed</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={handleContinue}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
          >
            Try Again
          </button>
        </>
      )}
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
      <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h2>
      <p className="text-gray-600">Please wait...</p>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={<LoadingFallback />}>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}

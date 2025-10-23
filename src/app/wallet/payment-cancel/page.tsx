'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentCancelPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any pending transaction from localStorage
    localStorage.removeItem('pending_transaction_id');
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-orange-600 mb-2">Payment Cancelled</h1>
        <p className="text-gray-600 mb-6">
          You cancelled the payment process. No charges were made to your account.
        </p>
        <div className="space-y-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    </div>
  );
}

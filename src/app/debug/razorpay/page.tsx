'use client';

import { useState } from 'react';

export default function RazorpayDebugPage() {
  const [debugResult, setDebugResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkRazorpayConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/razorpay?key=debug123');
      const data = await response.json();
      setDebugResult(data);
    } catch (error) {
      setDebugResult({ error: 'Failed to fetch debug info', details: error });
    } finally {
      setLoading(false);
    }
  };

  const testRazorpayIntegration = async () => {
    setLoading(true);
    try {
      // Test creating a Razorpay order
      const response = await fetch('/api/wallet/deposit-inr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 100, // Test with ₹100
        }),
      });
      
      const data = await response.json();
      setDebugResult({ 
        testResult: 'Razorpay Integration Test',
        response: data,
        status: response.status,
        success: response.ok
      });
    } catch (error) {
      setDebugResult({ 
        testResult: 'Razorpay Integration Test',
        error: 'Failed to test integration',
        details: error 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔧 Razorpay Debug Page
          </h1>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Environment Variables Check
              </h2>
              <p className="text-blue-700 mb-4">
                Check if Razorpay environment variables are properly configured.
              </p>
              <button
                onClick={checkRazorpayConfig}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Checking...' : 'Check Environment Variables'}
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Razorpay Integration Test
              </h2>
              <p className="text-green-700 mb-4">
                Test the actual Razorpay integration with a ₹100 deposit.
              </p>
              <button
                onClick={testRazorpayIntegration}
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Razorpay Integration'}
              </button>
            </div>

            {debugResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Debug Results:
                </h3>
                <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-auto text-sm">
                  {JSON.stringify(debugResult, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              📋 Expected Results:
            </h3>
            <ul className="text-yellow-800 space-y-1">
              <li>✅ Environment Variables: keyId and keySecret should show [SET]</li>
              <li>✅ Integration Test: Should return orderId and keyId for Razorpay</li>
              <li>✅ No errors should appear in the debug results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser } from '@/lib/supabase';

export default function TestAuth() {
  const [authData, setAuthData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { user, error } = await getCurrentUser();
      setAuthData({ user, error, timestamp: new Date().toISOString() });
    } catch (err) {
      setAuthData({ error: err, timestamp: new Date().toISOString() });
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'sarah@example.com',
          password: 'password123'
        }),
      });
      const data = await response.json();
      console.log('Login response:', data);
      
      // Recheck auth after login
      await checkAuth();
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCookies = () => {
    console.log('All cookies:', document.cookie);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Current Auth State</h2>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(authData, null, 2)}
            </pre>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-3">
            <button
              onClick={testLogin}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 mr-3"
              disabled={loading}
            >
              Test Login (Sarah)
            </button>
            <button
              onClick={checkAuth}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-3"
              disabled={loading}
            >
              Refresh Auth
            </button>
            <button
              onClick={checkCookies}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-3"
            >
              Check Cookies (Console)
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Instructions</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Test Login" to login as Sarah</li>
            <li>Check the auth state above</li>
            <li>Click "Check Cookies" and look at browser console</li>
            <li>Click "Go to Dashboard" to test redirect</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

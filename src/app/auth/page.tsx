'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

declare global {
  interface Window {
    google: any;
  }
}

export default function Auth() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoaded, setGoogleLoaded] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });
        if (response.ok) {
          router.push('/dashboard');
        }
      } catch (err) {
        // Not logged in, continue
      }
    };

    checkAuth();
  }, [router]);

  const handleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError('');

    try {
      const result = await fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: response.credential }),
        credentials: 'include',
      });

      const data = await result.json();

      if (!result.ok) {
        setError(data.error || 'Authentication failed');
        setLoading(false);
        return;
      }

      // If new user, redirect to profile setup
      if (data.isNewUser) {
        window.location.replace('/profile-setup');
      } else {
        // Existing user, redirect to dashboard
        window.location.replace('/dashboard');
      }
    } catch (err: any) {
      console.error('Google auth error:', err);
      setError(err.message || 'Authentication failed');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleLoaded || !window.google) return;

    try {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      
      if (!clientId) {
        console.error('Google Client ID not configured');
        setError('Google Sign-In not configured. Please contact support.');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
        }
      );
    } catch (err: any) {
      console.error('Error initializing Google Sign-In:', err);
      setError('Failed to load Google Sign-In');
    }
  }, [googleLoaded]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Script
        src="https://accounts.google.com/gsi/client"
        async
        defer
        onLoad={() => setGoogleLoaded(true)}
      />
      
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Side - Image */}
              <div className="hidden lg:block">
                <div className="relative">
                  <img
                    src="https://readdy.ai/api/search-image?query=Modern%20professional%20workspace%20with%20people%20working%20on%20laptops%20and%20tablets%2C%20collaborative%20environment%2C%20bright%20office%20space%20with%20large%20windows%2C%20contemporary%20design%2C%20business%20team%20collaboration%2C%20digital%20workspace%2C%20clean%20minimalist%20aesthetic%2C%20natural%20lighting%2C%20productivity%20and%20success%20theme&width=600&height=700&seq=auth-hero&orientation=portrait"
                    alt="Professional workspace"
                    className="w-full h-[700px] object-cover object-top rounded-3xl shadow-2xl"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-600/20 to-transparent rounded-3xl"></div>
                  <div className="absolute bottom-8 left-8 right-8 text-white">
                    <h2 className="text-3xl font-bold mb-4">Join thousands of professionals</h2>
                    <p className="text-lg opacity-90">Start earning with micro tasks and grow your freelance career</p>
                  </div>
                </div>
              </div>

              {/* Right Side - Form */}
              <div className="w-full max-w-md mx-auto lg:mx-0">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
                    <i className="ri-login-box-line text-3xl text-white"></i>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                    Welcome to MicroWin
                  </h1>
                  <p className="text-gray-600 text-lg">
                    Sign in with your Google account to continue
                  </p>
                </div>

                {/* Form Card */}
                <div className="bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-3xl p-8 shadow-2xl shadow-gray-900/10">
                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                      <div className="flex items-center">
                        <i className="ri-error-warning-line text-red-500 mr-3 text-lg"></i>
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Google Sign-In Button */}
                  <div className="space-y-4">
                    <div
                      id="google-signin-button"
                      className="w-full"
                      style={{ minHeight: '50px' }}
                    />

                    {!googleLoaded && (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or</span>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="text-center">
                    <p className="text-gray-600 text-sm">
                      Don't have an account?{' '}
                      <span className="text-blue-600 font-semibold">
                        Sign in to create one
                      </span>
                    </p>
                    <p className="text-gray-500 text-xs mt-2">
                      New users will be guided to complete their profile
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="mt-8 space-y-3">
                  <div className="flex items-start gap-3">
                    <i className="ri-shield-check-line text-green-500 mt-1 flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secure Login</p>
                      <p className="text-xs text-gray-600">Google OAuth 2.0 secured</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="ri-time-line text-blue-500 mt-1 flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Quick Setup</p>
                      <p className="text-xs text-gray-600">Get started in seconds</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <i className="ri-profile-line text-purple-500 mt-1 flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Profile Setup</p>
                      <p className="text-xs text-gray-600">Complete your profile with ease</p>
                    </div>
                  </div>
                </div>

                {/* Security Note */}
                <div className="mt-8 text-center">
                  <p className="text-xs text-gray-500">
                    <i className="ri-shield-check-line mr-1"></i>
                    Your data is protected with enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

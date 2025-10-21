'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function Auth() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check for error in URL
    const errorParam = searchParams?.get('error');
    if (errorParam) {
      setError('Authentication failed. Please try again.');
    }
  }, [searchParams]);

  const handleLogin = () => {
    setLoading(true);
    // Redirect to Auth0 login
    window.location.href = '/api/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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

                  {/* Auth0 Sign-In Button */}
                  <div className="space-y-4">
                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-login-box-line text-xl"></i>
                          <span>Sign in with Auth0</span>
                        </>
                      )}
                    </button>
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
                      <p className="text-xs text-gray-600">Auth0 secured authentication</p>
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

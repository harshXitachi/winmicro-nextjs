'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

function AuthContent() {
  const router = useRouter();
  const { user, loading: authLoading, signInWithGoogle, signInWithEmail } = useFirebaseAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showEmailLogin, setShowEmailLogin] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await signInWithGoogle();
      // Wait a bit for auth state to update, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signInWithEmail(email, password);
      // Wait a bit for auth state to update, then redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } catch (err: any) {
      console.error('Email login error:', err);
      setError(err.message || 'Failed to sign in');
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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

                {/* Google Sign-In Button */}
                  <div className="space-y-4">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={loading}
                      className="w-full px-6 py-4 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <>
                          <i className="ri-google-fill text-xl text-red-500"></i>
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>
                    
                    {!showEmailLogin && (
                      <button
                        onClick={() => setShowEmailLogin(true)}
                        className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl"
                      >
                        <i className="ri-mail-line text-xl"></i>
                        <span>Sign in with Email</span>
                      </button>
                    )}
                    
                    {showEmailLogin && (
                      <form onSubmit={handleEmailLogin} className="space-y-4 mt-4">
                        <div>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Email address"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
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
                              <span>Sign in</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowEmailLogin(false)}
                          className="w-full text-sm text-gray-600 hover:text-gray-800"
                        >
                          Back to other options
                        </button>
                      </form>
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
                      <span className="text-blue-600 font-semibold cursor-pointer" onClick={() => router.push('/signup')}>
                        Sign up here
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
                      <p className="text-xs text-gray-600">Firebase secured authentication</p>
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

export default function Auth() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}

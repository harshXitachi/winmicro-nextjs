
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signUp, signIn } from '@/lib/supabase';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const router = useRouter();

  // Clear messages when switching between login/signup
  useEffect(() => {
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
  }, [isLogin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (isLogin) {
      if (!formData.email || !formData.password) {
        setError('Email and password are required');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    } else {
      // Signup validation
      if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
        setError('All fields are required');
        return false;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        // Use API for all logins (admin and regular users)
        console.log('🔐 Starting login process');
        setSuccess('Signing you in...');
        
        const { data, error } = await signIn(formData.email, formData.password);
        
        console.log('Login response:', { data, error });
        
        if (error) {
          console.error('❌ Login error:', error);
          setError(error.message || 'Login failed. Please check your credentials.');
          setLoading(false);
        } else if (data?.user) {
          console.log('✅ Login successful, user data:', data.user);
          console.log('📧 User role:', data.user.role);
          setSuccess('Login successful! Redirecting...');
          
          // Small delay to show success message
          setTimeout(() => {
            console.log('🚀 Redirecting now...');
            
            // Redirect based on role using window.location for full page reload
            const targetUrl = data.user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
            console.log('🎯 Target URL:', targetUrl);
            
            // Force full page reload to ensure auth state is updated
            window.location.replace(targetUrl);
          }, 500);
        } else {
          console.error('❌ Login failed: No user data returned');
          setError('Login failed. Please try again.');
          setLoading(false);
        }
      } else {
        // Register new user
        console.log('📝 Starting registration process');
        setSuccess('Creating your account...');
        
        const { data, error } = await signUp(formData.email, formData.password, {
          first_name: formData.firstName,
          last_name: formData.lastName
        });
        
        if (error) {
          console.error('Registration error:', error);
          setError(error.message || 'Registration failed. Please try again.');
          setLoading(false);
        } else if (data?.user) {
          setSuccess('Account created successfully! Please login with your credentials.');
          
          // Switch to login mode after successful signup
          setTimeout(() => {
            setIsLogin(true);
            setFormData({
              email: formData.email,
              password: '',
              firstName: '',
              lastName: ''
            });
            setLoading(false);
          }, 2000);
        } else {
          setError('Registration failed. Please try again.');
          setLoading(false);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: ''
    });
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
                    <i className={`${isLogin ? 'ri-login-box-line' : 'ri-user-add-line'} text-3xl text-white`}></i>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                    {isLogin ? 'Welcome Back' : 'Join MicroWin'}
                  </h1>
                  <p className="text-gray-600 text-lg">
                    {isLogin 
                      ? 'Sign in to your account and continue your journey' 
                      : 'Create your account and start earning with micro tasks'}
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

                  {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-2xl">
                      <div className="flex items-center">
                        <i className="ri-check-line text-green-500 mr-3 text-lg"></i>
                        <p className="text-green-600 text-sm font-medium">{success}</p>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {!isLogin && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                            First Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                              required={!isLogin}
                              disabled={loading}
                              placeholder="John"
                            />
                            <i className="ri-user-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                            Last Name
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                              required={!isLogin}
                              disabled={loading}
                              placeholder="Doe"
                            />
                            <i className="ri-user-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          required
                          disabled={loading}
                          placeholder="john@example.com"
                        />
                        <i className="ri-mail-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          id="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 pl-12 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50/50"
                          required
                          disabled={loading}
                          minLength={6}
                          placeholder="Enter your password"
                        />
                        <i className="ri-lock-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                          disabled={loading}
                        >
                          <i className={`${showPassword ? 'ri-eye-off-line' : 'ri-eye-line'} text-lg`}></i>
                        </button>
                      </div>
                      {!isLogin && (
                        <p className="text-xs text-gray-500 mt-1">
                          Password must be at least 6 characters long
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none whitespace-nowrap cursor-pointer shadow-lg"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                          {isLogin ? 'Signing In...' : 'Creating Account...'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <i className={`${isLogin ? 'ri-login-box-line' : 'ri-user-add-line'} mr-2`}></i>
                          {isLogin ? 'Sign In' : 'Create Account'}
                        </div>
                      )}
                    </button>
                  </form>

                  {/* Toggle */}
                  <div className="mt-8 text-center">
                    <p className="text-gray-600">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        onClick={toggleMode}
                        className="ml-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors whitespace-nowrap cursor-pointer"
                        disabled={loading}
                      >
                        {isLogin ? 'Sign up' : 'Sign in'}
                      </button>
                    </p>
                  </div>
                </div>

                {/* Admin Demo Info */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="text-blue-900 font-semibold mb-2 flex items-center">
                    <i className="ri-admin-line mr-2"></i>
                    Admin Demo Access
                  </h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Use these credentials to access the admin panel:
                  </p>
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-mono text-blue-600">admin@gmail.com</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Password:</span>
                        <span className="ml-2 font-mono text-blue-600">admin1</span>
                      </div>
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

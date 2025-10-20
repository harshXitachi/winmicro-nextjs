'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/feature/Navbar';
import Footer from '@/components/feature/Footer';

export default function ProfileSetup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checking, setChecking] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'available' | 'taken' | null>(null);
  const [usernameError, setUsernameError] = useState('');
  
  const router = useRouter();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    bio: '',
    location: '',
    phone: '',
    skills: [] as string[],
  });

  const [skillInput, setSkillInput] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleUsernameCheck = async (username: string) => {
    if (!username || username.length < 3) {
      setUsernameError('Username must be at least 3 characters');
      setUsernameStatus(null);
      return;
    }

    setChecking(true);
    setUsernameError('');

    try {
      const response = await fetch('/api/profile/check-username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include',
      });

      const data = await response.json();

      if (data.available) {
        setUsernameStatus('available');
        setUsernameError('');
      } else {
        setUsernameStatus('taken');
        setUsernameError('Username already taken');
      }
    } catch (err: any) {
      setUsernameError('Failed to check username');
      setUsernameStatus(null);
    } finally {
      setChecking(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && formData.skills.length < 10) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return;
    }

    if (!formData.username) {
      setError('Username is required');
      return;
    }

    if (usernameStatus !== 'available') {
      setError('Please select an available username');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          bio: formData.bio || null,
          location: formData.location || null,
          phone: formData.phone || null,
          skills: formData.skills.length > 0 ? formData.skills : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to complete profile');
        setLoading(false);
        return;
      }

      setSuccess('Profile setup complete! Redirecting to dashboard...');
      setTimeout(() => {
        window.location.replace('/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="pt-20 pb-16">
        <div className="px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
                <i className="ri-user-settings-line text-3xl text-white"></i>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                Complete Your Profile
              </h1>
              <p className="text-gray-600 text-lg">
                Set up your profile to get started on MicroWin
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
                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={loading}
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                      disabled={loading}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Username Field */}
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username * <span className="text-xs text-gray-500">(3-50 characters)</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={(e) => {
                          handleInputChange(e);
                          if (e.target.value.length >= 3) {
                            handleUsernameCheck(e.target.value);
                          }
                        }}
                        className={`w-full px-4 py-3 border rounded-xl transition-all ${
                          usernameStatus === 'available'
                            ? 'border-green-300 focus:ring-green-500'
                            : usernameStatus === 'taken'
                            ? 'border-red-300 focus:ring-red-500'
                            : 'border-gray-200 focus:ring-blue-500'
                        } focus:ring-2 focus:border-transparent`}
                        required
                        disabled={loading}
                        placeholder="johndoe123"
                        minLength={3}
                        maxLength={50}
                      />
                      {checking && (
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                        </div>
                      )}
                      {usernameStatus === 'available' && (
                        <i className="ri-check-line absolute right-4 top-1/2 transform -translate-y-1/2 text-green-500 text-lg"></i>
                      )}
                      {usernameStatus === 'taken' && (
                        <i className="ri-close-line absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500 text-lg"></i>
                      )}
                    </div>
                  </div>
                  {usernameError && (
                    <p className="text-xs text-red-500 mt-1">{usernameError}</p>
                  )}
                  {usernameStatus === 'available' && (
                    <p className="text-xs text-green-500 mt-1">Username is available!</p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label htmlFor="bio" className="block text-sm font-semibold text-gray-700 mb-2">
                    Bio <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                    placeholder="Tell us about yourself..."
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-2">
                    Location <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                    placeholder="City, Country"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone <span className="text-xs text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={loading}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Skills <span className="text-xs text-gray-500">(optional, max 10)</span>
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Add a skill (e.g., Python, Design, Writing)"
                      disabled={loading || formData.skills.length >= 10}
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      disabled={loading || !skillInput.trim() || formData.skills.length >= 10}
                      className="px-4 py-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors disabled:opacity-50"
                    >
                      <i className="ri-add-line"></i>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-full border border-blue-200"
                      >
                        <span className="text-sm text-blue-700">{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(index)}
                          disabled={loading}
                          className="text-blue-500 hover:text-blue-700"
                        >
                          <i className="ri-close-line"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || usernameStatus !== 'available'}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      Completing Profile...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <i className="ri-check-line mr-2"></i>
                      Complete Profile & Start Earning
                    </div>
                  )}
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                <i className="ri-shield-check-line mr-1"></i>
                Your information is secure and will never be shared without your consent
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

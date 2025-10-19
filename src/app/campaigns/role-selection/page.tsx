'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function CampaignRoleSelection() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="ri-flag-line text-3xl text-indigo-600"></i>
              <h1 className="text-2xl font-bold text-gray-900">Campaign Hub</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How do you want to participate today?
          </h2>
          <p className="text-xl text-gray-600">
            Choose your role to get started with campaigns
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Employer Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-indigo-500">
            <div className="p-8">
              <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <i className="ri-briefcase-line text-4xl text-indigo-600"></i>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                I'm an Employer
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Post campaigns, manage teams, and get large-scale work done efficiently.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Create and manage campaigns</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Build collaborative teams</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Track progress in real-time</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Reward top performers</span>
                </li>
              </ul>

              <button
                onClick={() => router.push('/campaigns/employer/dashboard')}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue as Employer</span>
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            </div>
          </div>

          {/* Worker Card */}
          <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-transparent hover:border-purple-500">
            <div className="p-8">
              <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 mx-auto">
                <i className="ri-tools-line text-4xl text-purple-600"></i>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                I'm a Worker
              </h3>
              
              <p className="text-gray-600 text-center mb-6">
                Find exciting campaigns, collaborate with teams, and earn money.
              </p>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Browse campaign opportunities</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Join collaborative teams</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Communicate via group chat</span>
                </li>
                <li className="flex items-start">
                  <i className="ri-check-line text-green-500 text-xl mr-3 mt-0.5"></i>
                  <span className="text-gray-700">Earn bonuses for great work</span>
                </li>
              </ul>

              <button
                onClick={() => router.push('/campaigns/worker/marketplace')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-colors flex items-center justify-center space-x-2"
              >
                <span>Continue as Worker</span>
                <i className="ri-arrow-right-line text-xl"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-3xl mx-auto">
          <div className="flex items-start">
            <i className="ri-information-line text-2xl text-blue-600 mr-4 mt-1"></i>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Flexible Role Switching</h4>
              <p className="text-blue-800 text-sm">
                You can switch between Employer and Worker roles at any time. Post campaigns when you need work done, 
                or join campaigns when you want to earn money. The choice is yours!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

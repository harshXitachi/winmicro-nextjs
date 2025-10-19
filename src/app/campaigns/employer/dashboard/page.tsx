'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Campaign {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  current_workers: number;
  target_workers: number;
  base_payment: string;
  currency: string;
  total_spent: string;
  created_at: string;
}

export default function EmployerDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState({
    activeCampaigns: 0,
    totalWorkers: 0,
    budgetSpent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/campaigns?role=employer');
      const data = await response.json();
      
      if (data.campaigns) {
        setCampaigns(data.campaigns);
        
        // Calculate stats
        const active = data.campaigns.filter((c: Campaign) => c.status === 'active').length;
        const totalWorkers = data.campaigns.reduce((sum: number, c: Campaign) => sum + c.current_workers, 0);
        const budgetSpent = data.campaigns.reduce((sum: number, c: Campaign) => sum + parseFloat(c.total_spent || '0'), 0);
        
        setStats({
          activeCampaigns: active,
          totalWorkers,
          budgetSpent,
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="ri-briefcase-line text-3xl text-indigo-600"></i>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employer Dashboard</h1>
                <p className="text-sm text-gray-600">Manage your campaigns and team</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/campaigns/role-selection')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <i className="ri-dashboard-line mr-2"></i>Dashboard
          </button>
          <button
            onClick={() => router.push('/campaigns/employer/create')}
            className="pb-3 px-2 font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="ri-add-circle-line mr-2"></i>Create Campaign
          </button>
        </div>

        {/* Stats Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Active Campaigns */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <i className="ri-flag-line text-2xl text-indigo-600"></i>
              </div>
              <span className="text-xs text-gray-500">Active</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeCampaigns}</h3>
            <p className="text-sm text-gray-600">Active Campaigns</p>
          </div>

          {/* Total Workers */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <i className="ri-team-line text-2xl text-purple-600"></i>
              </div>
              <span className="text-xs text-gray-500">Engaged</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalWorkers}</h3>
            <p className="text-sm text-gray-600">Total Workers</p>
          </div>

          {/* Budget Spent */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
              </div>
              <span className="text-xs text-gray-500">This Month</span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">₹{stats.budgetSpent.toFixed(2)}</h3>
            <p className="text-sm text-gray-600">Budget Spent</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-xl mb-2">Ready to launch a new campaign?</h3>
              <p className="text-indigo-100 text-sm">Create campaigns and build your team in minutes</p>
            </div>
            <button
              onClick={() => router.push('/campaigns/employer/create')}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center space-x-2"
            >
              <i className="ri-add-line text-xl"></i>
              <span>Create Campaign</span>
            </button>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">My Campaigns</h2>
          </div>
          
          {campaigns.length === 0 ? (
            <div className="p-12 text-center">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
              <p className="text-gray-600 mb-6">Create your first campaign to get started</p>
              <button
                onClick={() => router.push('/campaigns/employer/create')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Campaign
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {campaigns.map((campaign) => (
                <div
                  key={campaign.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/campaigns/employer/campaign/${campaign.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                          {campaign.status}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {campaign.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <span className="flex items-center">
                          <i className="ri-folder-line mr-1"></i>
                          {campaign.category}
                        </span>
                        <span className="flex items-center">
                          <i className="ri-team-line mr-1"></i>
                          {campaign.current_workers}/{campaign.target_workers} Workers
                        </span>
                        <span className="flex items-center">
                          <i className="ri-money-dollar-circle-line mr-1"></i>
                          {campaign.currency} {campaign.base_payment} per task
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{ width: `${(campaign.current_workers / campaign.target_workers) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/campaigns/employer/campaign/${campaign.id}`);
                      }}
                      className="ml-4 text-indigo-600 hover:text-indigo-700"
                    >
                      <i className="ri-arrow-right-line text-2xl"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

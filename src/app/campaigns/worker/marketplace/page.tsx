'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  required_skills: string[];
  target_workers: number;
  current_workers: number;
  base_payment: string;
  currency: string;
  employer_name: string;
  created_at: string;
}

const CATEGORIES = [
  'All Categories',
  'Social Media',
  'Content Creation',
  'Data Research',
  'Data Entry',
  'Graphic Design',
  'Video Editing',
  'Translation',
  'Customer Support',
  'Testing & QA',
  'Other',
];

export default function WorkerMarketplace() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchCampaigns();
    }
  }, [user, loading, router]);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, selectedCategory, searchQuery, sortBy]);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?role=worker');
      const data = await response.json();
      
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Filter by category
    if (selectedCategory !== 'All Categories') {
      filtered = filtered.filter(c => c.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'payment-high':
          return parseFloat(b.base_payment) - parseFloat(a.base_payment);
        case 'payment-low':
          return parseFloat(a.base_payment) - parseFloat(b.base_payment);
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    setFilteredCampaigns(filtered);
  };

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/members`, {
        method: 'POST',
      });

      if (response.ok) {
        alert('Successfully joined the campaign!');
        fetchCampaigns(); // Refresh
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to join campaign');
      }
    } catch (error) {
      console.error('Error joining campaign:', error);
      alert('Failed to join campaign');
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <i className="ri-store-3-line text-3xl text-purple-600"></i>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Campaign Marketplace</h1>
                <p className="text-sm text-gray-600">Find exciting campaigns and earn money</p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-8">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <i className="ri-filter-3-line mr-2"></i>
                Filters
              </h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === category
                          ? 'bg-purple-100 text-purple-800 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="payment-high">Payment: High to Low</option>
                  <option value="payment-low">Payment: Low to High</option>
                </select>
              </div>
            </div>
          </div>

          {/* Campaign List */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campaigns..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Results Count */}
            <div className="mb-4 text-sm text-gray-600">
              {filteredCampaigns.length} {filteredCampaigns.length === 1 ? 'campaign' : 'campaigns'} found
            </div>

            {/* Campaigns Grid */}
            {filteredCampaigns.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <i className="ri-search-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {campaign.type}
                          </span>
                        </div>
                        
                        <p className="text-gray-600 mb-3 line-clamp-2">{campaign.description}</p>

                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center">
                            <i className="ri-briefcase-line mr-1"></i>
                            {campaign.employer_name}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-folder-line mr-1"></i>
                            {campaign.category}
                          </span>
                          <span className="flex items-center">
                            <i className="ri-team-line mr-1"></i>
                            {campaign.current_workers}/{campaign.target_workers} joined
                          </span>
                        </div>

                        {campaign.required_skills && campaign.required_skills.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {campaign.required_skills.map(skill => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="ml-6 text-right">
                        <div className="mb-3">
                          <div className="text-3xl font-bold text-purple-600">
                            {campaign.currency === 'INR' && '₹'}
                            {campaign.currency === 'USD' && '$'}
                            {campaign.currency === 'USDT' && campaign.currency + ' '}
                            {campaign.base_payment}
                          </div>
                          <div className="text-sm text-gray-500">per task</div>
                        </div>

                        <button
                          onClick={() => handleJoinCampaign(campaign.id)}
                          disabled={campaign.current_workers >= campaign.target_workers}
                          className="w-full px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {campaign.current_workers >= campaign.target_workers ? (
                            <>
                              <i className="ri-lock-line"></i>
                              <span>Full</span>
                            </>
                          ) : (
                            <>
                              <i className="ri-add-line"></i>
                              <span>Join Campaign</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => router.push(`/campaigns/worker/campaign/${campaign.id}`)}
                          className="w-full mt-2 px-6 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors text-sm font-medium flex items-center justify-center space-x-1"
                        >
                          <i className="ri-eye-line"></i>
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 h-2 rounded-full transition-all"
                        style={{ width: `${(campaign.current_workers / campaign.target_workers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

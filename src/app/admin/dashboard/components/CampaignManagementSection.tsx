'use client';

import { useState, useEffect } from 'react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  budget: string;
  current_workers: number;
  target_workers: number;
  created_at: string;
}

export default function CampaignManagementSection() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const response = await fetch('/api/campaigns?role=employer');
      const data = await response.json();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      case 'paused': return 'bg-yellow-100 text-yellow-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const statusMatch = filterStatus === 'all' || campaign.status === filterStatus;
    const searchMatch = campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       campaign.description.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const handleDeleteCampaign = async (campaignId: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setCampaigns(campaigns.filter(c => c.id !== campaignId));
          alert('Campaign deleted successfully');
        }
      } catch (error) {
        console.error('Error deleting campaign:', error);
        alert('Failed to delete campaign');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Campaign Management Header */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Campaign Management</h2>
            <p className="text-gray-600">Monitor and manage all platform campaigns</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
              <i className="ri-add-line mr-2"></i>
              Create Campaign
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors">
              <i className="ri-download-line mr-2"></i>
              Export
            </button>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Campaigns</p>
                <p className="text-2xl font-bold text-blue-900">{campaigns.length}</p>
              </div>
              <i className="ri-layout-grid-line text-3xl text-blue-600"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Active</p>
                <p className="text-2xl font-bold text-green-900">
                  {campaigns.filter(c => c.status === 'active').length}
                </p>
              </div>
              <i className="ri-play-circle-line text-3xl text-green-600"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Total Budget</p>
                <p className="text-2xl font-bold text-purple-900">
                  ₹{campaigns.reduce((sum, c) => sum + parseFloat(c.budget || '0'), 0).toFixed(2)}
                </p>
              </div>
              <i className="ri-money-rupee-circle-line text-3xl text-purple-600"></i>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Total Workers</p>
                <p className="text-2xl font-bold text-orange-900">
                  {campaigns.reduce((sum, c) => sum + c.current_workers, 0)}
                </p>
              </div>
              <i className="ri-team-line text-3xl text-orange-600"></i>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <i className="ri-search-line absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"></i>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Campaigns Table */}
        <div className="overflow-x-auto">
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h4>
              <p className="text-gray-600">No campaigns match your current filters</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Campaign</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Budget</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Workers</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Created</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 max-w-xs truncate">{campaign.name}</div>
                        <div className="text-sm text-gray-500 max-w-xs truncate">{campaign.description}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status?.toUpperCase() || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">₹{parseFloat(campaign.budget || '0').toFixed(2)}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600"
                            style={{
                              width: `${(campaign.current_workers / campaign.target_workers) * 100}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">
                          {campaign.current_workers}/{campaign.target_workers}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{campaign.category}</td>
                    <td className="py-4 px-4 text-gray-700">{new Date(campaign.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <i className="ri-eye-line"></i>
                        </button>
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Edit">
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

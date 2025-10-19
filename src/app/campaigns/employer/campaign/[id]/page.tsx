'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import GroupChatComponent from '@/components/feature/GroupChatComponent';

interface Campaign {
  id: string;
  name: string;
  description: string;
  type: string;
  category: string;
  status: string;
  current_workers: number;
  target_workers: number;
  base_payment: string;
  currency: string;
  total_spent: string;
  escrow_balance: string;
  group_chat_enabled: boolean;
}

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  tasks_completed: number;
  total_earned: string;
  success_rate: string;
  joined_at: string;
}

interface Submission {
  id: string;
  worker_id: string;
  worker_name: string;
  proof_url: string;
  description: string;
  status: string;
  review_note: string;
  created_at: string;
}

export default function CampaignManagement() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'roster' | 'submissions' | 'chat'>('overview');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  useEffect(() => {
    if (campaignId) {
      fetchCampaignData();
    }
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      const [campaignRes, membersRes, submissionsRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/campaigns/${campaignId}/members`),
        fetch(`/api/campaigns/${campaignId}/submissions`),
      ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData.campaign);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        setMembers(membersData.members || []);
      }

      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json();
        setSubmissions(submissionsData.submissions || []);
      }
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReviewSubmission = async (submissionId: string, status: 'approved' | 'rejected') => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/submissions?submissionId=${submissionId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, review_note: reviewNote }),
        }
      );

      if (response.ok) {
        alert(`Submission ${status}!`);
        setSelectedSubmission(null);
        setReviewNote('');
        fetchCampaignData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to review submission');
      }
    } catch (error) {
      console.error('Error reviewing submission:', error);
      alert('Failed to review submission');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/members?userId=${userId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        alert('Member removed successfully');
        fetchCampaignData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="ri-error-warning-line text-6xl text-red-500 mb-4"></i>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Campaign Not Found</h2>
          <button
            onClick={() => router.push('/campaigns/employer/dashboard')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Dashboard
          </button>
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
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>
              <p className="text-sm text-gray-600">{campaign.category} • {campaign.type}</p>
            </div>
            <button
              onClick={() => router.push('/campaigns/employer/dashboard')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'roster', 'submissions', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-team-line text-2xl text-indigo-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{campaign.current_workers}/{campaign.target_workers}</h3>
                <p className="text-sm text-gray-600">Workers Joined</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-file-list-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{submissions.length}</h3>
                <p className="text-sm text-gray-600">Submissions</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-money-dollar-circle-line text-2xl text-green-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{campaign.currency} {campaign.total_spent}</h3>
                <p className="text-sm text-gray-600">Total Spent</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-wallet-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{campaign.currency} {campaign.escrow_balance}</h3>
                <p className="text-sm text-gray-600">Escrow Balance</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full transition-all flex items-center justify-end pr-2"
                  style={{ width: `${(campaign.current_workers / campaign.target_workers) * 100}%` }}
                >
                  <span className="text-xs text-white font-medium">
                    {Math.round((campaign.current_workers / campaign.target_workers) * 100)}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {campaign.current_workers} of {campaign.target_workers} workers joined
              </p>
            </div>

            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Campaign Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Payment:</span>
                  <span className="font-medium">{campaign.currency} {campaign.base_payment}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{campaign.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Group Chat:</span>
                  <span className="font-medium">{campaign.group_chat_enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-700">{campaign.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900">Campaign Members</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <div className="p-12 text-center">
                  <i className="ri-team-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600">No members yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold">
                            {member.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.user_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <i className="ri-checkbox-circle-line mr-1 text-green-500"></i>
                              {member.tasks_completed} completed
                            </span>
                            <span className="flex items-center">
                              <i className="ri-money-dollar-circle-line mr-1"></i>
                              Earned: {campaign.currency} {member.total_earned}
                            </span>
                          </div>
                        </div>
                      </div>
                      {member.role === 'worker' && (
                        <button
                          onClick={() => handleRemoveMember(member.user_id)}
                          className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Submissions Tab */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {submissions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <i className="ri-file-list-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">No submissions yet</p>
              </div>
            ) : (
              submissions.map((submission) => (
                <div key={submission.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">{submission.worker_name}</h4>
                      <p className="text-sm text-gray-600">{new Date(submission.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{submission.description}</p>
                  
                  {submission.proof_url && (
                    <a
                      href={submission.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-700 text-sm flex items-center space-x-1 mb-4"
                    >
                      <i className="ri-link"></i>
                      <span>View Proof</span>
                    </a>
                  )}

                  {submission.status === 'pending' && (
                    <div className="flex space-x-3 pt-4 border-t">
                      <input
                        type="text"
                        value={selectedSubmission?.id === submission.id ? reviewNote : ''}
                        onChange={(e) => {
                          setSelectedSubmission(submission);
                          setReviewNote(e.target.value);
                        }}
                        placeholder="Add review note (optional)..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={() => handleReviewSubmission(submission.id, 'approved')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReviewSubmission(submission.id, 'rejected')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {submission.review_note && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Review: </span>
                        {submission.review_note}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div>
            {campaign.group_chat_enabled ? (
              <GroupChatComponent
                campaignId={campaignId}
                isAdmin={true}
                currentUserId={user?.userId || user?.id || ''}
                members={members}
                onMemberUpdate={fetchCampaignData}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <i className="ri-chat-off-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">Group chat is disabled for this campaign</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

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
  group_chat_enabled: boolean;
  employer_name: string;
  created_at: string;
}

interface Member {
  id: string;
  user_id: string;
  user_name: string;
  role: string;
  tasks_completed: number;
  total_earned: string;
  joined_at: string;
}

interface Submission {
  id: string;
  worker_id: string;
  proof_url: string;
  description: string;
  status: string;
  review_note: string;
  created_at: string;
}

export default function WorkerCampaignDetails() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [workerSubmission, setWorkerSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'work' | 'roster' | 'chat'>('overview');
  const [isMember, setIsMember] = useState(false);

  // Submission form state
  const [submissionForm, setSubmissionForm] = useState({
    proof_url: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (campaignId && user) {
      fetchCampaignData();
    }
  }, [campaignId, user]);

  const fetchCampaignData = async () => {
    try {
      const [campaignRes, membersRes, submissionRes, membershipRes] = await Promise.all([
        fetch(`/api/campaigns/${campaignId}`),
        fetch(`/api/campaigns/${campaignId}/members`),
        fetch(`/api/campaigns/${campaignId}/submissions?workerId=${user?.id}`),
        fetch(`/api/campaigns/${campaignId}/check-membership`),
      ]);

      if (campaignRes.ok) {
        const campaignData = await campaignRes.json();
        setCampaign(campaignData.campaign);
      }

      if (membersRes.ok) {
        const membersData = await membersRes.json();
        const membersList = membersData.members || [];
        setMembers(membersList);
      }

      if (membershipRes.ok) {
        const membershipData = await membershipRes.json();
        setIsMember(membershipData.isMember);
      }

      if (submissionRes.ok) {
        const submissionData = await submissionRes.json();
        setWorkerSubmission(submissionData.submission || null);
      }
    } catch (error) {
      console.error('Failed to fetch campaign data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!submissionForm.proof_url || !submissionForm.description) {
      alert('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/campaigns/${campaignId}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionForm),
      });

      if (response.ok) {
        alert('Work submitted successfully!');
        setSubmissionForm({ proof_url: '', description: '' });
        fetchCampaignData();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit work');
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      alert('Failed to submit work');
    } finally {
      setIsSubmitting(false);
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
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
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
            onClick={() => router.push('/campaigns/worker/marketplace')}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Marketplace
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
              onClick={() => router.push('/campaigns/worker/marketplace')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <i className="ri-arrow-left-line"></i>
              <span>Back</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {['overview', 'work', 'roster', 'chat'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? 'border-purple-600 text-purple-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'work' ? 'Submit Work' : tab}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-money-dollar-circle-line text-2xl text-purple-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {campaign.currency === 'INR' && '₹'}
                  {campaign.currency === 'USD' && '$'}
                  {campaign.currency === 'USDT' && campaign.currency + ' '}
                  {campaign.base_payment}
                </h3>
                <p className="text-sm text-gray-600">Per Task Payment</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-team-line text-2xl text-indigo-600"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-900">{campaign.current_workers}/{campaign.target_workers}</h3>
                <p className="text-sm text-gray-600">Workers Joined</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <i className="ri-calendar-line text-2xl text-blue-600"></i>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{campaign.type}</h3>
                <p className="text-sm text-gray-600">Campaign Type</p>
              </div>
            </div>

            {/* Membership Status */}
            {!isMember && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <i className="ri-info-line text-xl text-blue-600 mt-1"></i>
                    <div>
                      <h4 className="font-semibold text-blue-900">Not a Member Yet</h4>
                      <p className="text-sm text-blue-800 mt-1">Join this campaign to start working on tasks and earning money.</p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch(`/api/campaigns/${campaignId}/members`, {
                          method: 'POST',
                        });
                        if (response.ok) {
                          alert('Successfully joined the campaign!');
                          fetchCampaignData();
                        } else {
                          const error = await response.json();
                          alert(error.error || 'Failed to join');
                        }
                      } catch (error) {
                        alert('Failed to join campaign');
                      }
                    }}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
                  >
                    Join Campaign
                  </button>
                </div>
              </div>
            )}

            {/* Campaign Details */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">About This Campaign</h3>
              <p className="text-gray-700 mb-6">{campaign.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Posted by:</span>
                  <p className="font-medium text-gray-900">{campaign.employer_name}</p>
                </div>
                <div>
                  <span className="text-gray-600">Posted on:</span>
                  <p className="font-medium text-gray-900">{new Date(campaign.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-gray-600">Chat Enabled:</span>
                  <p className="font-medium text-gray-900">{campaign.group_chat_enabled ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <span className="text-gray-600">Total Workers:</span>
                  <p className="font-medium text-gray-900">{campaign.current_workers}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Work Submission Tab */}
        {activeTab === 'work' && (
          <div className="max-w-2xl">
            {!isMember ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                <i className="ri-lock-line text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Join the Campaign First</h3>
                <p className="text-gray-600 mb-4">You need to join this campaign to submit work.</p>
                <button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/campaigns/${campaignId}/members`, {
                        method: 'POST',
                      });
                      if (response.ok) {
                        alert('Successfully joined the campaign!');
                        fetchCampaignData();
                      }
                    } catch (error) {
                      alert('Failed to join campaign');
                    }
                  }}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Join Campaign
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Current Submission Status */}
                {workerSubmission && (
                  <div className={`rounded-xl shadow-sm p-6 border ${
                    workerSubmission.status === 'approved' 
                      ? 'bg-green-50 border-green-200' 
                      : workerSubmission.status === 'rejected'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className={`font-semibold mb-2 ${
                          workerSubmission.status === 'approved'
                            ? 'text-green-900'
                            : workerSubmission.status === 'rejected'
                            ? 'text-red-900'
                            : 'text-yellow-900'
                        }`}>
                          {workerSubmission.status === 'pending' && '⏳ Pending Review'}
                          {workerSubmission.status === 'approved' && '✓ Approved'}
                          {workerSubmission.status === 'rejected' && '✗ Rejected'}
                        </h4>
                        <p className={`text-sm mb-2 ${
                          workerSubmission.status === 'approved'
                            ? 'text-green-800'
                            : workerSubmission.status === 'rejected'
                            ? 'text-red-800'
                            : 'text-yellow-800'
                        }`}>
                          Submitted on: {new Date(workerSubmission.created_at).toLocaleDateString()}
                        </p>
                        {workerSubmission.review_note && (
                          <p className={`text-sm ${
                            workerSubmission.status === 'approved'
                              ? 'text-green-800'
                              : workerSubmission.status === 'rejected'
                              ? 'text-red-800'
                              : 'text-yellow-800'
                          }`}>
                            Review: {workerSubmission.review_note}
                          </p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(workerSubmission.status)}`}>
                        {workerSubmission.status}
                      </span>
                    </div>
                  </div>
                )}

                {/* Submission Form */}
                {!workerSubmission || workerSubmission.status === 'rejected' ? (
                  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-6">Submit Your Work</h3>
                    <form onSubmit={handleSubmitWork} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proof URL <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="url"
                          value={submissionForm.proof_url}
                          onChange={(e) => setSubmissionForm({
                            ...submissionForm,
                            proof_url: e.target.value
                          })}
                          placeholder="https://example.com/proof"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-1">Link to your work (screenshot, document, etc.)</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={submissionForm.description}
                          onChange={(e) => setSubmissionForm({
                            ...submissionForm,
                            description: e.target.value
                          })}
                          placeholder="Describe your work and any relevant details..."
                          rows={5}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Submitting...</span>
                          </>
                        ) : (
                          <>
                            <i className="ri-send-plane-line"></i>
                            <span>Submit Work</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
                    <i className="ri-checkbox-circle-line text-6xl text-green-500 mb-4"></i>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Work Already Submitted</h3>
                    <p className="text-gray-600">Your submission is pending review by the employer.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Roster Tab */}
        {activeTab === 'roster' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b">
              <h3 className="font-semibold text-gray-900">Campaign Members ({members.length})</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {members.length === 0 ? (
                <div className="p-12 text-center">
                  <i className="ri-team-line text-6xl text-gray-300 mb-4"></i>
                  <p className="text-gray-600">No members yet</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600 font-semibold">
                            {member.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{member.user_name}</h4>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                            <span className="flex items-center">
                              <i className="ri-checkbox-circle-line mr-1 text-green-500"></i>
                              {member.tasks_completed} tasks
                            </span>
                            <span className="flex items-center">
                              <i className="ri-money-dollar-circle-line mr-1"></i>
                              {campaign.currency} {member.total_earned} earned
                            </span>
                            <span className="text-gray-500">
                              Joined {new Date(member.joined_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      {member.role === 'admin' && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                          Employer
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div>
            {isMember && campaign.group_chat_enabled ? (
              <GroupChatComponent
                campaignId={campaignId}
                isAdmin={false}
                currentUserId={user?.id || ''}
                members={members}
                onMemberUpdate={fetchCampaignData}
              />
            ) : !isMember ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <i className="ri-lock-line text-6xl text-gray-300 mb-4"></i>
                <p className="text-gray-600">Join the campaign to access the group chat</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
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

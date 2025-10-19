'use client';

import { useState, useEffect } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';

interface KYCSubmission {
  user_id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url: string;
  kyc_status: string;
  kyc_document_type: string;
  kyc_document_url: string;
  kyc_submitted_at: string;
}

export default function KYCVerification() {
  const { isDarkMode } = useDarkMode();
  const [submissions, setSubmissions] = useState<KYCSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<KYCSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/kyc');
      const data = await response.json();
      if (response.ok) {
        setSubmissions(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch KYC submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: number, status: 'verified' | 'rejected') => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/kyc', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          status,
          rejection_reason: status === 'rejected' ? rejectionReason : undefined,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message);
        setShowModal(false);
        setSelectedSubmission(null);
        setRejectionReason('');
        fetchSubmissions();
      } else {
        alert(result.error || 'Failed to update KYC status');
      }
    } catch (error) {
      console.error('KYC verification error:', error);
      alert('Failed to update KYC status');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (submission: KYCSubmission) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className={`rounded-2xl shadow-lg border p-8 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
      }`}>
        <div className="animate-pulse space-y-4">
          <div className={`h-6 rounded w-1/4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
          <div className={`h-4 rounded w-3/4 ${isDarkMode ? 'bg-slate-700' : 'bg-gray-200'}`}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-3xl shadow-2xl border p-8 backdrop-blur-sm ${
      isDarkMode 
        ? 'bg-gradient-to-br from-slate-800/90 to-slate-900/90 border-slate-700/50' 
        : 'bg-gradient-to-br from-white/90 to-gray-50/90 border-gray-200/50'
    }`}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            KYC Verification
          </h2>
          <p className={`mt-2 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Review and verify user KYC submissions
          </p>
        </div>
        <div className={`px-6 py-3 rounded-xl ${
          isDarkMode ? 'bg-slate-700' : 'bg-gray-100'
        }`}>
          <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {submissions.length}
          </span>
          <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            Pending
          </p>
        </div>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-12">
          <i className="ri-file-check-line text-6xl text-green-500 mb-4"></i>
          <p className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            All caught up!
          </p>
          <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
            No pending KYC submissions to review
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.user_id}
              className={`p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                isDarkMode 
                  ? 'bg-slate-700/30 border-slate-600 hover:border-indigo-500' 
                  : 'bg-white/50 border-gray-200 hover:border-indigo-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                    {submission.avatar_url ? (
                      <img src={submission.avatar_url} alt={submission.username} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white text-xl font-bold">
                        {submission.first_name?.charAt(0) || submission.username?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {submission.first_name} {submission.last_name}
                    </h3>
                    <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      @{submission.username} • {submission.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        submission.kyc_status === 'pending' 
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {submission.kyc_status.toUpperCase()}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        {submission.kyc_document_type.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        • {new Date(submission.kyc_submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openModal(submission)}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 cursor-pointer font-semibold"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl ${
            isDarkMode ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                KYC Document Review
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isDarkMode ? 'text-slate-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className="ri-close-line text-2xl"></i>
              </button>
            </div>

            <div className="space-y-6">
              {/* User Info */}
              <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  User Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Name</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSubmission.first_name} {selectedSubmission.last_name}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Email</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSubmission.email}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Document Type</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedSubmission.kyc_document_type.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>Submitted</p>
                    <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {new Date(selectedSubmission.kyc_submitted_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Document Preview */}
              <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <h4 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  Document
                </h4>
                <div className="border-2 border-dashed rounded-xl p-4 text-center">
                  {selectedSubmission.kyc_document_url.includes('application/pdf') ? (
                    <div>
                      <i className="ri-file-pdf-line text-6xl text-red-500 mb-2"></i>
                      <p className={`${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                        PDF Document
                      </p>
                      <a
                        href={selectedSubmission.kyc_document_url}
                        download
                        className="mt-2 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer"
                      >
                        Download PDF
                      </a>
                    </div>
                  ) : (
                    <img
                      src={selectedSubmission.kyc_document_url}
                      alt="KYC Document"
                      className="max-w-full max-h-96 mx-auto rounded-lg"
                    />
                  )}
                </div>
              </div>

              {/* Rejection Reason (if rejecting) */}
              <div className={`p-6 rounded-2xl ${isDarkMode ? 'bg-slate-700/50' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-semibold mb-2 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Rejection Reason (Optional if rejecting)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none ${
                    isDarkMode 
                      ? 'bg-slate-700/50 border-slate-600 text-white' 
                      : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder="Enter reason for rejection..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => handleVerify(selectedSubmission.user_id, 'rejected')}
                  disabled={processing}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-300 cursor-pointer font-semibold disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
                <button
                  onClick={() => handleVerify(selectedSubmission.user_id, 'verified')}
                  disabled={processing}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 cursor-pointer font-semibold disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

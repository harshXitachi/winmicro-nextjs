'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { formatCurrency, type Currency } from '@/lib/currency';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_banned: boolean;
  ban_reason: string | null;
  ban_expires_at: string | null;
  created_at: string;
  wallet_balance_inr: number;
  wallet_balance_usd: number;
  wallet_balance_usdt: number;
  default_currency: Currency;
}

export default function UsersSection() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState<'temporary' | 'permanent'>('temporary');
  const [banDuration, setBanDuration] = useState('24');
  const [processing, setProcessing] = useState(false);
  
  const usersRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
    const ctx = gsap.context(() => {
      gsap.fromTo(usersRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, usersRef);
    return () => ctx.revert();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'banned' && user.is_banned) ||
                         (statusFilter === 'active' && !user.is_banned);
    return matchesSearch && matchesStatus;
  });

  const handleBanUser = (user: User) => {
    setSelectedUser(user);
    setBanReason(user.ban_reason || '');
    setShowBanModal(true);
  };

  const handleBanSubmit = async () => {
    if (!selectedUser || !banReason.trim()) {
      alert('Please provide a ban reason');
      return;
    }

    setProcessing(true);
    try {
      const banExpiresAt = banType === 'temporary' 
        ? new Date(Date.now() + parseInt(banDuration) * 60 * 60 * 1000).toISOString()
        : null;

      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: 'ban',
          ban_reason: banReason,
          ban_expires_at: banExpiresAt,
        }),
      });

      if (response.ok) {
        await loadUsers();
        setShowBanModal(false);
        setBanReason('');
        alert('User banned successfully');
      }
    } catch (error) {
      console.error('Error banning user:', error);
      alert('Failed to ban user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setProcessing(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: 'unban',
        }),
      });

      if (response.ok) {
        await loadUsers();
        alert('User unbanned successfully');
      }
    } catch (error) {
      console.error('Error unbanning user:', error);
      alert('Failed to unban user');
    } finally {
      setProcessing(false);
    }
  };

  const getTotalEarnings = (user: User) => {
    return user.wallet_balance_inr + user.wallet_balance_usd + user.wallet_balance_usdt;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div ref={usersRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600">Manage platform users and their activities</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-line text-2xl text-blue-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{users.length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Total Users</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-check-line text-2xl text-green-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{users.filter(u => !u.is_banned).length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Active Users</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-forbid-line text-2xl text-red-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_banned).length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">Banned Users</h3>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <i className="ri-user-star-line text-2xl text-purple-600"></i>
            </div>
            <span className="text-2xl font-bold text-gray-900">{users.filter(u => new Date(u.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}</span>
          </div>
          <h3 className="font-semibold text-gray-900">New This Month</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Join Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Wallets</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {(user.first_name || user.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.first_name || user.last_name ? `${user.first_name} ${user.last_name}` : 'No Name'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      user.is_banned ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {user.is_banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col text-xs space-y-1">
                      <span>INR: {formatCurrency(user.wallet_balance_inr, 'INR')}</span>
                      <span>USD: {formatCurrency(user.wallet_balance_usd, 'USD')}</span>
                      <span>USDT: {formatCurrency(user.wallet_balance_usdt, 'USDT')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {user.is_banned ? (
                        <button
                          onClick={() => handleUnbanUser(user.id)}
                          disabled={processing}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Unban User"
                        >
                          <i className="ri-user-unfollow-line"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBanUser(user)}
                          disabled={processing}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Ban User"
                        >
                          <i className="ri-user-forbid-line"></i>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-user-line text-6xl text-gray-300 mb-4"></i>
            <h4 className="text-xl font-semibold text-gray-900 mb-2">No users found</h4>
            <p className="text-gray-600">No users match your current filters</p>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {showBanModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Ban User</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ban Type</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setBanType('temporary')}
                    className={`p-3 border-2 rounded-xl transition-colors ${
                      banType === 'temporary' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">Temporary</div>
                    <div className="text-xs text-gray-600">With expiration</div>
                  </button>
                  <button
                    onClick={() => setBanType('permanent')}
                    className={`p-3 border-2 rounded-xl transition-colors ${
                      banType === 'permanent' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="font-semibold">Permanent</div>
                    <div className="text-xs text-gray-600">No expiration</div>
                  </button>
                </div>
              </div>

              {banType === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours)</label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                    min="1"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Ban</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Enter the reason for banning this user..."
                />
              </div>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowBanModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleBanSubmit}
                disabled={processing || !banReason.trim()}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Ban User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

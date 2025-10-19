'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AdminWallet {
  currency: string;
  balance: string;
  total_commission_earned: string;
}

export default function AdminCommissionPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'USDT'>('INR');
  const [amount, setAmount] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [withdrawals, setWithdrawals] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (user) {
      fetchAdminData();
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    try {
      const [walletsRes, withdrawalsRes] = await Promise.all([
        fetch('/api/admin/wallet'),
        fetch('/api/admin/wallet/withdraw-commission'),
      ]);

      if (walletsRes.ok) {
        const data = await walletsRes.json();
        setWallets(data.wallets || []);
      }

      if (withdrawalsRes.ok) {
        const data = await withdrawalsRes.json();
        setWithdrawals(data.withdrawals || []);
      }
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !accountHolderName || !bankAccountNumber || !ifscCode) {
      alert('Please fill in all fields');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/admin/wallet/withdraw-commission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currency: selectedCurrency,
          amount: parseFloat(amount),
          bankAccountNumber,
          ifscCode,
          accountHolderName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to process withdrawal');
        return;
      }

      alert('Withdrawal request submitted successfully!');
      setAmount('');
      setAccountHolderName('');
      setBankAccountNumber('');
      setIfscCode('');
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert('Failed to process withdrawal');
    } finally {
      setIsProcessing(false);
    }
  };

  const currentWallet = wallets.find((w) => w.currency === selectedCurrency);
  const minimumWithdrawal = selectedCurrency === 'INR' ? 500 : 10;

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading commission details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Commission Management</h1>
          <p className="text-sm text-gray-600">Manage and withdraw your commission earnings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Commission Wallets */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {wallets.map((wallet) => (
            <div
              key={wallet.currency}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCurrency(wallet.currency as 'INR' | 'USD' | 'USDT')}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{wallet.currency} Commission</h3>
                {wallet.currency === 'INR' && <i className="ri-currency-rupee-circle-line text-2xl text-orange-500"></i>}
                {wallet.currency === 'USD' && <i className="ri-money-dollar-circle-line text-2xl text-green-500"></i>}
                {wallet.currency === 'USDT' && <i className="ri-bit-coin-line text-2xl text-blue-500"></i>}
              </div>
              <div className="mb-4">
                <p className="text-3xl font-bold text-gray-900">
                  {wallet.currency === 'INR' && '₹'}
                  {wallet.currency === 'USD' && '$'}
                  {wallet.currency === 'USDT' && '₿'}
                  {parseFloat(wallet.balance).toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Total Earned: {wallet.currency === 'INR' && '₹'}
                  {wallet.currency === 'USD' && '$'}
                  {wallet.currency === 'USDT' && '₿'}
                  {parseFloat(wallet.total_commission_earned).toFixed(2)}
                </p>
              </div>
              <button
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  selectedCurrency === wallet.currency
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedCurrency === wallet.currency ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>

        {/* Withdrawal Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Withdraw Commission</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <div className="flex gap-3">
                    {['INR', 'USD', 'USDT'].map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setSelectedCurrency(curr as 'INR' | 'USD' | 'USDT')}
                        className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                          selectedCurrency === curr
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Withdrawal Amount ({selectedCurrency})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      min={minimumWithdrawal}
                      step={selectedCurrency === 'INR' ? '1' : '0.01'}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Available: {selectedCurrency === 'INR' && '₹'}
                    {selectedCurrency === 'USD' && '$'}
                    {selectedCurrency === 'USDT' && '₿'}
                    {currentWallet ? parseFloat(currentWallet.balance).toFixed(2) : '0.00'} | Minimum: {minimumWithdrawal}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                  <input
                    type="text"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                  <input
                    type="text"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="Account number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                  <input
                    type="text"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="IFSC code"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                >
                  {isProcessing ? 'Processing...' : 'Submit Withdrawal Request'}
                </button>
              </form>
            </div>

            {/* Info */}
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Withdrawal Details</h4>
                <ul className="text-sm text-blue-800 space-y-2">
                  <li>✓ Withdrawals are processed within 2-3 business days</li>
                  <li>✓ Bank account must be in your name</li>
                  <li>✓ IFSC code is required for bank transfers</li>
                  <li>✓ Commission is earned on all platform transactions</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
                <ul className="text-sm text-yellow-800 space-y-2">
                  <li>• Verify all details before submitting</li>
                  <li>• Minimum withdrawal amount varies by currency</li>
                  <li>• Bank charges (if any) apply</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal History */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Withdrawal History</h2>

          {withdrawals.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No withdrawals yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Currency</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Transaction ID</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawals.map((withdrawal: any) => (
                    <tr key={withdrawal.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(withdrawal.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{withdrawal.currency}</td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {withdrawal.currency === 'INR' && '₹'}
                        {withdrawal.currency === 'USD' && '$'}
                        {withdrawal.currency === 'USDT' && '₿'}
                        {parseFloat(withdrawal.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            withdrawal.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : withdrawal.status === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500 font-mono">
                        {withdrawal.reference_id.slice(-8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

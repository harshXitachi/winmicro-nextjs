'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';

interface WalletBalance {
  inr: string;
  usd: string;
  usdt: string;
  defaultCurrency: string;
}

interface Transaction {
  id: string;
  amount: string;
  currency: string;
  type: string;
  status: string;
  description: string;
  created_at: string;
}

interface CommissionSettings {
  commission_percentage: string;
  commission_on_deposits: boolean;
  commission_on_transfers: boolean;
  inr_wallet_enabled: boolean;
  usd_wallet_enabled: boolean;
  usdt_wallet_enabled: boolean;
  min_deposit_inr: string;
  max_deposit_inr: string;
  min_deposit_usd: string;
  max_deposit_usd: string;
}

export default function WalletPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const { user: firebaseUser } = useFirebaseAuth();
  const [balance, setBalance] = useState<WalletBalance>({
    inr: '0.00',
    usd: '0.00',
    usdt: '0.00',
    defaultCurrency: 'INR',
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [commissionSettings, setCommissionSettings] = useState<CommissionSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'deposit' | 'withdraw' | 'history'>('overview');
  const [depositCurrency, setDepositCurrency] = useState<'INR' | 'USD'>('INR');
  const [depositAmount, setDepositAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
    } else if (profile) {
      setBalance({
        inr: profile.wallet_balance_inr || '0.00',
        usd: profile.wallet_balance_usd || '0.00',
        usdt: profile.wallet_balance_usdt || '0.00',
        defaultCurrency: profile.default_currency || 'INR',
      });
      fetchTransactions();
      fetchCommissionSettings();
    }
  }, [user, profile, loading, router]);

  const fetchCommissionSettings = async () => {
    try {
      const res = await fetch('/api/settings/commission');
      if (res.ok) {
        const data = await res.json();
        setCommissionSettings(data.settings);
      }
    } catch (error) {
      console.error('Failed to fetch commission settings:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await fetch('/api/wallet/transactions');
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const handleDepositINR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || !phoneNumber) {
      alert('Please fill in all fields');
      return;
    }

    if (!firebaseUser) {
      alert('Please log in to continue');
      return;
    }

    setIsProcessing(true);
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      const res = await fetch('/api/wallet/deposit-inr', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
          phoneNumber: phoneNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to initiate deposit');
        return;
      }

      // Redirect to PhonePay payment page
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to initiate deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDepositUSD = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount) {
      alert('Please enter amount');
      return;
    }

    if (!firebaseUser) {
      alert('Please log in to continue');
      return;
    }

    setIsProcessing(true);
    try {
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      const res = await fetch('/api/wallet/deposit-usd', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          amount: parseFloat(depositAmount),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Failed to initiate deposit');
        return;
      }

      // Redirect to PayPal approval URL
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      }
    } catch (error) {
      console.error('Deposit error:', error);
      alert('Failed to initiate deposit');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-600">Manage your funds and transactions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Cards */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">INR Balance</h3>
              <i className="ri-currency-rupee-circle-line text-2xl text-orange-500"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{parseFloat(balance.inr).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">USD Balance</h3>
              <i className="ri-money-dollar-circle-line text-2xl text-green-500"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">${parseFloat(balance.usd).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">USDT Balance</h3>
              <i className="ri-bit-coin-line text-2xl text-blue-500"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">₿{parseFloat(balance.usdt).toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Default</h3>
              <i className="ri-settings-line text-2xl text-gray-400"></i>
            </div>
            <p className="text-3xl font-bold text-gray-900">{balance.defaultCurrency}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex border-b border-gray-100">
            {['overview', 'deposit', 'withdraw', 'history'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 px-4 font-medium text-center transition-colors capitalize ${
                  activeTab === tab
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('deposit')}
                    className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                  >
                    <i className="ri-download-cloud-line text-2xl text-purple-600 mb-2"></i>
                    <h4 className="font-semibold text-gray-900">Add Funds</h4>
                    <p className="text-sm text-gray-600">Deposit money to your wallet</p>
                  </button>
                  <button
                    onClick={() => setActiveTab('withdraw')}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                  >
                    <i className="ri-upload-cloud-line text-2xl text-blue-600 mb-2"></i>
                    <h4 className="font-semibold text-gray-900">Withdraw Funds</h4>
                    <p className="text-sm text-gray-600">Transfer money to your bank</p>
                  </button>
                </div>
              </div>
            )}

            {/* Deposit Tab */}
            {activeTab === 'deposit' && (
              <div className="max-w-2xl">
                {/* Wallet Maintenance Warning */}
                {commissionSettings && depositCurrency === 'INR' && !commissionSettings.inr_wallet_enabled && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-alert-line text-yellow-600 text-xl mr-3"></i>
                      <div>
                        <h4 className="font-semibold text-yellow-900">INR Wallet Maintenance</h4>
                        <p className="text-sm text-yellow-800">The INR wallet is currently under maintenance. Please try again later or use USD wallet.</p>
                      </div>
                    </div>
                  </div>
                )}
                {commissionSettings && depositCurrency === 'USD' && !commissionSettings.usd_wallet_enabled && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center">
                      <i className="ri-alert-line text-yellow-600 text-xl mr-3"></i>
                      <div>
                        <h4 className="font-semibold text-yellow-900">USD Wallet Maintenance</h4>
                        <p className="text-sm text-yellow-800">The USD wallet is currently under maintenance. Please try again later or use INR wallet.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Currency</label>
                  <div className="flex gap-3">
                    {['INR', 'USD'].map((curr) => {
                      const isDisabled = commissionSettings && 
                        ((curr === 'INR' && !commissionSettings.inr_wallet_enabled) ||
                        (curr === 'USD' && !commissionSettings.usd_wallet_enabled));
                      return (
                        <button
                          key={curr}
                          onClick={() => {
                            if (!isDisabled) {
                              setDepositCurrency(curr as 'INR' | 'USD');
                              setDepositAmount('');
                            }
                          }}
                          disabled={!!isDisabled}
                          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                            depositCurrency === curr
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {curr} {isDisabled && '(Maintenance)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {depositCurrency === 'INR' ? (
                  <form onSubmit={handleDepositINR} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="1"
                        step="1"
                        disabled={!!(commissionSettings && !commissionSettings.inr_wallet_enabled)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum: ₹{commissionSettings?.min_deposit_inr || '100'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="10-digit mobile number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={!!(commissionSettings && !commissionSettings.inr_wallet_enabled)}
                      />
                    </div>

                    {/* Commission Info */}
                    {commissionSettings && commissionSettings.commission_on_deposits && depositAmount && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Commission Details:</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Deposit Amount:</span>
                            <span className="font-semibold">₹{parseFloat(depositAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-orange-600">
                            <span>Commission ({commissionSettings.commission_percentage}%):</span>
                            <span className="font-semibold">+₹{(parseFloat(depositAmount) * parseFloat(commissionSettings.commission_percentage) / 100).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-orange-200 pt-1 mt-1 flex justify-between font-semibold">
                            <span>You Pay:</span>
                            <span className="text-orange-700">₹{(parseFloat(depositAmount) * (1 + parseFloat(commissionSettings.commission_percentage) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing || !!(commissionSettings && !commissionSettings.inr_wallet_enabled)}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {isProcessing ? 'Processing...' : 'Proceed to PhonePay'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleDepositUSD} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                      <input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min="0.01"
                        step="0.01"
                        disabled={!!(commissionSettings && !commissionSettings.usd_wallet_enabled)}
                      />
                      <p className="text-xs text-gray-500 mt-1">Minimum: ${commissionSettings?.min_deposit_usd || '2'}</p>
                    </div>

                    {/* Commission Info */}
                    {commissionSettings && commissionSettings.commission_on_deposits && depositAmount && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Commission Details:</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span>Deposit Amount:</span>
                            <span className="font-semibold">${parseFloat(depositAmount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-orange-600">
                            <span>Commission ({commissionSettings.commission_percentage}%):</span>
                            <span className="font-semibold">+${(parseFloat(depositAmount) * parseFloat(commissionSettings.commission_percentage) / 100).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-orange-200 pt-1 mt-1 flex justify-between font-semibold">
                            <span>You Pay:</span>
                            <span className="text-orange-700">${(parseFloat(depositAmount) * (1 + parseFloat(commissionSettings.commission_percentage) / 100)).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessing || !!(commissionSettings && !commissionSettings.usd_wallet_enabled)}
                      className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
                    >
                      {isProcessing ? 'Processing...' : 'Proceed to PayPal'}
                    </button>
                  </form>
                )}

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Payment Methods</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>💳 <strong>INR:</strong> PhonePay (Credit/Debit Card, UPI, Wallet)</li>
                    <li>💳 <strong>USD:</strong> PayPal (All payment methods)</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Withdraw Tab */}
            {activeTab === 'withdraw' && (
              <div className="max-w-2xl">
                <p className="text-sm text-gray-600 mb-4">Withdrawal requests are processed within 2-3 business days</p>

                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>INR</option>
                      <option>USD</option>
                      <option>USDT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="Enter amount"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Full name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="Account number"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="IFSC code"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Request Withdrawal
                  </button>
                </form>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Recent Transactions</h3>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No transactions yet</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((txn) => (
                      <div key={txn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            txn.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <i className={`text-lg ${txn.type === 'credit' ? 'ri-download-cloud-line text-green-600' : 'ri-upload-cloud-line text-red-600'}`}></i>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{txn.description}</p>
                            <p className="text-xs text-gray-500">{new Date(txn.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                            {txn.type === 'credit' ? '+' : '-'}{txn.currency} {txn.amount}
                          </p>
                          <p className="text-xs text-gray-500">{txn.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

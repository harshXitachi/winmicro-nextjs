
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { formatCurrency, type Currency } from '@/lib/currency';

interface AdminSettings {
  id: string;
  commission_percentage: number;
  wallet_enabled: boolean;
  min_deposit_amount: number;
  max_deposit_amount: number;
  min_withdrawal_amount: number;
  max_withdrawal_amount: number;
  phonepe_enabled: boolean;
  admin_wallet_balance: number;
  total_commission_earned: number;
}

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  commission_amount: number;
  created_at: string;
}

// Admin functions - stub for now
const getAdminSettings = async () => {
  return { data: null, error: null };
};

const updateAdminSettings = async (settings: any) => {
  return { data: settings, error: null };
};

const getPaymentTransactions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Get payment transactions error:', error);
    return { data: null, error };
  }
};

export default function WalletSection() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>('INR');
  const [walletBalances, setWalletBalances] = useState<Record<Currency, number>>({INR: 0, USD: 0, USDT: 0});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsResult, transactionsResult] = await Promise.all([
        getAdminSettings(),
        getPaymentTransactions('all') // Get all transactions for admin
      ]);

      setSettings(settingsResult.data);
      setTransactions(transactionsResult.data || []);
      
      // Fetch admin wallet balances for each currency
      const { data: adminWallets } = await supabase
        .from('admin_wallets')
        .select('currency, balance');
      
      if (adminWallets) {
        const balances: Record<Currency, number> = { INR: 0, USD: 0, USDT: 0 };
        adminWallets.forEach((wallet: any) => {
          balances[wallet.currency as Currency] = parseFloat(wallet.balance || '0');
        });
        setWalletBalances(balances);
      }
    } catch (error) {
      console.error('Error loading admin wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async (field: string, value: any) => {
    if (!settings) return;

    setSaving(true);
    try {
      const updatedSettings = { ...settings, [field]: value };
      const { data, error } = await updateAdminSettings(updatedSettings);
      
      if (error) throw error;
      
      setSettings(data);
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCommissionWithdraw = async () => {
    if (!settings || !withdrawAmount) return;

    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > settings.admin_wallet_balance) {
      alert('Invalid withdrawal amount');
      return;
    }

    setWithdrawing(true);
    try {
      const updatedSettings = {
        ...settings,
        admin_wallet_balance: settings.admin_wallet_balance - amount
      };

      const { error } = await updateAdminSettings(updatedSettings);
      
      if (error) throw error;
      
      setSettings(updatedSettings);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      alert(`Successfully withdrew ₹${amount.toFixed(2)} from commission wallet`);
    } catch (error) {
      console.error('Error withdrawing commission:', error);
      alert('Failed to withdraw commission');
    } finally {
      setWithdrawing(false);
    }
  };

  const getRecentCommissions = () => {
    return transactions
      .filter(t => t.commission_amount > 0 && t.status === 'success')
      .slice(0, 10);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading wallet data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Multi-Currency Admin Wallets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['INR', 'USD', 'USDT'] as Currency[]).map((currency) => (
          <div key={currency} className={`rounded-2xl p-6 text-white transition-transform hover:scale-105 ${
            currency === 'INR' ? 'bg-gradient-to-br from-orange-500 to-orange-600' :
            currency === 'USD' ? 'bg-gradient-to-br from-green-500 to-green-600' :
            'bg-gradient-to-br from-blue-500 to-blue-600'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="text-2xl">
                {currency === 'INR' ? '🇮🇳' : currency === 'USD' ? '🇺🇸' : '🔷'}
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="ri-wallet-line text-xl"></i>
              </div>
            </div>
            <h3 className="text-sm font-medium opacity-90 mb-1">{currency} Commission Wallet</h3>
            <p className="text-3xl font-bold mb-2">{formatCurrency(walletBalances[currency], currency)}</p>
            <button
              onClick={() => {
                setSelectedCurrency(currency);
                setShowWithdrawModal(true);
              }}
              disabled={walletBalances[currency] <= 0}
              className="w-full mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm py-2 px-4 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-bank-line mr-1"></i>
              Withdraw {currency}
            </button>
          </div>
        ))}
      </div>


      {/* Recent Commission Transactions */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Commission Earnings</h3>
        </div>
        
        <div className="p-6">
          {getRecentCommissions().length === 0 ? (
            <div className="text-center py-8">
              <i className="ri-coins-line text-4xl text-gray-300 mb-4"></i>
              <p className="text-gray-500">No commission earnings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getRecentCommissions().map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <i className="ri-coins-line text-green-600"></i>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Commission from {transaction.type}
                      </p>
                      <p className="text-sm text-gray-500">
                        User: {transaction.user_id.slice(0, 8)}... | 
                        Amount: ₹{transaction.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +₹{transaction.commission_amount.toFixed(2)}
                    </p>
                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600">
                      Commission
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commission Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Withdraw Commission</h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                  min="1"
                  max={settings?.admin_wallet_balance || 0}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ₹{(settings?.admin_wallet_balance || 0).toFixed(2)}
                </p>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-xl">
                <div className="flex items-center mb-2">
                  <i className="ri-information-line text-yellow-600 mr-2"></i>
                  <span className="font-medium text-yellow-900">Admin Withdrawal</span>
                </div>
                <p className="text-sm text-yellow-700">
                  This will withdraw commission earnings from the admin wallet to your account.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCommissionWithdraw}
                disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > (settings?.admin_wallet_balance || 0)}
                className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap cursor-pointer"
              >
                {withdrawing ? 'Processing...' : 'Withdraw'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useDarkMode } from '@/context/DarkModeContext';
import { formatCurrency, convertCurrency, getCurrencySymbol, getPaymentGateway, type Currency } from '@/lib/currency';

interface Transaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
  created_at: string;
  currency: Currency;
  commission_amount: number;
}

export default function WalletSection() {
  const { user, profile, refreshProfile } = useAuth();
  const { isDarkMode } = useDarkMode();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showCurrencySelector, setShowCurrencySelector] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('INR');
  const [defaultCurrency, setDefaultCurrency] = useState<Currency>('INR');
  const [processing, setProcessing] = useState(false);
  const [commissionRate, setCommissionRate] = useState(2);

  useEffect(() => {
    if (user && profile) {
      setDefaultCurrency((profile.default_currency as Currency) || 'INR');
      setCurrency((profile.default_currency as Currency) || 'INR');
      loadTransactions();
      fetchCommissionSettings();
    }
  }, [user, profile]);

  const fetchCommissionSettings = async () => {
    try {
      const response = await fetch('/api/admin/wallet');
      if (response.ok) {
        const data = await response.json();
        if (data.settings?.commission_percentage) {
          setCommissionRate(parseFloat(data.settings.commission_percentage));
        }
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/payments');
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDefaultCurrencyChange = async (newCurrency: Currency) => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/profile/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ default_currency: newCurrency }),
      });

      if (response.ok) {
        setDefaultCurrency(newCurrency);
        setCurrency(newCurrency);
        await refreshProfile();
        setShowCurrencySelector(false);
      }
    } catch (error) {
      console.error('Error updating default currency:', error);
      alert('Failed to update default currency');
    }
  };

  const getWalletBalance = (curr: Currency): number => {
    if (!profile) return 0;
    const field = `wallet_balance_${curr.toLowerCase()}`;
    return parseFloat((profile as any)[field] || '0');
  };

  const processPayment = async (amount: number, curr: Currency) => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          transactionId: `TXN-${curr}-${Date.now()}`,
          message: `Payment successful via ${getPaymentGateway(curr)}`
        });
      }, 2000);
    });
  };

  const handleDeposit = async () => {
    if (!user || !amount || processing) return;
    
    setProcessing(true);
    try {
      const depositAmount = parseFloat(amount);
      
      // Process payment
      const paymentResult: any = await processPayment(depositAmount, currency);
      
      if (paymentResult.success) {
        // Update wallet balance via API
        const response = await fetch('/api/wallet/balance', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            amount: depositAmount,
            type: 'credit',
            currency,
            transactionType: 'deposit',
            applyCommission: true,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          await refreshProfile();
          await loadTransactions();
          setShowDepositModal(false);
          setAmount('');
          alert(`Deposit successful! ${formatCurrency(result.newBalance, currency)} added to your ${currency} wallet.`);
        } else {
          alert('Failed to update wallet balance');
        }
      } else {
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      alert('Failed to process deposit. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user || !amount || processing) return;
    
    const withdrawAmount = parseFloat(amount);
    const currentBalance = getWalletBalance(currency);
    
    if (withdrawAmount > currentBalance) {
      alert(`Insufficient ${currency} balance for withdrawal.`);
      return;
    }
    
    setProcessing(true);
    try {
      const response = await fetch('/api/wallet/balance', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          amount: withdrawAmount,
          type: 'debit',
          currency,
          transactionType: 'withdrawal',
          applyCommission: false,
        }),
      });

      if (response.ok) {
        await refreshProfile();
        await loadTransactions();
        setShowWithdrawModal(false);
        setAmount('');
        alert('Withdrawal request submitted successfully!');
      } else {
        alert('Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Failed to process withdrawal. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredTransactions = transactions.filter(t => t.currency === currency);

  return (
    <div className="p-8 space-y-8">
      {/* Multi-Currency Wallet Overview */}
      <div className={`rounded-3xl p-8 shadow-xl border ${
        isDarkMode 
          ? 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700' 
          : 'bg-gradient-to-br from-slate-800 to-slate-900 border-gray-200'
      }`}>
        <div className="text-center text-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Multi-Currency Wallet</h2>
            <button
              onClick={() => setShowCurrencySelector(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
            >
              Default: {defaultCurrency} {getCurrencySymbol(defaultCurrency)}
            </button>
          </div>
          
          {/* Currency Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 rounded-2xl p-2 flex space-x-2">
              <button
                onClick={() => setCurrency('INR')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currency === 'INR'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🇮🇳 INR
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currency === 'USD'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                onClick={() => setCurrency('USDT')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currency === 'USDT'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🔷 USDT
              </button>
            </div>
          </div>
          
          <div className="text-6xl font-bold mb-4">
            {formatCurrency(getWalletBalance(currency), currency)}
          </div>
          
          <p className="text-white/70 mb-6">
            {currency === defaultCurrency ? 'Default Currency' : `Convert to ${defaultCurrency}: ${formatCurrency(convertCurrency(getWalletBalance(currency), currency, defaultCurrency), defaultCurrency)}`}
          </p>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setShowDepositModal(true)}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors shadow-lg flex items-center space-x-2"
            >
              <i className="ri-add-line"></i>
              <span>Deposit {currency}</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-8 py-3 bg-white text-slate-800 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg flex items-center space-x-2"
            >
              <i className="ri-subtract-line"></i>
              <span>Withdraw {currency}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['INR', 'USD', 'USDT'] as Currency[]).map((curr) => (
          <div key={curr} className={`rounded-2xl p-6 shadow-lg border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                  {curr} Wallet {curr === defaultCurrency && '⭐'}
                </p>
                <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatCurrency(getWalletBalance(curr), curr)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                curr === 'INR' ? 'bg-orange-100' :
                curr === 'USD' ? 'bg-green-100' : 'bg-blue-100'
              }`}>
                {curr === 'INR' ? '₹' : curr === 'USD' ? '$' : '₮'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transaction History */}
      <div className={`rounded-2xl p-6 shadow-lg border ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {currency} Transaction History
        </h3>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>Loading transactions...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-8">
            <i className={`ri-wallet-line text-6xl mb-4 ${isDarkMode ? 'text-slate-600' : 'text-gray-300'}`}></i>
            <h4 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              No {currency} transactions yet
            </h4>
            <p className={isDarkMode ? 'text-slate-400' : 'text-gray-600'}>
              Your {currency} transaction history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className={`flex items-center justify-between p-4 rounded-xl border ${
                isDarkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-100 hover:bg-gray-50'
              } transition-colors`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    <i className={`text-xl ${transaction.type === 'credit' ? 'ri-arrow-down-line' : 'ri-arrow-up-line'}`}></i>
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {transaction.type === 'credit' ? 'Money Received' : 'Money Sent'}
                    </h4>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                      {transaction.description}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  {transaction.commission_amount > 0 && (
                    <p className="text-xs text-orange-600">
                      Commission: {formatCurrency(transaction.commission_amount, transaction.currency)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Default Currency Selector Modal */}
      {showCurrencySelector && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <h3 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Set Default Currency
            </h3>
            <div className="space-y-3">
              {(['INR', 'USD', 'USDT'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleDefaultCurrencyChange(curr)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    defaultCurrency === curr
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-slate-600 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">
                        {curr === 'INR' ? '🇮🇳' : curr === 'USD' ? '🇺🇸' : '🔷'}
                      </span>
                      <div className="text-left">
                        <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                          {curr}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getPaymentGateway(curr)}
                        </p>
                      </div>
                    </div>
                    {defaultCurrency === curr && (
                      <i className="ri-check-line text-2xl text-indigo-600"></i>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCurrencySelector(false)}
              className="mt-6 w-full py-3 border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Deposit {currency}
              </h3>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-4 py-4 border rounded-xl text-lg ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder={`Enter amount in ${currency}`}
                  min="0"
                />
              </div>
              
              {amount && (
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span>{formatCurrency(parseFloat(amount || '0'), currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Commission ({commissionRate}%):</span>
                      <span className="text-red-600">
                        -{formatCurrency(parseFloat(amount || '0') * (commissionRate / 100), currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Gateway:</span>
                      <span className="font-semibold">{getPaymentGateway(currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>You'll receive:</span>
                      <span className="text-green-600">
                        {formatCurrency(parseFloat(amount || '0') * (1 - commissionRate / 100), currency)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 py-4 px-6 border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={!amount || processing}
                className="flex-1 py-4 px-6 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Deposit ${currency}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`rounded-3xl p-8 w-full max-w-md shadow-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Withdraw {currency}
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-semibold mb-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                  Amount ({currency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full px-4 py-4 border rounded-xl text-lg ${
                    isDarkMode ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-200 text-gray-900'
                  }`}
                  placeholder={`Enter amount in ${currency}`}
                  max={getWalletBalance(currency)}
                />
              </div>
              
              <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-gray-50'}`}>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Available balance:</span>
                    <span>{formatCurrency(getWalletBalance(currency), currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Withdrawal method:</span>
                    <span className="font-semibold">{getPaymentGateway(currency)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 py-4 px-6 border rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdraw}
                disabled={!amount || processing || parseFloat(amount || '0') > getWalletBalance(currency)}
                className="flex-1 py-4 px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50"
              >
                {processing ? 'Processing...' : `Withdraw ${currency}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

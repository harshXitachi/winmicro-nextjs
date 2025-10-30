'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';
import { makeAuthenticatedRequest } from '@/lib/api-client-auth';
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
  const { user: firebaseUser } = useFirebaseAuth();
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
  const [commissionOnDeposits, setCommissionOnDeposits] = useState(true);
  const [commissionOnTransfers, setCommissionOnTransfers] = useState(true);
  const [walletSettings, setWalletSettings] = useState({
    inr_wallet_enabled: true,
    usd_wallet_enabled: true,
    usdt_wallet_enabled: true,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  useEffect(() => {
    if (user && profile && !isInitialized) {
      const profileDefaultCurrency = (profile.default_currency as Currency) || 'INR';
      setDefaultCurrency(profileDefaultCurrency);
      
      // Only set currency on initial load, not on every profile update
      setCurrency(prevCurrency => prevCurrency || profileDefaultCurrency);
      
      fetchCommissionSettings();
      
      // Load transactions only when firebaseUser is available
      if (firebaseUser) {
        loadTransactions();
      }
      
      setIsInitialized(true);
    }
  }, [user, profile, firebaseUser, isInitialized]);

  // Refresh settings every 30 seconds to catch admin changes (reduced frequency)
  useEffect(() => {
    if (!user || !profile) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Refreshing wallet settings...');
      fetchCommissionSettings();
    }, 30000); // Increased from 5 seconds to 30 seconds
    
    return () => clearInterval(interval);
  }, [user, profile]);

  // Also refresh settings when component becomes visible (user switches to wallet tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user && profile) {
        console.log('👁️ Page became visible, refreshing settings...');
        fetchCommissionSettings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, profile]);

  const fetchCommissionSettings = async () => {
    if (isLoadingSettings) return; // Prevent multiple simultaneous calls
    
    setIsLoadingSettings(true);
    try {
      // Use simple fetch since this endpoint is now public
      const response = await fetch('/api/admin/wallet', {
        method: 'GET',
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Wallet settings fetched:', data.settings);
        console.log('📊 Full API response:', data);
        
        if (data.settings) {
          // Update commission settings
          if (data.settings.commission_percentage) {
            setCommissionRate(parseFloat(data.settings.commission_percentage));
          }
          
          setCommissionOnDeposits(data.settings.commission_on_deposits ?? true);
          setCommissionOnTransfers(data.settings.commission_on_transfers ?? true);
          
          // Update wallet settings with proper boolean handling
          const newWalletSettings = {
            inr_wallet_enabled: Boolean(data.settings.inr_wallet_enabled),
            usd_wallet_enabled: Boolean(data.settings.usd_wallet_enabled),
            usdt_wallet_enabled: Boolean(data.settings.usdt_wallet_enabled),
          };
          
          setWalletSettings(newWalletSettings);
          console.log('✅ Updated wallet settings:', newWalletSettings);
          console.log('✅ INR Wallet enabled:', newWalletSettings.inr_wallet_enabled);
          console.log('✅ USD Wallet enabled:', newWalletSettings.usd_wallet_enabled);
          console.log('✅ USDT Wallet enabled:', newWalletSettings.usdt_wallet_enabled);
        } else {
          console.warn('⚠️ No settings found in API response');
        }
      } else {
        console.error('❌ Failed to fetch wallet settings:', response.status);
        // Set default values to prevent undefined states
        setWalletSettings({
          inr_wallet_enabled: true,
          usd_wallet_enabled: true,
          usdt_wallet_enabled: true,
        });
      }
    } catch (error) {
      console.error('Error fetching commission settings:', error);
      // Set default values to prevent undefined states
      setWalletSettings({
        inr_wallet_enabled: true,
        usd_wallet_enabled: true,
        usdt_wallet_enabled: true,
      });
    } finally {
      setIsLoadingSettings(false);
    }
  };

  const loadTransactions = async () => {
    if (!user || !firebaseUser) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await makeAuthenticatedRequest(firebaseUser, '/api/payments');
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      } else {
        console.error('Failed to load transactions:', response.status);
        // Set empty array to prevent infinite loading
        setTransactions([]);
      }
    } catch (error: any) {
      console.error('Error loading transactions:', error);
      // Set empty array to prevent infinite loading
      setTransactions([]);
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

  const handleDeposit = async () => {
    if (!user || !amount || processing) return;
    
    // Check if wallet is enabled
    const isWalletEnabled = currency === 'INR' ? walletSettings.inr_wallet_enabled : 
                           currency === 'USD' ? walletSettings.usd_wallet_enabled : 
                           walletSettings.usdt_wallet_enabled;
    
    if (!isWalletEnabled) {
      alert(`${currency} wallet is currently in maintenance mode. Please try again later.`);
      return;
    }
    
    setProcessing(true);
    try {
      const depositAmount = parseFloat(amount);
      
      if (currency === 'INR') {
        if (!firebaseUser) {
          alert('Please log in to continue');
          setProcessing(false);
          return;
        }
        
        const response = await makeAuthenticatedRequest(firebaseUser, '/api/wallet/deposit-inr', {
          method: 'POST',
          body: JSON.stringify({
            amount: depositAmount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Deposit initiation failed:', data);
          alert(data.error || 'Failed to initiate deposit. Please try again.');
          return;
        }

        // Initialize Razorpay payment
        if (data.orderId && data.keyId) {
          const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: 'WinMicro',
            description: `Wallet Deposit - ₹${depositAmount}`,
            order_id: data.orderId,
            handler: async function (response: any) {
              console.log('✅ Razorpay payment successful:', response);
              
              // Call our callback to verify and process payment
              try {
                const callbackRes = await fetch('/api/wallet/razorpay-callback', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                  }),
                });

                const callbackData = await callbackRes.json();
                
                if (callbackRes.ok) {
                  alert('Payment successful! Your wallet has been credited.');
                  await refreshProfile(); // Refresh profile to show updated balance
                  setShowDepositModal(false);
                  setAmount('');
                } else {
                  alert('Payment verification failed. Please contact support.');
                }
              } catch (error) {
                console.error('Payment verification error:', error);
                alert('Payment verification failed. Please contact support.');
              }
            },
            prefill: {
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
            },
            theme: {
              color: '#3B82F6',
            },
          };

          const razorpay = new (window as any).Razorpay(options);
          razorpay.open();
        } else {
          alert('Failed to initialize payment. Please try again.');
        }
      } else if (currency === 'USD') {
        // For USD, use PayPal
        if (!firebaseUser) {
          alert('Please log in to continue');
          setProcessing(false);
          return;
        }
        
        const response = await makeAuthenticatedRequest(firebaseUser, '/api/wallet/deposit-usd', {
          method: 'POST',
          body: JSON.stringify({
            amount: depositAmount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('USD deposit initiation failed:', data);
          alert(data.error || 'Failed to initiate deposit. Please try again.');
          return;
        }

        // Store transaction ID for callback processing
        if (data.transactionId) {
          localStorage.setItem('pending_transaction_id', data.transactionId);
        }

        // Redirect to PayPal approval URL
        if (data.approvalUrl) {
          window.location.href = data.approvalUrl;
        } else {
          alert('Failed to initialize PayPal payment. Please try again.');
        }
      } else if (currency === 'USDT') {
        // For USDT, use CoinPayments
        if (!firebaseUser) {
          alert('Please log in to continue');
          setProcessing(false);
          return;
        }
        
        const response = await makeAuthenticatedRequest(firebaseUser, '/api/wallet/deposit-usdt', {
          method: 'POST',
          body: JSON.stringify({
            amount: depositAmount,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('USDT deposit initiation failed:', data);
          alert(data.error || 'Failed to initiate deposit. Please try again.');
          return;
        }

        // Show crypto payment modal with address and QR code
        if (data.transaction) {
          // Close deposit modal
          setShowDepositModal(false);
          
          // Create and show crypto payment modal
          const modal = document.createElement('div');
          modal.id = 'crypto-payment-modal';
          modal.innerHTML = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 1rem;">
              <div style="background: white; padding: 2rem; border-radius: 1.5rem; max-width: 500px; width: 100%; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                <div style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);">
                  <svg style="width: 32px; height: 32px; color: white;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 style="font-size: 1.75rem; font-weight: bold; margin-bottom: 0.5rem; color: #1f2937;">Send USDT (TRC20)</h2>
                <p style="margin-bottom: 1rem; color: #6b7280; font-size: 0.95rem;">Send exactly <strong style="color: #8b5cf6; font-size: 1.1rem;">${data.transaction.amount} USDT</strong> to:</p>
                <div style="background: #eff6ff; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border: 1px solid #bfdbfe;">
                  <p style="font-size: 0.8rem; color: #1e40af; margin: 0; line-height: 1.6;">
                    <strong>Amount Breakdown:</strong><br/>
                    Deposit Amount: <strong>${data.depositAmount} USDT</strong><br/>
                    Platform Fee (${data.commissionRate}%): <strong>${data.commissionAmount} USDT</strong><br/>
                    CoinPayments Network Fee: <strong>${(parseFloat(data.transaction.amount) - parseFloat(data.totalAmount)).toFixed(2)} USDT</strong><br/>
                    <span style="color: #8b5cf6; font-size: 0.9rem; margin-top: 0.5rem; display: inline-block;">___________________</span><br/>
                    <strong style="color: #8b5cf6; font-size: 0.9rem;">Total to Send: ${data.transaction.amount} USDT</strong>
                  </p>
                </div>
                <div style="background: linear-gradient(to right, #f9fafb, #f3f4f6); padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; border: 2px solid #e5e7eb;">
                  <code style="font-size: 0.875rem; color: #1f2937; word-break: break-all; font-weight: 500;">${data.transaction.address}</code>
                </div>
                <div style="background: white; padding: 1rem; border-radius: 0.75rem; border: 3px solid #8b5cf6; margin-bottom: 1.5rem; display: inline-block;">
                  <img src="${data.transaction.qrcode_url}" alt="QR Code" style="width: 220px; height: 220px; display: block;" />
                </div>
                <div style="background: #fef3c7; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1rem; border: 1px solid #fbbf24;">
                  <p style="font-size: 0.9rem; color: #92400e; margin: 0; font-weight: 600;">
                    Expires in ${Math.floor(data.transaction.timeout / 60)} minutes
                  </p>
                </div>
                <p style="font-size: 0.875rem; color: #6b7280; margin-bottom: 1.5rem;">
                  Your balance will be credited after <strong>${data.transaction.confirms_needed} network confirmations</strong>
                </p>
                <a href="${data.transaction.status_url}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; font-weight: 600; margin-bottom: 1rem; transition: background 0.2s; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
                  Check Status on CoinPayments
                </a>
                <button onclick="document.getElementById('crypto-payment-modal').remove()" style="display: block; width: 100%; background: #8b5cf6; color: white; padding: 0.875rem; border-radius: 0.75rem; border: none; cursor: pointer; font-weight: 600; font-size: 1rem; transition: background 0.2s; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);" onmouseover="this.style.background='#7c3aed'" onmouseout="this.style.background='#8b5cf6'">
                  Close
                </button>
              </div>
            </div>
          `;
          document.body.appendChild(modal);
          
          // Reset form
          setAmount('');
        }
      } else {
        alert('Invalid currency selected. Please try again.');
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
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  console.log('🔄 Manual refresh triggered');
                  fetchCommissionSettings();
                }}
                className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
                title="Refresh wallet settings"
              >
                🔄
              </button>
              <button
                onClick={() => setShowCurrencySelector(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                Default: {defaultCurrency} {getCurrencySymbol(defaultCurrency)}
              </button>
            </div>
          </div>
          
          {/* Currency Toggle */}
          <div className="flex justify-center mb-6">
            <div className="bg-white/10 rounded-2xl p-2 flex space-x-2">
              <button
                onClick={() => {
                  if (currency !== 'INR') {
                    setCurrency('INR');
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currency === 'INR'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🇮🇳 INR
              </button>
              <button
                onClick={() => {
                  if (currency !== 'USD') {
                    setCurrency('USD');
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  currency === 'USD'
                    ? 'bg-white text-slate-800 shadow-lg'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                🇺🇸 USD
              </button>
              <button
                onClick={() => {
                  if (currency !== 'USDT') {
                    setCurrency('USDT');
                  }
                }}
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
              disabled={currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled}
              className={`px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg flex items-center space-x-2 ${
                (currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled)
                  ? 'bg-gray-400 text-white cursor-not-allowed opacity-60'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              <i className="ri-add-line"></i>
              <span>{(currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled) ? 'Maintenance' : `Deposit ${currency}`}</span>
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              disabled={currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled}
              className={`px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg flex items-center space-x-2 ${
                (currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                  : 'bg-white text-slate-800 hover:bg-gray-100'
              }`}
            >
              <i className="ri-subtract-line"></i>
              <span>{(currency === 'INR' ? !walletSettings.inr_wallet_enabled : currency === 'USD' ? !walletSettings.usd_wallet_enabled : !walletSettings.usdt_wallet_enabled) ? 'Maintenance' : `Withdraw ${currency}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Alerts */}
      {!walletSettings.inr_wallet_enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <i className="ri-alert-line text-2xl text-amber-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <h4 className="font-semibold text-amber-900">INR Wallet Maintenance</h4>
            <p className="text-sm text-amber-800">The INR wallet is currently in maintenance mode. Deposits and withdrawals are temporarily unavailable.</p>
          </div>
        </div>
      )}
      {!walletSettings.usd_wallet_enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <i className="ri-alert-line text-2xl text-amber-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <h4 className="font-semibold text-amber-900">USD Wallet Maintenance</h4>
            <p className="text-sm text-amber-800">The USD wallet is currently in maintenance mode. Deposits and withdrawals are temporarily unavailable.</p>
          </div>
        </div>
      )}
      {!walletSettings.usdt_wallet_enabled && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start space-x-3">
          <i className="ri-alert-line text-2xl text-amber-600 flex-shrink-0 mt-0.5"></i>
          <div>
            <h4 className="font-semibold text-amber-900">USDT Wallet Maintenance</h4>
            <p className="text-sm text-amber-800">The USDT wallet is currently in maintenance mode. Deposits and withdrawals are temporarily unavailable.</p>
          </div>
        </div>
      )}

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
                      <span>Amount to Deposit:</span>
                      <span>{formatCurrency(parseFloat(amount || '0'), currency)}</span>
                    </div>
                    {commissionOnDeposits && (
                      <div className="flex justify-between">
                        <span>Commission ({commissionRate}%):</span>
                        <span className="text-orange-600">
                          +{formatCurrency(parseFloat(amount || '0') * (commissionRate / 100), currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Gateway:</span>
                      <span className="font-semibold">{getPaymentGateway(currency)}</span>
                    </div>
                    <div className="flex justify-between font-semibold pt-2 border-t">
                      <span>Total to Pay:</span>
                      <span className="text-blue-600">
                        {formatCurrency(parseFloat(amount || '0') * (1 + (commissionOnDeposits ? commissionRate / 100 : 0)), currency)}
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

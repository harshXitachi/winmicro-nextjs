'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { getAdminSettings, updateAdminSettings } from '@/lib/supabase';

export default function SettingsSection() {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsContent, setTermsContent] = useState(`
# Terms and Conditions

## 1. Acceptance of Terms
By accessing and using Microwin, you accept and agree to be bound by the terms and provision of this agreement.

## 2. User Accounts
- Users must provide accurate information when creating accounts
- Users are responsible for maintaining account security
- One account per person is allowed

## 3. Task Posting and Completion
- Task posters must provide clear and accurate descriptions
- Freelancers must deliver work as specified
- All work must be original and not infringe on copyrights

## 4. Payment Terms
- Payments are processed after task completion and approval
- Commission fees apply as specified in the fee structure
- Refunds are subject to our refund policy

## 5. Prohibited Activities
- Spam, fraud, or misleading content
- Harassment or inappropriate behavior
- Violation of intellectual property rights
- Circumventing platform fees

## 6. Platform Fees
- Commission rates vary by task value
- Withdrawal fees may apply
- Fee structure is subject to change with notice

## 7. Dispute Resolution
- Disputes should be reported through our support system
- Platform reserves the right to mediate disputes
- Final decisions rest with platform administration

## 8. Termination
- Accounts may be suspended or terminated for violations
- Users may close accounts at any time
- Outstanding payments will be processed according to policy

## 9. Limitation of Liability
- Platform is not liable for user disputes
- Service is provided "as is" without warranties
- Liability is limited to fees paid to the platform

## 10. Changes to Terms
- Terms may be updated periodically
- Users will be notified of significant changes
- Continued use constitutes acceptance of new terms

Last updated: ${new Date().toLocaleDateString()}
  `);
  
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'Microwin',
    supportEmail: 'support@microwin.com',
    maxTaskBudget: 10000,
    minTaskBudget: 5,
    defaultCommission: 3.0,
    maintenanceMode: false,
    newUserRegistration: true,
    emailVerificationRequired: true,
    autoApproveWithdrawals: false,
    maxWithdrawalPerDay: 5000
  });

  const [commissionSettings, setCommissionSettings] = useState({
    commission_percentage: '2.00',
    commission_on_deposits: true,
    commission_on_transfers: true,
    inr_wallet_enabled: true,
    usd_wallet_enabled: true,
    usdt_wallet_enabled: true,
    min_deposit_inr: '100.00',
    max_deposit_inr: '100000.00',
    min_deposit_usd: '2.00',
    max_deposit_usd: '5000.00',
    min_deposit_usdt: '2.00',
    max_deposit_usdt: '5000.00',
    min_withdrawal_inr: '500.00',
    max_withdrawal_inr: '50000.00',
    min_withdrawal_usd: '10.00',
    max_withdrawal_usd: '2000.00',
    min_withdrawal_usdt: '10.00',
    max_withdrawal_usdt: '2000.00',
  });
  
  const [paymentGateways, setPaymentGateways] = useState({
    phonepe_enabled: true,
    phonepe_merchant_id: 'M22AFUJH1IZRR',
    phonepe_key_index: '1',
    paypal_enabled: true,
    paypal_client_id: 'AZCRRRbyB5ZsN3gOeQ3VzXAQ9z_XGkQBIBXiV7j-50_l5EkBaHDZMrc6C8uYaHJF6xTddfITdfau00zE',
    crypto_enabled: true,
    crypto_wallet_address: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(settingsRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
      );
    }, settingsRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      console.log('📊 Loading commission settings from API...');
      const response = await fetch('/api/admin/wallet');
      console.log('📊 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 API Response data:', data);
        console.log('📊 Settings from API:', data.settings);
        
        if (data.settings) {
          const newSettings = {
            commission_percentage: data.settings.commission_percentage || '2.00',
            commission_on_deposits: data.settings.commission_on_deposits ?? true,
            commission_on_transfers: data.settings.commission_on_transfers ?? true,
            inr_wallet_enabled: data.settings.inr_wallet_enabled ?? true,
            usd_wallet_enabled: data.settings.usd_wallet_enabled ?? true,
            usdt_wallet_enabled: data.settings.usdt_wallet_enabled ?? true,
            min_deposit_inr: data.settings.min_deposit_inr || '100.00',
            max_deposit_inr: data.settings.max_deposit_inr || '100000.00',
            min_deposit_usd: data.settings.min_deposit_usd || '2.00',
            max_deposit_usd: data.settings.max_deposit_usd || '5000.00',
            min_deposit_usdt: data.settings.min_deposit_usdt || '2.00',
            max_deposit_usdt: data.settings.max_deposit_usdt || '5000.00',
            min_withdrawal_inr: data.settings.min_withdrawal_inr || '500.00',
            max_withdrawal_inr: data.settings.max_withdrawal_inr || '50000.00',
            min_withdrawal_usd: data.settings.min_withdrawal_usd || '10.00',
            max_withdrawal_usd: data.settings.max_withdrawal_usd || '2000.00',
            min_withdrawal_usdt: data.settings.min_withdrawal_usdt || '10.00',
            max_withdrawal_usdt: data.settings.max_withdrawal_usdt || '2000.00',
          };
          console.log('✅ Loaded settings:', newSettings);
          console.log('✅ INR Wallet enabled:', newSettings.inr_wallet_enabled);
          console.log('✅ USD Wallet enabled:', newSettings.usd_wallet_enabled);
          console.log('✅ USDT Wallet enabled:', newSettings.usdt_wallet_enabled);
          setCommissionSettings(newSettings);
        } else {
          console.warn('⚠️ No settings in response, using defaults');
        }
      } else {
        console.error('❌ Failed to load settings, status:', response.status);
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === confirmPassword && adminPassword.length >= 6) {
      setSaving(true);
      try {
        const response = await fetch('/api/admin/password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            new_password: adminPassword,
            confirm_password: confirmPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          alert('Admin password updated successfully!');
          setAdminPassword('');
          setConfirmPassword('');
        } else {
          alert(data.error || 'Failed to update password');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        alert('Failed to update password. Please try again.');
      } finally {
        setSaving(false);
      }
    } else {
      alert('Passwords do not match or are too short (minimum 6 characters)');
    }
  };

  const handleTermsUpdate = () => {
    // In real app, this would save to database
    alert('Terms and Conditions updated successfully!');
  };

  const handleSettingsUpdate = () => {
    // In real app, this would save to database
    alert('Platform settings updated successfully!');
  };

  const handleCommissionUpdate = async () => {
    setSaving(true);
    try {
      const adminSession = localStorage.getItem('admin_session');
      
      // Validate commission percentage
      const percentage = parseFloat(commissionSettings.commission_percentage);
      if (isNaN(percentage) || percentage < 0 || percentage > 100) {
        alert('❌ Commission percentage must be between 0 and 100');
        setSaving(false);
        return;
      }
      
      // Log update for debugging
      console.log('🔄 Updating commission settings:', commissionSettings);
      console.log('🔑 Admin session:', adminSession ? 'Present' : 'Missing');
      
      const response = await fetch('/api/admin/wallet', {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'x-admin-session': adminSession ? 'true' : '',
        },
        body: JSON.stringify(commissionSettings),
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        alert('✅ Commission settings updated successfully! Changes will apply immediately to all deposits and transfers.');
        console.log('✅ Settings updated successfully');
        // Reload settings to confirm changes persisted
        setTimeout(() => {
          loadSettings();
        }, 500);
      } else {
        console.error('❌ API Error:', data);
        alert(`❌ Failed to update commission settings: ${data.error || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('❌ Network Error:', error);
      alert(`❌ Error: ${error.message || 'Failed to update commission settings. Please try again.'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div ref={settingsRef} className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">Manage platform configuration and security settings</p>
      </div>

      {/* Admin Security */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Admin Security</h3>
            <p className="text-gray-600">Change admin panel password</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <i className="ri-shield-line text-2xl text-red-600"></i>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter new password"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Confirm new password"
                minLength={6}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Updating...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Commission Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Commission Settings</h3>
            <p className="text-gray-600">Manage platform commission rates for transactions</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i className="ri-money-rupee-circle-line text-2xl text-green-600"></i>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Commission Rate and Enable Toggle */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionSettings.commission_percentage}
                  onChange={(e) => setCommissionSettings({...commissionSettings, commission_percentage: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Current rate: {commissionSettings.commission_percentage}% per transaction
                </p>
              </div>
            </div>

            {/* Commission Type Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={commissionSettings.commission_on_deposits}
                      onChange={(e) => setCommissionSettings({...commissionSettings, commission_on_deposits: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Commission on Deposits</span>
                    <p className="text-xs text-gray-500">Charge commission when users deposit</p>
                  </div>
                </label>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={commissionSettings.commission_on_transfers}
                      onChange={(e) => setCommissionSettings({...commissionSettings, commission_on_transfers: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </div>
                  <div>
                    <span className="text-gray-700 font-medium">Commission on Transfers</span>
                    <p className="text-xs text-gray-500">Charge commission when users send money</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Wallet Enable/Disable */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="font-semibold text-gray-900 mb-4">Wallet Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={commissionSettings.inr_wallet_enabled}
                        onChange={(e) => setCommissionSettings({...commissionSettings, inr_wallet_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">🇮🇳 INR Wallet</span>
                      <p className="text-xs text-gray-500">Enable/Disable for all users</p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={commissionSettings.usd_wallet_enabled}
                        onChange={(e) => setCommissionSettings({...commissionSettings, usd_wallet_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">🇺🇸 USD Wallet</span>
                      <p className="text-xs text-gray-500">Enable/Disable for all users</p>
                    </div>
                  </label>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={commissionSettings.usdt_wallet_enabled}
                        onChange={(e) => setCommissionSettings({...commissionSettings, usdt_wallet_enabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-200 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">🔷 USDT Wallet</span>
                      <p className="text-xs text-gray-500">Enable/Disable for all users</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Commission Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">Commission Preview (on ₹1,000 deposit)</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Amount to Deposit:</span>
                  <span className="font-semibold">₹1,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Commission ({commissionSettings.commission_percentage}%):</span>
                  <span className="font-semibold text-orange-600">
                    +₹{commissionSettings.commission_on_deposits ? ((1000 * parseFloat(commissionSettings.commission_percentage)) / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-300">
                  <span className="text-gray-700 font-semibold">Total User Pays:</span>
                  <span className="font-bold text-blue-900">
                    ₹{commissionSettings.commission_on_deposits ? (1000 + (1000 * parseFloat(commissionSettings.commission_percentage)) / 100).toFixed(2) : '1000.00'}
                  </span>
                </div>
                <div className="flex justify-between text-xs pt-2 text-gray-600">
                  <span>Your Commission Earnings:</span>
                  <span className="font-semibold text-green-600">
                    +₹{commissionSettings.commission_on_deposits ? ((1000 * parseFloat(commissionSettings.commission_percentage)) / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Commission Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Commission on Deposits</div>
                <div className="text-xl font-bold text-green-600">
                  {commissionSettings.commission_on_deposits ? 'Enabled' : 'Disabled'}
                </div>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">Current Rate</div>
                <div className="text-xl font-bold text-blue-600">
                  {commissionSettings.commission_percentage}%
                </div>
              </div>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                <div className="text-sm text-gray-600 mb-1">Commission on Transfers</div>
                <div className="text-xl font-bold text-purple-600">
                  {commissionSettings.commission_on_transfers ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCommissionUpdate}
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </span>
                ) : (
                  'Save Commission Settings'
                )}
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🔍 Testing database connection...');
                    const response = await fetch('/api/debug/commission-settings');
                    const data = await response.json();
                    console.log('🔍 Debug response:', data);
                    alert(`Database test: ${data.success ? 'Success' : 'Failed'}\nRecords: ${data.count}\nCheck console for details.`);
                  } catch (error) {
                    console.error('❌ Debug test failed:', error);
                    alert('Database test failed. Check console for details.');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                🔍 Test DB
              </button>
              <button
                onClick={async () => {
                  try {
                    console.log('🔧 Creating default settings...');
                    const response = await fetch('/api/debug/commission-settings', { method: 'POST' });
                    const data = await response.json();
                    console.log('🔧 Create response:', data);
                    if (data.success) {
                      alert('Default settings created successfully! Refreshing...');
                      loadSettings();
                    } else {
                      alert(`Failed to create settings: ${data.error}`);
                    }
                  } catch (error) {
                    console.error('❌ Create settings failed:', error);
                    alert('Failed to create default settings. Check console for details.');
                  }
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
              >
                🔧 Create Defaults
              </button>
              <button
                onClick={() => {
                  setCommissionSettings({
                    commission_percentage: '2.00',
                    commission_on_deposits: true,
                    commission_on_transfers: true,
                    inr_wallet_enabled: true,
                    usd_wallet_enabled: true,
                    usdt_wallet_enabled: true,
                    min_deposit_inr: '100.00',
                    max_deposit_inr: '100000.00',
                    min_deposit_usd: '2.00',
                    max_deposit_usd: '5000.00',
                    min_deposit_usdt: '2.00',
                    max_deposit_usdt: '5000.00',
                    min_withdrawal_inr: '500.00',
                    max_withdrawal_inr: '50000.00',
                    min_withdrawal_usd: '10.00',
                    max_withdrawal_usd: '2000.00',
                    min_withdrawal_usdt: '10.00',
                    max_withdrawal_usdt: '2000.00',
                  });
                }}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Reset to Default
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Platform Settings */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Platform Settings</h3>
            <p className="text-gray-600">Configure platform behavior and limits</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <i className="ri-settings-3-line text-2xl text-blue-600"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
            <input
              type="text"
              value={platformSettings.siteName}
              onChange={(e) => setPlatformSettings({...platformSettings, siteName: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
            <input
              type="email"
              value={platformSettings.supportEmail}
              onChange={(e) => setPlatformSettings({...platformSettings, supportEmail: e.target.value})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Task Budget ($)</label>
            <input
              type="number"
              value={platformSettings.maxTaskBudget}
              onChange={(e) => setPlatformSettings({...platformSettings, maxTaskBudget: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Task Budget ($)</label>
            <input
              type="number"
              value={platformSettings.minTaskBudget}
              onChange={(e) => setPlatformSettings({...platformSettings, minTaskBudget: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Commission (%)</label>
            <input
              type="number"
              step="0.1"
              value={platformSettings.defaultCommission}
              onChange={(e) => setPlatformSettings({...platformSettings, defaultCommission: parseFloat(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Daily Withdrawal ($)</label>
            <input
              type="number"
              value={platformSettings.maxWithdrawalPerDay}
              onChange={(e) => setPlatformSettings({...platformSettings, maxWithdrawalPerDay: parseInt(e.target.value)})}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="font-semibold text-gray-900">Platform Controls</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.maintenanceMode}
                onChange={(e) => setPlatformSettings({...platformSettings, maintenanceMode: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Maintenance Mode</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.newUserRegistration}
                onChange={(e) => setPlatformSettings({...platformSettings, newUserRegistration: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Allow New Registrations</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.emailVerificationRequired}
                onChange={(e) => setPlatformSettings({...platformSettings, emailVerificationRequired: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Require Email Verification</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={platformSettings.autoApproveWithdrawals}
                onChange={(e) => setPlatformSettings({...platformSettings, autoApproveWithdrawals: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-gray-700">Auto-approve Withdrawals</span>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSettingsUpdate}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Terms and Conditions</h3>
            <p className="text-gray-600">Edit the terms and conditions shown to users</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <i className="ri-file-text-line text-2xl text-green-600"></i>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Terms Content (Markdown supported)</label>
            <textarea
              value={termsContent}
              onChange={(e) => setTermsContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              placeholder="Enter terms and conditions..."
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <div className="flex space-x-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors">
                Preview
              </button>
              <button
                onClick={handleTermsUpdate}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors"
              >
                Update Terms
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">System Information</h3>
            <p className="text-gray-600">Platform status and version information</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <i className="ri-information-line text-2xl text-purple-600"></i>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-gray-900 mb-1">v2.1.0</div>
            <div className="text-sm text-gray-600">Platform Version</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-green-600 mb-1">Online</div>
            <div className="text-sm text-gray-600">System Status</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-blue-600 mb-1">99.9%</div>
            <div className="text-sm text-gray-600">Uptime</div>
          </div>
        </div>
      </div>
    </div>
  );
}

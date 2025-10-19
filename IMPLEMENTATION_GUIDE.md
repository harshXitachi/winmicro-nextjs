# Multi-Currency Wallet System & Admin Panel Overhaul - Implementation Guide

## Overview
This document provides a comprehensive guide for implementing the multi-currency wallet system (INR, USD, USDT) and overhauling the admin panel to use real data instead of mock data.

---

## ✅ Completed Work

### 1. Database Schema Updates
**File:** `src/lib/db/schema.ts`

#### Added to Users Table:
- `is_banned` (boolean) - Ban status flag
- `ban_reason` (text) - Reason for ban
- `ban_expires_at` (timestamp) - When ban expires (null = permanent)
- `banned_at` (timestamp) - When user was banned

#### Added to Profiles Table:
- `wallet_balance_inr` (decimal) - INR wallet balance
- `wallet_balance_usd` (decimal) - USD wallet balance
- `wallet_balance_usdt` (decimal) - USDT wallet balance
- `default_currency` (varchar) - User's preferred default currency
- Note: `wallet_balance` kept for backward compatibility

#### Added to Wallet Transactions Table:
- `currency` (varchar) - Transaction currency (INR, USD, USDT)

#### New Tables Created:

**admin_wallets:**
```sql
- id (UUID, primary key)
- currency (VARCHAR, unique) - INR, USD, or USDT
- balance (DECIMAL) - Current admin wallet balance
- total_commission_earned (DECIMAL) - Total commission earned
- created_at, updated_at (TIMESTAMP)
```

**commission_settings:**
```sql
- id (UUID, primary key)
- commission_percentage (DECIMAL, default 2.00) - Universal commission rate
- commission_on_deposits (BOOLEAN) - Enable/disable commission on deposits
- commission_on_transfers (BOOLEAN) - Enable/disable commission on transfers
- min_deposit_inr, max_deposit_inr (DECIMAL) - INR deposit limits
- min_deposit_usd, max_deposit_usd (DECIMAL) - USD deposit limits
- min_deposit_usdt, max_deposit_usdt (DECIMAL) - USDT deposit limits
- min_withdrawal_inr, max_withdrawal_inr (DECIMAL) - INR withdrawal limits
- min_withdrawal_usd, max_withdrawal_usd (DECIMAL) - USD withdrawal limits
- min_withdrawal_usdt, max_withdrawal_usdt (DECIMAL) - USDT withdrawal limits
- updated_at (TIMESTAMP)
```

### 2. Database Migration Script
**File:** `src/lib/db/migrations/001_multi_currency_wallet.sql`

- Adds all new columns to existing tables
- Creates new tables (admin_wallets, commission_settings)
- Migrates existing wallet_balance data to wallet_balance_inr
- Initializes admin wallets for all three currencies
- Sets default commission settings (2%)
- Creates performance indexes

**To run migration:**
```bash
# Connect to your Neon database and execute the SQL file
# Or use your preferred migration tool
```

### 3. Updated API Routes

#### Wallet Balance API
**File:** `src/app/api/wallet/balance/route.ts`

**New Features:**
- Multi-currency support (INR, USD, USDT)
- Dynamic commission calculation based on settings
- Separate wallet balances per currency
- Automatic admin wallet crediting for commissions
- Support for both deposits and transfers

**Request Body:**
```json
{
  "userId": "user-uuid",
  "amount": 1000,
  "type": "credit" | "debit",
  "currency": "INR" | "USD" | "USDT",
  "transactionType": "deposit" | "withdrawal" | "transfer",
  "applyCommission": true | false
}
```

#### Admin Wallet API
**File:** `src/app/api/admin/wallet/route.ts`

**Endpoints:**
- `GET` - Fetch all admin wallets, settings, and recent commissions
- `POST` - Withdraw from admin wallet (specify currency and amount)
- `PATCH` - Update commission settings

#### User Ban API
**File:** `src/app/api/admin/users/ban/route.ts`

**Endpoints:**
- `POST` - Ban a user (with reason and duration)
- `DELETE` - Unban a user

---

## 🔄 Remaining Implementation Tasks

### Task 1: Update User WalletSection Component
**File:** `src/app/dashboard/components/WalletSection.tsx`

**Required Changes:**

1. **Multi-Currency Wallet Display:**
   - Show three separate wallet balances (INR, USD, USDT)
   - Add tabbed interface or separate cards for each currency
   - Display conversion rates between currencies

2. **Default Currency Selection:**
   - Add dropdown/toggle for users to select default currency
   - Save preference to `profiles.default_currency`
   - Remember selection across sessions

3. **Updated Transaction Display:**
   - Filter transactions by currency
   - Show currency-specific transaction history
   - Add currency badges/icons to transactions

4. **Deposit/Withdrawal Updates:**
   - Add USDT support (alongside INR/USD)
   - Update gateway selection (USDT uses crypto wallet)
   - Show commission deduction in real-time preview
   - Fetch commission rate from API instead of hardcoding

**Sample Implementation Structure:**
```tsx
// Add to state
const [selectedCurrency, setSelectedCurrency] = useState<'INR' | 'USD' | 'USDT'>('INR');
const [defaultCurrency, setDefaultCurrency] = useState<string>('INR');

// Fetch commission settings
useEffect(() => {
  fetchCommissionSettings();
}, []);

// Currency selection tabs
<div className="currency-tabs">
  <button onClick={() => setSelectedCurrency('INR')}>INR</button>
  <button onClick={() => setSelectedCurrency('USD')}>USD</button>
  <button onClick={() => setSelectedCurrency('USDT')}>USDT</button>
</div>

// Display balance based on selected currency
<div className="balance-display">
  {formatCurrency(profile[`wallet_balance_${selectedCurrency.toLowerCase()}`], selectedCurrency)}
</div>

// Default currency selector
<select value={defaultCurrency} onChange={handleDefaultCurrencyChange}>
  <option value="INR">INR (₹)</option>
  <option value="USD">USD ($)</option>
  <option value="USDT">USDT (₮)</option>
</select>
```

### Task 2: Update Dashboard Overview Widget
**File:** `src/app/dashboard/components/OverviewSection.tsx`

**Required Changes:**
- Display wallet balance based on user's `default_currency` preference
- Show balance from correct currency field
- Add small currency indicator
- Optional: Show other currency balances as secondary info

### Task 3: Update Payment System for Multi-Currency
**File:** `src/app/api/payments/route.ts` and related components

**Required Changes:**

1. **Payment Request:**
   - Add currency selection dropdown
   - Validate sender has sufficient balance in selected currency
   - Apply commission if `commission_on_transfers` is enabled

2. **Payment Processing:**
   - Deduct from sender's currency-specific wallet
   - Credit to recipient's same currency wallet
   - Calculate and credit commission to admin wallet (same currency)

3. **Message Payment UI:**
   - Add currency selector to payment modal
   - Show available balance per currency
   - Display commission deduction preview

**API Update Example:**
```typescript
// In payment route
const { senderId, recipientId, amount, currency, taskId } = body;

// Get commission settings
const [settings] = await db.select().from(commission_settings).limit(1);
const applyCommission = settings?.commission_on_transfers;
const commissionRate = parseFloat(settings?.commission_percentage || '2') / 100;

// Calculate amounts
const commissionAmount = applyCommission ? amount * commissionRate : 0;
const recipientAmount = amount - commissionAmount;

// Update sender wallet (debit)
await updateWalletBalance(senderId, amount, 'debit', currency);

// Update recipient wallet (credit)
await updateWalletBalance(recipientId, recipientAmount, 'credit', currency);

// Credit commission to admin
if (commissionAmount > 0) {
  await creditAdminWallet(currency, commissionAmount);
}
```

### Task 4: Update Admin Dashboard OverviewSection
**File:** `src/app/admin/dashboard/components/OverviewSection.tsx`

**Replace Mock Data With Real Queries:**

```typescript
// Total Users
const [usersCount] = await db
  .select({ count: sql<number>`count(*)` })
  .from(users);

// Active Tasks
const [activeTasks] = await db
  .select({ count: sql<number>`count(*)` })
  .from(tasks)
  .where(eq(tasks.status, 'open'));

// Total Revenue (sum of all admin wallet balances)
const adminWallets = await db.select().from(admin_wallets);
const totalRevenue = adminWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);

// Revenue Overview (last 12 months)
const revenueData = await db
  .select({
    month: sql<string>`TO_CHAR(created_at, 'Mon')`,
    total: sql<number>`SUM(commission_amount)`,
  })
  .from(wallet_transactions)
  .where(gte(wallet_transactions.created_at, /* 12 months ago */))
  .groupBy(sql`TO_CHAR(created_at, 'Mon')`);

// User Growth (last 12 months)
const userGrowth = await db
  .select({
    month: sql<string>`TO_CHAR(created_at, 'Mon')`,
    count: sql<number>`COUNT(*)`,
  })
  .from(users)
  .where(gte(users.created_at, /* 12 months ago */))
  .groupBy(sql`TO_CHAR(created_at, 'Mon')`);

// Recent Activity (last 20 transactions)
const recentActivity = await db
  .select()
  .from(wallet_transactions)
  .orderBy(desc(wallet_transactions.created_at))
  .limit(20);
```

### Task 5: Update Admin UsersSection
**File:** `src/app/admin/dashboard/components/UsersSection.tsx`

**Required Changes:**

1. **Replace Mock Data:**
```typescript
// Fetch real users with profiles
const usersWithProfiles = await db
  .select()
  .from(users)
  .leftJoin(profiles, eq(profiles.user_id, users.id))
  .orderBy(desc(users.created_at));
```

2. **Add User Functionality:**
```typescript
const handleAddUser = async (userData) => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  // Refresh users list
};
```

3. **Edit User Functionality:**
```typescript
const handleEditUser = async (userId, updates) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
};
```

4. **Ban User Modal:**
```tsx
<BanUserModal
  userId={selectedUserId}
  onBan={async (reason, duration) => {
    await fetch('/api/admin/users/ban', {
      method: 'POST',
      body: JSON.stringify({ userId, reason, duration }),
    });
  }}
/>
```

5. **Reset Password:**
```typescript
const handleResetPassword = async (userId) => {
  const newPassword = generateRandomPassword();
  await fetch(`/api/admin/users/${userId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword }),
  });
  // Show password to admin
};
```

### Task 6: Implement Ban Notification Popup
**File:** `src/components/BanNotification.tsx` (new file)

**Create Component:**
```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BanNotification() {
  const { user } = useAuth();
  const [banInfo, setBanInfo] = useState(null);

  useEffect(() => {
    if (user?.is_banned) {
      setBanInfo({
        reason: user.ban_reason,
        expiresAt: user.ban_expires_at,
        bannedAt: user.banned_at,
      });
    }
  }, [user]);

  if (!banInfo) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-error-warning-line text-3xl text-red-600"></i>
          </div>
          
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Account Suspended
          </h2>
          
          <div className="text-left space-y-3 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reason:</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {banInfo.reason}
              </p>
            </div>
            
            {banInfo.expiresAt && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expires:</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {new Date(banInfo.expiresAt).toLocaleDateString()}
                </p>
              </div>
            )}
            
            {!banInfo.expiresAt && (
              <p className="text-red-600 font-semibold">
                This ban is permanent.
              </p>
            )}
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Please contact support if you believe this is a mistake.
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Add to Layout:**
```tsx
// In src/app/layout.tsx
import BanNotification from '@/components/BanNotification';

export default function Layout({ children }) {
  return (
    <>
      <BanNotification />
      {children}
    </>
  );
}
```

### Task 7: Update Middleware for Ban Checking
**File:** `src/middleware.ts`

**Add Ban Check:**
```typescript
// Check if user is banned
if (currentUser && currentUser.is_banned) {
  // Check if ban has expired
  if (currentUser.ban_expires_at) {
    const expiryDate = new Date(currentUser.ban_expires_at);
    if (expiryDate < new Date()) {
      // Ban expired, unban user
      await unbanUser(currentUser.userId);
    } else {
      // Ban still active, allow only to view ban notice
      if (!request.nextUrl.pathname.startsWith('/banned')) {
        return NextResponse.redirect(new URL('/banned', request.url));
      }
    }
  }
  // Permanent ban - redirect to ban page
  if (!request.nextUrl.pathname.startsWith('/banned')) {
    return NextResponse.redirect(new URL('/banned', request.url));
  }
}
```

### Task 8: Update Admin WalletSection
**File:** `src/app/admin/dashboard/components/WalletSection.tsx`

**Complete Rewrite Required:**

1. **Multi-Currency Display:**
   - Show three separate wallet cards (INR, USD, USDT)
   - Display balance and total earned for each
   - Individual withdraw buttons per currency

2. **Commission Settings:**
   - Move commission percentage input here
   - Add toggles for commission on deposits/transfers
   - Remove from settings section

3. **Real Commission Data:**
   - Fetch from `/api/admin/wallet`
   - Filter by currency
   - Show transaction details (user, amount, commission)

4. **Withdrawal Functionality:**
   - Separate modals for each currency
   - Validate against available balance
   - Record withdrawal transaction

**Structure:**
```tsx
// Fetch admin wallet data
const { wallets, settings, recentCommissions } = await fetchAdminWalletData();

// Display currency wallets
{wallets.map(wallet => (
  <WalletCard
    key={wallet.currency}
    currency={wallet.currency}
    balance={wallet.balance}
    totalEarned={wallet.total_commission_earned}
    onWithdraw={() => handleWithdraw(wallet.currency)}
  />
))}

// Commission settings
<CommissionSettings
  percentage={settings.commission_percentage}
  onDeposits={settings.commission_on_deposits}
  onTransfers={settings.commission_on_transfers}
  onUpdate={updateSettings}
/>

// Recent commissions
<CommissionsList
  transactions={recentCommissions}
/>
```

### Task 9: Update Admin Settings Section
**File:** `src/app/admin/dashboard/components/SettingsSection.tsx`

**Changes:**

1. **Remove Commission Settings** (moved to Wallet)

2. **Add Admin Credential Management:**
```tsx
// Change Email
<input
  type="email"
  value={adminEmail}
  onChange={handleEmailChange}
/>
<button onClick={updateEmail}>Update Email</button>

// Change Password
<input
  type="password"
  value={newPassword}
  onChange={handlePasswordChange}
/>
<button onClick={updatePassword}>Update Password</button>
```

3. **Keep Platform Settings:**
   - Site name, logo, etc.
   - Ensure all settings are functional

---

## 🔧 Testing Checklist

### Multi-Currency Wallet Testing

- [ ] INR deposit with commission applied correctly
- [ ] USD deposit with commission applied correctly
- [ ] USDT deposit with commission applied correctly
- [ ] INR withdrawal successful
- [ ] USD withdrawal successful
- [ ] USDT withdrawal successful
- [ ] Commission correctly credited to admin wallet
- [ ] Default currency selection saves and persists
- [ ] Dashboard widget shows correct default currency balance
- [ ] Transaction history filters by currency

### Payment System Testing

- [ ] Send payment in INR between users
- [ ] Send payment in USD between users
- [ ] Send payment in USDT between users
- [ ] Commission on transfer applies correctly (2% default)
- [ ] Recipient receives correct amount (after commission)
- [ ] Admin wallet credited with commission
- [ ] Insufficient balance error handling

### Admin Panel Testing

- [ ] Dashboard shows real user count
- [ ] Dashboard shows real active tasks
- [ ] Dashboard shows real revenue data
- [ ] Revenue chart displays actual data
- [ ] User growth chart displays actual data
- [ ] Recent activity shows real transactions

### User Management Testing

- [ ] View all users with real data
- [ ] Add new user functionality works
- [ ] Edit user details works
- [ ] Ban user with duration works
- [ ] Ban user permanently works
- [ ] Unban user works
- [ ] Reset password generates and displays new password

### Ban System Testing

- [ ] Banned user sees non-dismissible popup
- [ ] Ban reason and expiry date displayed correctly
- [ ] Temporary ban expires automatically
- [ ] Banned user cannot access system features
- [ ] Unbanned user regains full access

### Admin Wallet Testing

- [ ] All three currency wallets display correctly
- [ ] Withdraw from INR wallet works
- [ ] Withdraw from USD wallet works
- [ ] Withdraw from USDT wallet works
- [ ] Commission settings update correctly
- [ ] Recent commissions show real data
- [ ] Toggle commission on deposits works
- [ ] Toggle commission on transfers works

---

## 📋 Migration Steps

1. **Backup Database:**
   ```bash
   # Create backup of your Neon database
   pg_dump DATABASE_URL > backup.sql
   ```

2. **Run Migration:**
   ```bash
   # Execute migration script
   psql DATABASE_URL < src/lib/db/migrations/001_multi_currency_wallet.sql
   ```

3. **Verify Migration:**
   - Check all new columns exist
   - Verify admin_wallets table created
   - Confirm commission_settings initialized
   - Check indexes created

4. **Update Environment:**
   - Ensure all environment variables set
   - Test database connections

5. **Deploy Updates:**
   - Deploy updated API routes
   - Deploy updated components
   - Test in staging environment first

---

## 🚀 Next Steps

1. Complete remaining component updates (Tasks 1-9)
2. Run comprehensive testing (Testing Checklist)
3. Execute database migration
4. Deploy to production
5. Monitor for issues

---

## 📞 Support

For questions or issues during implementation:
- Check console logs for API errors
- Verify database schema matches expected structure
- Ensure all environment variables are set correctly
- Test each feature independently before integration

---

## 📝 Notes

- Commission rate defaults to 2% but is configurable
- Legacy `wallet_balance` field maintained for backward compatibility
- All currency amounts stored with 2 decimal precision
- Ban system supports both temporary and permanent bans
- Admin wallets track commissions separately per currency

---

**Last Updated:** 2025-10-12
**Version:** 1.0

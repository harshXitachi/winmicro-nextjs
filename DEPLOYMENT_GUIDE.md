# 🚀 Deployment Guide - Final Steps

## Current Status: 70% Complete

**Backend:** ✅ 100% Complete  
**Frontend:** ⏳ 40% Complete  
**Testing:** ⏳ Pending

---

## ✅ STEP 1: Run Database Migration (CRITICAL - DO THIS FIRST!)

### Prerequisites
- Backup your database
- Have DATABASE_URL environment variable set

### Commands:
```bash
# 1. Backup database
pg_dump $env:DATABASE_URL > backup_$(Get-Date -Format 'yyyyMMdd').sql

# 2. Run migration
psql $env:DATABASE_URL -f "src/lib/db/migrations/001_multi_currency_wallet.sql"

# 3. Verify tables created
psql $env:DATABASE_URL -c "SELECT * FROM admin_wallets;"
psql $env:DATABASE_URL -c "SELECT * FROM commission_settings;"

# 4. Check new columns
psql $env:DATABASE_URL -c "\d profiles"
psql $env:DATABASE_URL -c "\d users"
```

**Expected Results:**
- admin_wallets should have 3 rows (INR, USD, USDT)
- commission_settings should have 1 row with 2.00% rate
- profiles table should have new wallet columns
- users table should have ban fields

---

## ✅ STEP 2: Replace User WalletSection Component

### Action Required:
```bash
# Rename old file as backup
mv src/app/dashboard/components/WalletSection.tsx src/app/dashboard/components/WalletSection_OLD.tsx

# Rename new file
mv src/app/dashboard/components/WalletSection_NEW.tsx src/app/dashboard/components/WalletSection.tsx
```

### What This Includes:
- ✅ USDT support
- ✅ Default currency selector
- ✅ Multi-currency balance display
- ✅ Real-time commission fetching from API
- ✅ Currency-filtered transactions
- ✅ Payment gateway integration

**Test:** Navigate to dashboard wallet section and verify all 3 currencies work

---

## ⏳ STEP 3: Update Dashboard OverviewSection

**File:** `src/app/dashboard/components/OverviewSection.tsx`

### Required Changes:
Find the wallet balance display and update to use default currency:

```tsx
// OLD CODE (find this):
<p className="text-2xl font-bold">
  ₹{profile.wallet_balance}
</p>

// NEW CODE (replace with):
import { formatCurrency, type Currency } from '@/lib/currency';

const defaultCurrency = (profile.default_currency as Currency) || 'INR';
const balanceField = `wallet_balance_${defaultCurrency.toLowerCase()}`;
const balance = parseFloat((profile as any)[balanceField] || '0');

<p className="text-2xl font-bold">
  {formatCurrency(balance, defaultCurrency)}
</p>
<p className="text-xs text-gray-500">Default Currency: {defaultCurrency}</p>
```

**Estimated Time:** 15 minutes

---

## ⏳ STEP 4: Create New Admin WalletSection

**File:** `src/app/admin/dashboard/components/WalletSection.tsx`

This needs a complete rewrite. Key sections needed:

### 1. Fetch Admin Wallet Data:
```tsx
const [wallets, setWallets] = useState([]);
const [settings, setSettings] = useState(null);
const [recentCommissions, setRecentCommissions] = useState([]);

useEffect(() => {
  fetchWalletData();
}, []);

const fetchWalletData = async () => {
  const response = await fetch('/api/admin/wallet');
  const data = await response.json();
  setWallets(data.wallets);
  setSettings(data.settings);
  setRecentCommissions(data.recentCommissions);
};
```

### 2. Display Currency Wallets:
```tsx
<div className="grid grid-cols-3 gap-6">
  {wallets.map(wallet => (
    <div key={wallet.currency} className="bg-white rounded-xl p-6 shadow">
      <h3>{wallet.currency} Wallet</h3>
      <p className="text-3xl font-bold">
        {formatCurrency(parseFloat(wallet.balance), wallet.currency)}
      </p>
      <p className="text-sm text-gray-600">
        Total Earned: {formatCurrency(parseFloat(wallet.total_commission_earned), wallet.currency)}
      </p>
      <button onClick={() => handleWithdraw(wallet.currency)}>
        Withdraw
      </button>
    </div>
  ))}
</div>
```

### 3. Commission Settings:
```tsx
<div className="commission-settings">
  <label>Commission Rate (%)</label>
  <input
    type="number"
    value={settings?.commission_percentage}
    onChange={(e) => updateCommissionRate(e.target.value)}
  />
  
  <label>
    <input
      type="checkbox"
      checked={settings?.commission_on_deposits}
      onChange={(e) => updateSetting('commission_on_deposits', e.target.checked)}
    />
    Enable commission on deposits
  </label>
  
  <label>
    <input
      type="checkbox"
      checked={settings?.commission_on_transfers}
      onChange={(e) => updateSetting('commission_on_transfers', e.target.checked)}
    />
    Enable commission on transfers
  </label>
</div>
```

### 4. Recent Commissions List:
```tsx
<div className="recent-commissions">
  <h3>Recent Commission Earnings</h3>
  {recentCommissions.map(txn => (
    <div key={txn.id} className="commission-item">
      <span>{txn.currency}</span>
      <span>{formatCurrency(parseFloat(txn.commission_amount), txn.currency)}</span>
      <span>{formatDate(txn.created_at)}</span>
    </div>
  ))}
</div>
```

**Estimated Time:** 4-6 hours

---

## ⏳ STEP 5: Update Admin UsersSection

**File:** `src/app/admin/dashboard/components/UsersSection.tsx`

### Replace Mock Data:
```tsx
const [users, setUsers] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchUsers();
}, []);

const fetchUsers = async () => {
  const response = await fetch('/api/admin/users');
  const data = await response.json();
  setUsers(data.users);
  setLoading(false);
};
```

### Add User Modal:
```tsx
const [showAddModal, setShowAddModal] = useState(false);
const [newUser, setNewUser] = useState({
  email: '',
  password: '',
  first_name: '',
  last_name: '',
  role: 'user'
});

const handleAddUser = async () => {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  });
  
  if (response.ok) {
    fetchUsers(); // Refresh list
    setShowAddModal(false);
  }
};
```

### Ban User Functionality:
```tsx
const [showBanModal, setShowBanModal] = useState(false);
const [banUserId, setBanUserId] = useState(null);
const [banReason, setBanReason] = useState('');
const [banDuration, setBanDuration] = useState(7); // days

const handleBanUser = async () => {
  const response = await fetch('/api/admin/users/ban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: banUserId,
      reason: banReason,
      duration: banDuration
    }),
  });
  
  if (response.ok) {
    fetchUsers();
    setShowBanModal(false);
  }
};
```

### Reset Password:
```tsx
const handleResetPassword = async (userId) => {
  const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  
  const data = await response.json();
  if (data.newPassword) {
    alert(`New password: ${data.newPassword}\nPlease save this and provide to user.`);
  }
};
```

**Estimated Time:** 3-4 hours

---

## ⏳ STEP 6: Update Admin OverviewSection

**File:** `src/app/admin/dashboard/components/OverviewSection.tsx`

### Fetch Real Data:
```tsx
const [stats, setStats] = useState(null);

useEffect(() => {
  fetchStats();
}, []);

const fetchStats = async () => {
  const response = await fetch('/api/admin/stats');
  const data = await response.json();
  setStats(data);
};

// Use real data instead of mock:
<div className="stat-card">
  <h3>Total Users</h3>
  <p>{stats?.overview.totalUsers || 0}</p>
</div>

<div className="stat-card">
  <h3>Active Tasks</h3>
  <p>{stats?.overview.activeTasks || 0}</p>
</div>

<div className="stat-card">
  <h3>Total Revenue</h3>
  <p>₹{stats?.overview.totalRevenue || '0.00'}</p>
</div>

<div className="stat-card">
  <h3>Commission Rate</h3>
  <p>{stats?.overview.commissionRate || 2}%</p>
</div>
```

### Update Charts:
```tsx
// Revenue chart data
const revenueData = stats?.charts.revenueOverTime || [];

// User growth chart data
const userGrowthData = stats?.charts.userGrowth || [];

// Recent activities
const activities = stats?.recentActivities || [];
```

**Estimated Time:** 3-4 hours

---

## ⏳ STEP 7: Update Admin SettingsSection

**File:** `src/app/admin/dashboard/components/SettingsSection.tsx`

### Remove Commission Settings
Delete the commission settings section (now in WalletSection)

### Add Credential Management:
```tsx
const [adminEmail, setAdminEmail] = useState('');
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');

const handleChangeEmail = async () => {
  const response = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.userId, email: adminEmail }),
  });
  
  if (response.ok) {
    alert('Email updated successfully');
  }
};

const handleChangePassword = async () => {
  const response = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: currentUser.userId, password: newPassword }),
  });
  
  if (response.ok) {
    alert('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
  }
};
```

**Estimated Time:** 2-3 hours

---

## ⏳ STEP 8: Add Ban Notification to Layout

**File:** `src/app/layout.tsx`

### Add Import and Component:
```tsx
import BanNotification from '@/components/BanNotification';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <BanNotification />
        {children}
      </body>
    </html>
  );
}
```

**Estimated Time:** 5 minutes

---

## ✅ STEP 9: Testing

### Multi-Currency Wallet Tests:
```bash
# Test deposits
- [ ] Deposit INR - verify commission deducted
- [ ] Deposit USD - verify commission deducted
- [ ] Deposit USDT - verify commission deducted

# Test withdrawals
- [ ] Withdraw INR - verify balance updated
- [ ] Withdraw USD - verify balance updated
- [ ] Withdraw USDT - verify balance updated

# Test transfers
- [ ] Transfer INR between users - verify commission
- [ ] Transfer USD between users - verify commission
- [ ] Transfer USDT between users - verify commission

# Test default currency
- [ ] Set default currency to each option
- [ ] Verify dashboard shows correct currency
- [ ] Verify preference persists after logout/login
```

### Admin Panel Tests:
```bash
# Dashboard
- [ ] Stats show real numbers
- [ ] Charts display real data
- [ ] Recent activities list real transactions

# Users
- [ ] User list shows real users
- [ ] Add user creates new account
- [ ] Edit user updates details
- [ ] Ban user shows notification to user
- [ ] Reset password generates new password
- [ ] Unban user removes ban

# Wallet
- [ ] All 3 currency wallets display correctly
- [ ] Commission settings update
- [ ] Withdraw from each wallet works
- [ ] Recent commissions show real data

# Settings
- [ ] Change admin email works
- [ ] Change admin password works
```

---

## 📊 Progress Tracker

| Task | Status | Time Est | Priority |
|------|--------|----------|----------|
| Database Migration | ✅ Ready | 15 min | 🔴 CRITICAL |
| Replace User WalletSection | ✅ Ready | 5 min | 🔴 HIGH |
| Update Dashboard Overview | ⏳ TODO | 15 min | 🟡 MEDIUM |
| Create Admin WalletSection | ⏳ TODO | 4-6 hrs | 🔴 HIGH |
| Update Admin UsersSection | ⏳ TODO | 3-4 hrs | 🔴 HIGH |
| Update Admin OverviewSection | ⏳ TODO | 3-4 hrs | 🟡 MEDIUM |
| Update Admin SettingsSection | ⏳ TODO | 2-3 hrs | 🟢 LOW |
| Add Ban Notification | ⏳ TODO | 5 min | 🟡 MEDIUM |
| Testing | ⏳ TODO | 4-6 hrs | 🔴 CRITICAL |

**Total Remaining Time:** 14-20 hours of development

---

## 🎯 Quick Start Checklist

Today's Priority (Can complete in 1-2 hours):
- [x] Run database migration
- [ ] Replace User WalletSection
- [ ] Update Dashboard Overview
- [ ] Add Ban Notification to layout
- [ ] Test basic wallet operations

Tomorrow's Priority:
- [ ] Create new Admin WalletSection
- [ ] Update Admin UsersSection
- [ ] Test admin functionality

Final Day:
- [ ] Update remaining admin sections
- [ ] Complete comprehensive testing
- [ ] Deploy to production

---

## 🆘 Troubleshooting

### Migration Fails
- Check DATABASE_URL is correct
- Ensure you have proper permissions
- Try running statements individually

### API Errors
- Check browser console for errors
- Verify AUTH token is present
- Check server logs: `npm run dev`

### Component Errors
- Ensure all imports are correct
- Check TypeScript types match
- Verify API responses match expected format

### Commission Not Working
- Check commission_settings table has data
- Verify commission_on_deposits and commission_on_transfers flags
- Check admin_wallets are being credited

---

**Need Help?** Refer to:
- `IMPLEMENTATION_GUIDE.md` - Detailed instructions
- `QUICK_REFERENCE.md` - Code snippets
- `COMPLETED_FEATURES.md` - What's already done

**Last Updated:** 2025-10-13 08:56 UTC

# Quick Reference - Critical Code Snippets

## 1. Run Database Migration

```bash
# First, backup your database
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Then run the migration
psql $DATABASE_URL -f src/lib/db/migrations/001_multi_currency_wallet.sql

# Verify migration
psql $DATABASE_URL -c "SELECT * FROM admin_wallets;"
psql $DATABASE_URL -c "SELECT * FROM commission_settings;"
```

## 2. Update db/index.ts to Export New Tables

Add to `src/lib/db/index.ts`:

```typescript
export { 
  users, 
  profiles, 
  tasks, 
  applications, 
  messages, 
  wallet_transactions,
  payment_transactions,
  admin_settings,
  admin_wallets,        // ADD THIS
  commission_settings   // ADD THIS
} from './schema';
```

## 3. API Client Helper Functions

Add to `src/lib/api-client.ts` or create new file:

```typescript
// Wallet operations
export async function updateWalletBalance(
  userId: string, 
  amount: number, 
  type: 'credit' | 'debit',
  currency: 'INR' | 'USD' | 'USDT',
  applyCommission = false
) {
  const response = await fetch('/api/wallet/balance', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, amount, type, currency, applyCommission }),
  });
  return response.json();
}

// Admin wallet operations
export async function getAdminWalletData() {
  const response = await fetch('/api/admin/wallet');
  return response.json();
}

export async function withdrawAdminFunds(currency: string, amount: number) {
  const response = await fetch('/api/admin/wallet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ currency, amount }),
  });
  return response.json();
}

export async function updateCommissionSettings(settings: any) {
  const response = await fetch('/api/admin/wallet', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  return response.json();
}

// Ban operations
export async function banUser(userId: string, reason: string, duration: number) {
  const response = await fetch('/api/admin/users/ban', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, reason, duration }),
  });
  return response.json();
}

export async function unbanUser(userId: string) {
  const response = await fetch(`/api/admin/users/ban?userId=${userId}`, {
    method: 'DELETE',
  });
  return response.json();
}
```

## 4. Currency Helper Functions

Create `src/lib/currency.ts`:

```typescript
export type Currency = 'INR' | 'USD' | 'USDT';

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  INR: '₹',
  USD: '$',
  USDT: '₮',
};

export const CURRENCY_NAMES: Record<Currency, string> = {
  INR: 'Indian Rupee',
  USD: 'US Dollar',
  USDT: 'Tether',
};

// Simple exchange rates (in production, fetch from API)
export const EXCHANGE_RATES = {
  INR: 1,
  USD: 83.50, // 1 USD = 83.50 INR
  USDT: 83.50, // 1 USDT = 83.50 INR
};

export function formatCurrency(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toLocaleString('en-IN', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`;
}

export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
  if (from === to) return amount;
  
  // Convert to INR first, then to target currency
  const inINR = amount * EXCHANGE_RATES[from];
  return inINR / EXCHANGE_RATES[to];
}

export function getCurrencySymbol(currency: Currency): string {
  return CURRENCY_SYMBOLS[currency];
}
```

## 5. Update Profile API to Include New Fields

Update `src/app/api/profile/[userId]/route.ts`:

```typescript
// In PATCH handler, add support for default_currency
const { default_currency, ...otherUpdates } = body;

if (default_currency && ['INR', 'USD', 'USDT'].includes(default_currency)) {
  await db
    .update(profiles)
    .set({ default_currency, ...otherUpdates })
    .where(eq(profiles.user_id, userId));
}
```

## 6. Ban Notification Component

Create `src/components/BanNotification.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function BanNotification() {
  const { user } = useAuth();
  const [showBan, setShowBan] = useState(false);

  useEffect(() => {
    if (user?.is_banned) {
      // Check if ban has expired
      if (user.ban_expires_at) {
        const expiryDate = new Date(user.ban_expires_at);
        if (expiryDate > new Date()) {
          setShowBan(true);
        }
      } else {
        // Permanent ban
        setShowBan(true);
      }
    } else {
      setShowBan(false);
    }
  }, [user]);

  if (!showBan) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold text-red-600 mb-4">
            Account Suspended
          </h2>
          
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 mb-6 text-left">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Reason:</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {user?.ban_reason || 'Violation of terms of service'}
            </p>
            
            {user?.ban_expires_at ? (
              <>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Expires on:</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(user.ban_expires_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </>
            ) : (
              <div className="bg-red-100 dark:bg-red-900/40 rounded-lg p-4">
                <p className="text-red-700 dark:text-red-400 font-bold text-center">
                  This is a permanent suspension
                </p>
              </div>
            )}
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            If you believe this is a mistake, please contact our support team.
          </p>
          
          <a 
            href="mailto:support@example.com"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
}
```

## 7. Admin Dashboard Stats API

Create `src/app/api/admin/stats/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db, users, tasks, profiles, wallet_transactions, admin_wallets } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { sql, eq, gte, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Total users
    const [totalUsers] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(users);

    // Active tasks
    const [activeTasks] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(tasks)
      .where(eq(tasks.status, 'open'));

    // Total revenue from all admin wallets
    const adminWallets = await db.select().from(admin_wallets);
    const totalRevenue = adminWallets.reduce((sum, w) => sum + parseFloat(w.balance), 0);
    
    // Commission rate
    const [settings] = await db
      .select()
      .from(commission_settings)
      .limit(1);

    // Revenue over time (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const revenueOverTime = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'Mon YYYY')`,
        total: sql<number>`SUM(CAST(commission_amount AS DECIMAL))`,
      })
      .from(wallet_transactions)
      .where(gte(wallet_transactions.created_at, twelveMonthsAgo))
      .groupBy(sql`TO_CHAR(created_at, 'Mon YYYY')`)
      .orderBy(sql`TO_CHAR(created_at, 'Mon YYYY')`);

    // User growth (last 12 months)
    const userGrowth = await db
      .select({
        month: sql<string>`TO_CHAR(created_at, 'Mon YYYY')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(users)
      .where(gte(users.created_at, twelveMonthsAgo))
      .groupBy(sql`TO_CHAR(created_at, 'Mon YYYY')`)
      .orderBy(sql`TO_CHAR(created_at, 'Mon YYYY')`);

    // Recent activities
    const recentActivities = await db
      .select({
        id: wallet_transactions.id,
        user_id: wallet_transactions.user_id,
        amount: wallet_transactions.amount,
        type: wallet_transactions.type,
        currency: wallet_transactions.currency,
        description: wallet_transactions.description,
        created_at: wallet_transactions.created_at,
      })
      .from(wallet_transactions)
      .orderBy(desc(wallet_transactions.created_at))
      .limit(20);

    return NextResponse.json({
      totalUsers: totalUsers.count,
      activeTasks: activeTasks.count,
      totalRevenue: totalRevenue.toFixed(2),
      commissionRate: settings?.commission_percentage || 2,
      revenueOverTime,
      userGrowth,
      recentActivities,
      adminWallets,
    });
  } catch (error) {
    console.error('Get admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
```

## 8. Quick Test Commands

```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"

# Check new tables exist
psql $DATABASE_URL -c "\dt"

# View admin wallets
psql $DATABASE_URL -c "SELECT * FROM admin_wallets;"

# View commission settings
psql $DATABASE_URL -c "SELECT * FROM commission_settings;"

# Check profile columns
psql $DATABASE_URL -c "\d profiles"

# Test multi-currency balance
psql $DATABASE_URL -c "SELECT user_id, wallet_balance_inr, wallet_balance_usd, wallet_balance_usdt, default_currency FROM profiles LIMIT 5;"
```

## 9. Environment Variables Check

Ensure these are set in `.env.local`:

```bash
# Database
DATABASE_URL=your_neon_database_url

# Auth
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret

# Optional: Payment gateways
PHONEPE_MERCHANT_ID=your_phonepe_id
PHONEPE_KEY_INDEX=1
PHONEPE_SECRET_KEY=your_phonepe_secret

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_SECRET_KEY=your_paypal_secret
```

## 10. Quick Development Server Commands

```bash
# Install dependencies (if needed)
npm install

# Run database migration
npm run db:migrate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

---

## Priority Order for Implementation

1. **Run database migration** (Critical - do this first!)
2. **Update db/index.ts** exports
3. **Test admin wallet API** (`/api/admin/wallet`)
4. **Create ban notification component**
5. **Update user WalletSection** for multi-currency
6. **Update admin WalletSection** for multi-currency
7. **Update payment system** for multi-currency
8. **Update admin dashboard** with real data
9. **Test everything thoroughly**

---

## Common Issues & Solutions

### Issue: Migration fails
**Solution:** Check database connection, ensure you have proper permissions

### Issue: API returns 401 Unauthorized
**Solution:** Check JWT token is being sent, verify auth middleware

### Issue: Commission not being credited
**Solution:** Check commission_settings table has data, verify applyCommission flag

### Issue: Currency conversion incorrect
**Solution:** Update EXCHANGE_RATES in currency.ts with current rates

### Issue: Ban notification not showing
**Solution:** Ensure BanNotification is imported in root layout, check user.is_banned field

---

**Last Updated:** 2025-10-12

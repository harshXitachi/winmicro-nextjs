-- Migration: Multi-Currency Wallet System and Admin Panel Enhancements
-- Date: 2025-10-12

-- Add ban fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ban_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMP;

-- Add multi-currency wallet fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_inr DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usd DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS wallet_balance_usdt DECIMAL(10, 2) DEFAULT 0.00 NOT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'INR' NOT NULL;

-- Migrate existing wallet_balance to wallet_balance_inr
UPDATE profiles SET wallet_balance_inr = wallet_balance WHERE wallet_balance_inr = 0;

-- Add currency field to wallet_transactions
ALTER TABLE wallet_transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'INR' NOT NULL;

-- Create admin_wallets table
CREATE TABLE IF NOT EXISTS admin_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  currency VARCHAR(10) UNIQUE NOT NULL,
  balance DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
  total_commission_earned DECIMAL(15, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create commission_settings table
CREATE TABLE IF NOT EXISTS commission_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  commission_percentage DECIMAL(5, 2) DEFAULT 2.00 NOT NULL,
  commission_on_deposits BOOLEAN DEFAULT TRUE NOT NULL,
  commission_on_transfers BOOLEAN DEFAULT TRUE NOT NULL,
  min_deposit_inr DECIMAL(10, 2) DEFAULT 100.00,
  max_deposit_inr DECIMAL(10, 2) DEFAULT 100000.00,
  min_deposit_usd DECIMAL(10, 2) DEFAULT 2.00,
  max_deposit_usd DECIMAL(10, 2) DEFAULT 5000.00,
  min_deposit_usdt DECIMAL(10, 2) DEFAULT 2.00,
  max_deposit_usdt DECIMAL(10, 2) DEFAULT 5000.00,
  min_withdrawal_inr DECIMAL(10, 2) DEFAULT 500.00,
  max_withdrawal_inr DECIMAL(10, 2) DEFAULT 50000.00,
  min_withdrawal_usd DECIMAL(10, 2) DEFAULT 10.00,
  max_withdrawal_usd DECIMAL(10, 2) DEFAULT 2000.00,
  min_withdrawal_usdt DECIMAL(10, 2) DEFAULT 10.00,
  max_withdrawal_usdt DECIMAL(10, 2) DEFAULT 2000.00,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Initialize admin wallets for each currency
INSERT INTO admin_wallets (currency, balance, total_commission_earned)
VALUES 
  ('INR', 0.00, 0.00),
  ('USD', 0.00, 0.00),
  ('USDT', 0.00, 0.00)
ON CONFLICT (currency) DO NOTHING;

-- Initialize commission settings with defaults
INSERT INTO commission_settings (commission_percentage, commission_on_deposits, commission_on_transfers)
VALUES (2.00, TRUE, TRUE)
ON CONFLICT DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON users(is_banned);
CREATE INDEX IF NOT EXISTS idx_users_ban_expires_at ON users(ban_expires_at);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_currency ON wallet_transactions(currency);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_user_currency ON wallet_transactions(user_id, currency);
CREATE INDEX IF NOT EXISTS idx_profiles_default_currency ON profiles(default_currency);

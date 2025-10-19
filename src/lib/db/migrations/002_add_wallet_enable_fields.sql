-- Migration: Add Wallet Enable/Disable Fields
-- Date: 2025-10-13

-- Add wallet enable fields to commission_settings table
ALTER TABLE commission_settings ADD COLUMN IF NOT EXISTS inr_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE commission_settings ADD COLUMN IF NOT EXISTS usd_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL;
ALTER TABLE commission_settings ADD COLUMN IF NOT EXISTS usdt_wallet_enabled BOOLEAN DEFAULT TRUE NOT NULL;

-- Update existing record with default values
UPDATE commission_settings 
SET 
  inr_wallet_enabled = TRUE,
  usd_wallet_enabled = TRUE,
  usdt_wallet_enabled = TRUE
WHERE inr_wallet_enabled IS NULL;

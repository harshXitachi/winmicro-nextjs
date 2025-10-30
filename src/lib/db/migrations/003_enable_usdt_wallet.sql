-- Enable USDT Wallet
-- This migration enables the USDT wallet for crypto payments

UPDATE commission_settings 
SET usdt_wallet_enabled = TRUE 
WHERE usdt_wallet_enabled = FALSE OR usdt_wallet_enabled IS NULL;

-- If no commission settings exist, create default
INSERT INTO commission_settings (
  commission_percentage,
  commission_on_deposits,
  commission_on_transfers,
  inr_wallet_enabled,
  usd_wallet_enabled,
  usdt_wallet_enabled,
  min_deposit_usdt,
  max_deposit_usdt,
  min_withdrawal_usdt,
  max_withdrawal_usdt
)
SELECT 
  2.00,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  TRUE,
  2.00,
  5000.00,
  10.00,
  2000.00
WHERE NOT EXISTS (SELECT 1 FROM commission_settings);

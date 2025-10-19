-- Campaign System Migration
-- This migration creates all tables for the Campaign Hub feature

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('one-off', 'ongoing')),
  category VARCHAR(100) NOT NULL,
  required_skills JSONB DEFAULT '[]'::jsonb,
  target_workers INTEGER NOT NULL,
  current_workers INTEGER DEFAULT 0 NOT NULL,
  base_payment DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR' NOT NULL CHECK (currency IN ('INR', 'USD', 'USDT')),
  payment_model VARCHAR(50) DEFAULT 'fixed' NOT NULL CHECK (payment_model IN ('fixed', 'milestone')),
  visibility VARCHAR(20) DEFAULT 'public' NOT NULL CHECK (visibility IN ('public', 'private')),
  group_chat_enabled BOOLEAN DEFAULT TRUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  employer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  escrow_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  total_spent DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Campaign members table
CREATE TABLE IF NOT EXISTS campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'worker' NOT NULL CHECK (role IN ('admin', 'worker')),
  status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'removed', 'left')),
  tasks_completed INTEGER DEFAULT 0,
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
  left_at TIMESTAMP,
  UNIQUE(campaign_id, user_id)
);

-- Campaign chat messages table
CREATE TABLE IF NOT EXISTS campaign_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type VARCHAR(50) DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'system', 'payment_notification')),
  metadata JSONB,
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Campaign submissions table
CREATE TABLE IF NOT EXISTS campaign_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  proof_url TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
  review_note TEXT,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Campaign bonus payments table
CREATE TABLE IF NOT EXISTS campaign_bonus_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  from_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR' NOT NULL CHECK (currency IN ('INR', 'USD', 'USDT')),
  note TEXT,
  wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_campaigns_employer ON campaigns(employer_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON campaigns(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_visibility ON campaigns(visibility);

CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_user ON campaign_members(user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_members_status ON campaign_members(status);

CREATE INDEX IF NOT EXISTS idx_campaign_chat_campaign ON campaign_chat_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_chat_sender ON campaign_chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_campaign_chat_created ON campaign_chat_messages(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign ON campaign_submissions(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_worker ON campaign_submissions(worker_id);
CREATE INDEX IF NOT EXISTS idx_campaign_submissions_status ON campaign_submissions(status);

CREATE INDEX IF NOT EXISTS idx_campaign_bonus_campaign ON campaign_bonus_payments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_bonus_from_user ON campaign_bonus_payments(from_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_bonus_to_user ON campaign_bonus_payments(to_user_id);

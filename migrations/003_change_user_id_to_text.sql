-- Migration: Change users.id from UUID to TEXT to support Firebase UIDs
-- This is a destructive operation - backup your data first!

BEGIN;

-- Drop all foreign key constraints that reference users.id
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_id_users_id_fk;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_client_id_users_id_fk;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_freelancer_id_users_id_fk;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_freelancer_id_users_id_fk;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_users_id_fk;
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_recipient_id_users_id_fk;
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_user_id_users_id_fk;
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_from_user_id_users_id_fk;
ALTER TABLE wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_to_user_id_users_id_fk;
ALTER TABLE payment_transactions DROP CONSTRAINT IF EXISTS payment_transactions_user_id_users_id_fk;
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_employer_id_users_id_fk;
ALTER TABLE campaign_members DROP CONSTRAINT IF EXISTS campaign_members_user_id_users_id_fk;
ALTER TABLE campaign_chat_messages DROP CONSTRAINT IF EXISTS campaign_chat_messages_sender_id_users_id_fk;
ALTER TABLE campaign_submissions DROP CONSTRAINT IF EXISTS campaign_submissions_worker_id_users_id_fk;
ALTER TABLE campaign_submissions DROP CONSTRAINT IF EXISTS campaign_submissions_reviewed_by_users_id_fk;
ALTER TABLE campaign_bonus_payments DROP CONSTRAINT IF EXISTS campaign_bonus_payments_from_user_id_users_id_fk;
ALTER TABLE campaign_bonus_payments DROP CONSTRAINT IF EXISTS campaign_bonus_payments_to_user_id_users_id_fk;

-- Change column types
ALTER TABLE users ALTER COLUMN id TYPE TEXT;
ALTER TABLE profiles ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE tasks ALTER COLUMN client_id TYPE TEXT;
ALTER TABLE tasks ALTER COLUMN freelancer_id TYPE TEXT;
ALTER TABLE applications ALTER COLUMN freelancer_id TYPE TEXT;
ALTER TABLE messages ALTER COLUMN sender_id TYPE TEXT;
ALTER TABLE messages ALTER COLUMN recipient_id TYPE TEXT;
ALTER TABLE wallet_transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE wallet_transactions ALTER COLUMN from_user_id TYPE TEXT;
ALTER TABLE wallet_transactions ALTER COLUMN to_user_id TYPE TEXT;
ALTER TABLE payment_transactions ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE campaigns ALTER COLUMN employer_id TYPE TEXT;
ALTER TABLE campaign_members ALTER COLUMN user_id TYPE TEXT;
ALTER TABLE campaign_chat_messages ALTER COLUMN sender_id TYPE TEXT;
ALTER TABLE campaign_submissions ALTER COLUMN worker_id TYPE TEXT;
ALTER TABLE campaign_submissions ALTER COLUMN reviewed_by TYPE TEXT;
ALTER TABLE campaign_bonus_payments ALTER COLUMN from_user_id TYPE TEXT;
ALTER TABLE campaign_bonus_payments ALTER COLUMN to_user_id TYPE TEXT;

-- Re-add foreign key constraints
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD CONSTRAINT tasks_client_id_users_id_fk FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE tasks ADD CONSTRAINT tasks_freelancer_id_users_id_fk FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE applications ADD CONSTRAINT applications_freelancer_id_users_id_fk FOREIGN KEY (freelancer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE messages ADD CONSTRAINT messages_recipient_id_users_id_fk FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_from_user_id_users_id_fk FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_to_user_id_users_id_fk FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE payment_transactions ADD CONSTRAINT payment_transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_employer_id_users_id_fk FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaign_members ADD CONSTRAINT campaign_members_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaign_chat_messages ADD CONSTRAINT campaign_chat_messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaign_submissions ADD CONSTRAINT campaign_submissions_worker_id_users_id_fk FOREIGN KEY (worker_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaign_submissions ADD CONSTRAINT campaign_submissions_reviewed_by_users_id_fk FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE campaign_bonus_payments ADD CONSTRAINT campaign_bonus_payments_from_user_id_users_id_fk FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE campaign_bonus_payments ADD CONSTRAINT campaign_bonus_payments_to_user_id_users_id_fk FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;

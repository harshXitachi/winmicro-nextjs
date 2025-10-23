import { pgTable, text, timestamp, integer, decimal, boolean, jsonb, uuid, varchar } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Firebase UID
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  first_name: varchar('first_name', { length: 100 }),
  last_name: varchar('last_name', { length: 100 }),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  is_banned: boolean('is_banned').default(false).notNull(),
  ban_reason: text('ban_reason'),
  ban_expires_at: timestamp('ban_expires_at'),
  banned_at: timestamp('banned_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Profiles table
export const profiles = pgTable('profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  username: varchar('username', { length: 50 }).unique(),
  avatar_url: text('avatar_url'),
  bio: text('bio'),
  skills: jsonb('skills').$type<string[]>().default(sql`'[]'::jsonb`),
  wallet_balance: decimal('wallet_balance', { precision: 10, scale: 2 }).default('0.00').notNull(), // Deprecated - kept for backward compatibility
  wallet_balance_inr: decimal('wallet_balance_inr', { precision: 10, scale: 2 }).default('0.00').notNull(),
  wallet_balance_usd: decimal('wallet_balance_usd', { precision: 10, scale: 2 }).default('0.00').notNull(),
  wallet_balance_usdt: decimal('wallet_balance_usdt', { precision: 10, scale: 2 }).default('0.00').notNull(),
  default_currency: varchar('default_currency', { length: 10 }).default('INR').notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  total_earnings: decimal('total_earnings', { precision: 10, scale: 2 }).default('0.00'),
  completed_tasks: integer('completed_tasks').default(0),
  success_rate: decimal('success_rate', { precision: 5, scale: 2 }).default('0.00'),
  response_time: varchar('response_time', { length: 50 }),
  level: integer('level').default(1),
  experience_points: integer('experience_points').default(0),
  phone: varchar('phone', { length: 20 }),
  location: text('location'),
  social_links: jsonb('social_links'),
  kyc_status: varchar('kyc_status', { length: 20 }).default('pending'),
  kyc_document_url: text('kyc_document_url'),
  kyc_document_type: varchar('kyc_document_type', { length: 50 }),
  kyc_verified_at: timestamp('kyc_verified_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Tasks table
export const tasks = pgTable('tasks', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  budget: decimal('budget', { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp('deadline'),
  status: varchar('status', { length: 20 }).default('open').notNull(),
  priority: varchar('priority', { length: 20 }).default('medium'),
  client_id: text('client_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  freelancer_id: text('freelancer_id').references(() => users.id, { onDelete: 'set null' }),
  skills_required: jsonb('skills_required').$type<string[]>().default(sql`'[]'::jsonb`),
  applications_count: integer('applications_count').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Applications table
export const applications = pgTable('applications', {
  id: uuid('id').defaultRandom().primaryKey(),
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'cascade' }).notNull(),
  freelancer_id: text('freelancer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  cover_letter: text('cover_letter'),
  proposed_budget: decimal('proposed_budget', { precision: 10, scale: 2 }),
  estimated_duration: varchar('estimated_duration', { length: 100 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Messages table
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sender_id: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  recipient_id: text('recipient_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  application_id: uuid('application_id').references(() => applications.id, { onDelete: 'set null' }),
  content: text('content').notNull(),
  read: boolean('read').default(false).notNull(),
  delivered: boolean('delivered').default(true).notNull(),
  message_type: varchar('message_type', { length: 50 }).default('text'),
  payment_amount: decimal('payment_amount', { precision: 10, scale: 2 }),
  payment_status: varchar('payment_status', { length: 20 }),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Wallet transactions table
export const wallet_transactions = pgTable('wallet_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'credit' or 'debit'
  transaction_type: varchar('transaction_type', { length: 50 }).notNull(), // 'deposit', 'withdrawal', 'task_payment', etc.
  currency: varchar('currency', { length: 10 }).default('INR').notNull(), // 'INR', 'USD', 'USDT'
  description: text('description'),
  status: varchar('status', { length: 20 }).default('completed').notNull(),
  reference_id: varchar('reference_id', { length: 255 }),
  commission_amount: decimal('commission_amount', { precision: 10, scale: 2 }).default('0.00'),
  from_user_id: text('from_user_id').references(() => users.id, { onDelete: 'set null' }),
  to_user_id: text('to_user_id').references(() => users.id, { onDelete: 'set null' }),
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Payment transactions table
export const payment_transactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  task_id: uuid('task_id').references(() => tasks.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  payment_method: varchar('payment_method', { length: 50 }),
  payment_gateway: varchar('payment_gateway', { length: 50 }),
  transaction_id: varchar('transaction_id', { length: 255 }),
  status: varchar('status', { length: 20 }).default('pending').notNull(),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Admin settings table
export const admin_settings = pgTable('admin_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: varchar('key', { length: 100 }).unique().notNull(),
  value: text('value').notNull(),
  description: text('description'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Admin wallets table - Multi-currency support for admin
export const admin_wallets = pgTable('admin_wallets', {
  id: uuid('id').defaultRandom().primaryKey(),
  currency: varchar('currency', { length: 10 }).unique().notNull(), // 'INR', 'USD', 'USDT'
  balance: decimal('balance', { precision: 15, scale: 2 }).default('0.00').notNull(),
  total_commission_earned: decimal('total_commission_earned', { precision: 15, scale: 2 }).default('0.00').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Commission settings table
export const commission_settings = pgTable('commission_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  commission_percentage: decimal('commission_percentage', { precision: 5, scale: 2 }).default('2.00').notNull(),
  commission_on_deposits: boolean('commission_on_deposits').default(true).notNull(),
  commission_on_transfers: boolean('commission_on_transfers').default(true).notNull(),
  inr_wallet_enabled: boolean('inr_wallet_enabled').default(true).notNull(),
  usd_wallet_enabled: boolean('usd_wallet_enabled').default(true).notNull(),
  usdt_wallet_enabled: boolean('usdt_wallet_enabled').default(true).notNull(),
  min_deposit_inr: decimal('min_deposit_inr', { precision: 10, scale: 2 }).default('100.00'),
  max_deposit_inr: decimal('max_deposit_inr', { precision: 10, scale: 2 }).default('100000.00'),
  min_deposit_usd: decimal('min_deposit_usd', { precision: 10, scale: 2 }).default('2.00'),
  max_deposit_usd: decimal('max_deposit_usd', { precision: 10, scale: 2 }).default('5000.00'),
  min_deposit_usdt: decimal('min_deposit_usdt', { precision: 10, scale: 2 }).default('2.00'),
  max_deposit_usdt: decimal('max_deposit_usdt', { precision: 10, scale: 2 }).default('5000.00'),
  min_withdrawal_inr: decimal('min_withdrawal_inr', { precision: 10, scale: 2 }).default('500.00'),
  max_withdrawal_inr: decimal('max_withdrawal_inr', { precision: 10, scale: 2 }).default('50000.00'),
  min_withdrawal_usd: decimal('min_withdrawal_usd', { precision: 10, scale: 2 }).default('10.00'),
  max_withdrawal_usd: decimal('max_withdrawal_usd', { precision: 10, scale: 2 }).default('2000.00'),
  min_withdrawal_usdt: decimal('min_withdrawal_usdt', { precision: 10, scale: 2 }).default('10.00'),
  max_withdrawal_usdt: decimal('max_withdrawal_usdt', { precision: 10, scale: 2 }).default('2000.00'),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Campaigns table
export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'one-off' or 'ongoing'
  category: varchar('category', { length: 100 }).notNull(),
  required_skills: jsonb('required_skills').$type<string[]>().default(sql`'[]'::jsonb`),
  target_workers: integer('target_workers').notNull(),
  current_workers: integer('current_workers').default(0).notNull(),
  base_payment: decimal('base_payment', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  payment_model: varchar('payment_model', { length: 50 }).default('fixed').notNull(), // 'fixed' or 'milestone'
  visibility: varchar('visibility', { length: 20 }).default('public').notNull(), // 'public' or 'private'
  group_chat_enabled: boolean('group_chat_enabled').default(true).notNull(),
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'paused', 'completed', 'cancelled'
  employer_id: text('employer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  escrow_balance: decimal('escrow_balance', { precision: 10, scale: 2 }).default('0.00').notNull(),
  total_spent: decimal('total_spent', { precision: 10, scale: 2 }).default('0.00').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Campaign members table
export const campaign_members = pgTable('campaign_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaign_id: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  user_id: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: varchar('role', { length: 20 }).default('worker').notNull(), // 'admin' (employer) or 'worker'
  status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'removed', 'left'
  tasks_completed: integer('tasks_completed').default(0),
  total_earned: decimal('total_earned', { precision: 10, scale: 2 }).default('0.00'),
  joined_at: timestamp('joined_at').defaultNow().notNull(),
  left_at: timestamp('left_at'),
});

// Campaign chat messages table
export const campaign_chat_messages = pgTable('campaign_chat_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaign_id: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  sender_id: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  message_type: varchar('message_type', { length: 50 }).default('text').notNull(), // 'text', 'system', 'payment_notification'
  metadata: jsonb('metadata'), // For payment notifications, pinned messages, etc.
  is_pinned: boolean('is_pinned').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Campaign submissions table
export const campaign_submissions = pgTable('campaign_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaign_id: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  worker_id: text('worker_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  proof_url: text('proof_url'), // Link to uploaded proof/work
  description: text('description'),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'approved', 'rejected'
  review_note: text('review_note'),
  reviewed_by: text('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewed_at: timestamp('reviewed_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Campaign bonus payments table
export const campaign_bonus_payments = pgTable('campaign_bonus_payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaign_id: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  from_user_id: text('from_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  to_user_id: text('to_user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('INR').notNull(),
  note: text('note'),
  wallet_transaction_id: uuid('wallet_transaction_id').references(() => wallet_transactions.id, { onDelete: 'set null' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

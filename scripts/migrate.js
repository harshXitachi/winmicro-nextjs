require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');

const DATABASE_URL = process.env.DATABASE_URL;

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  const sql = neon(DATABASE_URL);

  try {
    // Drop existing tables (be careful in production!)
    console.log('📦 Dropping existing tables...');
    await sql`DROP TABLE IF EXISTS campaign_bonus_payments CASCADE`;
    await sql`DROP TABLE IF EXISTS campaign_submissions CASCADE`;
    await sql`DROP TABLE IF EXISTS campaign_chat_messages CASCADE`;
    await sql`DROP TABLE IF EXISTS campaign_members CASCADE`;
    await sql`DROP TABLE IF EXISTS campaigns CASCADE`;
    await sql`DROP TABLE IF EXISTS admin_settings CASCADE`;
    await sql`DROP TABLE IF EXISTS payment_transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS wallet_transactions CASCADE`;
    await sql`DROP TABLE IF EXISTS messages CASCADE`;
    await sql`DROP TABLE IF EXISTS applications CASCADE`;
    await sql`DROP TABLE IF EXISTS tasks CASCADE`;
    await sql`DROP TABLE IF EXISTS profiles CASCADE`;
    await sql`DROP TABLE IF EXISTS users CASCADE`;

    // Create users table
    console.log('📦 Creating users table...');
    await sql`
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        is_banned BOOLEAN DEFAULT false NOT NULL,
        ban_reason TEXT,
        ban_expires_at TIMESTAMP,
        banned_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create profiles table
    console.log('📦 Creating profiles table...');
    await sql`
      CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE,
        avatar_url TEXT,
        bio TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        wallet_balance_inr DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        wallet_balance_usd DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        wallet_balance_usdt DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        default_currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        total_earnings DECIMAL(10, 2) DEFAULT 0.00,
        completed_tasks INTEGER DEFAULT 0,
        success_rate DECIMAL(5, 2) DEFAULT 0.00,
        response_time VARCHAR(50),
        level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
        phone VARCHAR(20),
        location TEXT,
        social_links JSONB,
        kyc_status VARCHAR(20) DEFAULT 'pending',
        kyc_document_url TEXT,
        kyc_document_type VARCHAR(50),
        kyc_verified_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create tasks table
    console.log('📦 Creating tasks table...');
    await sql`
      CREATE TABLE tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        budget DECIMAL(10, 2) NOT NULL,
        deadline TIMESTAMP,
        status VARCHAR(20) DEFAULT 'open' NOT NULL,
        priority VARCHAR(20) DEFAULT 'medium',
        client_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        freelancer_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        skills_required JSONB DEFAULT '[]'::jsonb,
        applications_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create applications table
    console.log('📦 Creating applications table...');
    await sql`
      CREATE TABLE applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        freelancer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        proposed_budget DECIMAL(10, 2),
        estimated_duration VARCHAR(100),
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create messages table
    console.log('📦 Creating messages table...');
    await sql`
      CREATE TABLE messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false NOT NULL,
        delivered BOOLEAN DEFAULT true NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        payment_amount DECIMAL(10, 2),
        payment_status VARCHAR(20),
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create wallet_transactions table
    console.log('📦 Creating wallet_transactions table...');
    await sql`
      CREATE TABLE wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed' NOT NULL,
        reference_id VARCHAR(255),
        commission_amount DECIMAL(10, 2) DEFAULT 0.00,
        from_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        to_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create payment_transactions table
    console.log('📦 Creating payment_transactions table...');
    await sql`
      CREATE TABLE payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_method VARCHAR(50),
        payment_gateway VARCHAR(50),
        transaction_id VARCHAR(255),
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create admin_settings table
    console.log('📦 Creating admin_settings table...');
    await sql`
      CREATE TABLE admin_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        key VARCHAR(100) UNIQUE NOT NULL,
        value TEXT NOT NULL,
        description TEXT,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create campaigns table
    console.log('📦 Creating campaigns table...');
    await sql`
      CREATE TABLE campaigns (
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
        employer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        escrow_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        total_spent DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create campaign_members table
    console.log('📦 Creating campaign_members table...');
    await sql`
      CREATE TABLE campaign_members (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) DEFAULT 'worker' NOT NULL CHECK (role IN ('admin', 'worker')),
        status VARCHAR(20) DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'removed', 'left')),
        tasks_completed INTEGER DEFAULT 0,
        total_earned DECIMAL(10, 2) DEFAULT 0.00,
        joined_at TIMESTAMP DEFAULT NOW() NOT NULL,
        left_at TIMESTAMP,
        UNIQUE(campaign_id, user_id)
      )
    `;

    // Create campaign_chat_messages table
    console.log('📦 Creating campaign_chat_messages table...');
    await sql`
      CREATE TABLE campaign_chat_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text' NOT NULL CHECK (message_type IN ('text', 'system', 'payment_notification')),
        metadata JSONB,
        is_pinned BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create campaign_submissions table
    console.log('📦 Creating campaign_submissions table...');
    await sql`
      CREATE TABLE campaign_submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        worker_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        proof_url TEXT,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')),
        review_note TEXT,
        reviewed_by TEXT REFERENCES users(id) ON DELETE SET NULL,
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create campaign_bonus_payments table
    console.log('📦 Creating campaign_bonus_payments table...');
    await sql`
      CREATE TABLE campaign_bonus_payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
        from_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        to_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'INR' NOT NULL CHECK (currency IN ('INR', 'USD', 'USDT')),
        note TEXT,
        wallet_transaction_id UUID REFERENCES wallet_transactions(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create indexes for campaign tables
    console.log('📦 Creating indexes for campaign tables...');
    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_employer ON campaigns(employer_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaign_members_campaign ON campaign_members(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaign_members_user ON campaign_members(user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaign_chat_campaign ON campaign_chat_messages(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaign_submissions_campaign ON campaign_submissions(campaign_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_campaign_bonus_campaign ON campaign_bonus_payments(campaign_id)`;

    // Insert admin user
    console.log('👤 Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    // Generate a Firebase-like UID for admin
    const adminId = 'admin_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
    
    await sql`
      INSERT INTO users (id, email, password, first_name, last_name, role)
      VALUES (${adminId}, ${adminEmail}, ${hashedPassword}, 'Admin', 'User', 'admin')
    `;
    
    await sql`
      INSERT INTO profiles (user_id, username, bio, wallet_balance, wallet_balance_inr, wallet_balance_usd, wallet_balance_usdt, default_currency, rating, level, experience_points, response_time)
      VALUES (${adminId}, 'admin', 'System Administrator', 0.00, 0.00, 0.00, 0.00, 'INR', 5.00, 10, 10000, 'Instant')
    `;

    // Insert default admin settings
    console.log('⚙️ Creating default admin settings...');
    await sql`
      INSERT INTO admin_settings (key, value, description)
      VALUES 
        ('commission_rate', '1.0', 'Platform commission rate (%)'),
        ('commission_enabled', 'true', 'Enable or disable platform commission'),
        ('wallet_enabled', 'true', 'Enable wallet functionality'),
        ('payment_gateway_enabled', 'true', 'Enable payment gateway'),
        ('min_deposit', '10', 'Minimum deposit amount'),
        ('max_deposit', '50000', 'Maximum deposit amount'),
        ('min_withdrawal', '50', 'Minimum withdrawal amount'),
        ('admin_wallet_balance', '25000', 'Admin wallet balance')
    `;

    console.log('📝 Skipping sample data creation...');

    console.log('✅ Database migration completed successfully!');
    console.log('');
    console.log('🔑 Admin Credentials:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('');
    console.log('🔑 Demo User Credentials:');
    console.log('   User 1: sarah@example.com / password123');
    console.log('   User 2: mike@example.com / password123');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

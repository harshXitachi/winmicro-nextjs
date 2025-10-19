import { neon } from '@neondatabase/serverless';
import * as bcrypt from 'bcryptjs';

const DATABASE_URL = process.env.DATABASE_URL!;

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  const sql = neon(DATABASE_URL);

  try {
    // Drop existing tables (be careful in production!)
    console.log('📦 Dropping existing tables...');
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
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        first_name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user' NOT NULL,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create profiles table
    console.log('📦 Creating profiles table...');
    await sql`
      CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username VARCHAR(50) UNIQUE,
        avatar_url TEXT,
        bio TEXT,
        skills JSONB DEFAULT '[]'::jsonb,
        wallet_balance DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
        rating DECIMAL(3, 2) DEFAULT 0.00,
        total_earnings DECIMAL(10, 2) DEFAULT 0.00,
        completed_tasks INTEGER DEFAULT 0,
        success_rate DECIMAL(5, 2) DEFAULT 0.00,
        response_time VARCHAR(50),
        level INTEGER DEFAULT 1,
        experience_points INTEGER DEFAULT 0,
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
        client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        freelancer_id UUID REFERENCES users(id) ON DELETE SET NULL,
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
        freelancer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
        sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        read BOOLEAN DEFAULT false NOT NULL,
        delivered BOOLEAN DEFAULT true NOT NULL,
        message_type VARCHAR(50) DEFAULT 'text',
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create wallet_transactions table
    console.log('📦 Creating wallet_transactions table...');
    await sql`
      CREATE TABLE wallet_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DECIMAL(10, 2) NOT NULL,
        type VARCHAR(20) NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'completed' NOT NULL,
        reference_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;

    // Create payment_transactions table
    console.log('📦 Creating payment_transactions table...');
    await sql`
      CREATE TABLE payment_transactions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

    // Insert admin user
    console.log('👤 Creating admin user...');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin1';
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminResult = await sql`
      INSERT INTO users (email, password, first_name, last_name, role)
      VALUES (${adminEmail}, ${hashedPassword}, 'Admin', 'User', 'admin')
      RETURNING id
    `;
    
    const adminId = adminResult[0].id;
    
    await sql`
      INSERT INTO profiles (user_id, username, bio, wallet_balance, rating, level, experience_points, response_time)
      VALUES (${adminId}, 'admin', 'System Administrator', 50000.00, 5.00, 10, 10000, 'Instant')
    `;

    // Insert default admin settings
    console.log('⚙️ Creating default admin settings...');
    await sql`
      INSERT INTO admin_settings (key, value, description)
      VALUES 
        ('commission_rate', '5', 'Platform commission rate (%)'),
        ('wallet_enabled', 'true', 'Enable wallet functionality'),
        ('payment_gateway_enabled', 'true', 'Enable payment gateway'),
        ('min_deposit', '10', 'Minimum deposit amount'),
        ('max_deposit', '50000', 'Maximum deposit amount'),
        ('min_withdrawal', '50', 'Minimum withdrawal amount'),
        ('admin_wallet_balance', '25000', 'Admin wallet balance')
    `;

    // Create sample tasks
    console.log('📝 Creating sample tasks...');
    
    // Create a few demo users
    const demoUser1Password = await bcrypt.hash('password123', 10);
    const user1Result = await sql`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ('sarah@example.com', ${demoUser1Password}, 'Sarah', 'Johnson')
      RETURNING id
    `;
    const user1Id = user1Result[0].id;
    
    await sql`
      INSERT INTO profiles (user_id, username, wallet_balance, rating, completed_tasks, total_earnings)
      VALUES (${user1Id}, 'sarahj', 1000.00, 4.8, 15, 12500.00)
    `;

    const demoUser2Password = await bcrypt.hash('password123', 10);
    const user2Result = await sql`
      INSERT INTO users (email, password, first_name, last_name)
      VALUES ('mike@example.com', ${demoUser2Password}, 'Mike', 'Chen')
      RETURNING id
    `;
    const user2Id = user2Result[0].id;
    
    await sql`
      INSERT INTO profiles (user_id, username, wallet_balance, rating, completed_tasks, total_earnings)
      VALUES (${user2Id}, 'mikechen', 1500.00, 4.9, 22, 18750.00)
    `;

    // Create sample tasks
    await sql`
      INSERT INTO tasks (title, description, category, budget, deadline, status, priority, client_id, skills_required)
      VALUES 
        (
          'Design a Modern Logo',
          'I need a professional logo for my startup company. The logo should be modern, clean, and represent innovation in technology.',
          'Design',
          2500.00,
          NOW() + INTERVAL '7 days',
          'open',
          'high',
          ${user1Id},
          '["Graphic Design", "Adobe Illustrator", "Branding"]'::jsonb
        ),
        (
          'WordPress Website Development',
          'Need a responsive WordPress website for my restaurant business. Should include menu, gallery, contact form, and online reservation system.',
          'Web Development',
          15000.00,
          NOW() + INTERVAL '14 days',
          'open',
          'medium',
          ${user2Id},
          '["WordPress", "PHP", "Responsive Design"]'::jsonb
        ),
        (
          'Social Media Content Creation',
          'Looking for someone to create engaging social media content for Instagram and Facebook. Need 20 posts with graphics and captions.',
          'Content Writing',
          3000.00,
          NOW() + INTERVAL '10 days',
          'open',
          'low',
          ${user1Id},
          '["Content Writing", "Social Media", "Canva"]'::jsonb
        )
    `;

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

// Run migration if this file is executed directly
if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default migrate;

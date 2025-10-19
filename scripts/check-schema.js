require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkSchema() {
  try {
    console.log('Checking users table schema...');
    const result = await sql`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`;
    
    console.log('\nUsers table columns:');
    result.forEach(row => {
      console.log(' - ' + row.column_name);
    });
    
    console.log('\nTotal columns: ' + result.length);
  } catch (error) {
    console.error('Error:', error);
  }
}

checkSchema().then(() => process.exit(0));

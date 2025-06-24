const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY; // Service role key

// Check if we have the necessary credentials
if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL in environment variables');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_SERVICE_KEY in environment variables');
  console.error('This script requires a service role key to bypass RLS policies');
  console.error('Please add it to your .env file or export it as an environment variable');
  process.exit(1);
}

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testDatabase() {
  console.log('🔍 Testing database with service role...');
  
  try {
    // Test founders table
    console.log('\n1️⃣ Testing founders table...');
    const { data: founders, error: foundersError } = await supabase
      .from('founders')
      .select('*')
      .limit(5);
      
    if (foundersError) {
      console.error('❌ Error accessing founders table:', foundersError.message);
    } else {
      console.log('✅ Successfully accessed founders table');
      console.log(`   Found ${founders.length} records`);
      
      // Display the first record if available
      if (founders.length > 0) {
        console.log('   Sample record:');
        console.log(`   - ID: ${founders[0].id}`);
        console.log(`   - User ID: ${founders[0].user_id}`);
        console.log(`   - Name: ${founders[0].name || 'N/A'}`);
      }
    }
    
    // Test connections table
    console.log('\n2️⃣ Testing connections table...');
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .limit(5);
      
    if (connectionsError) {
      console.error('❌ Error accessing connections table:', connectionsError.message);
    } else {
      console.log('✅ Successfully accessed connections table');
      console.log(`   Found ${connections.length} records`);
      
      // Display the first record if available
      if (connections.length > 0) {
        console.log('   Sample record:');
        console.log(`   - ID: ${connections[0].id}`);
        console.log(`   - Founder A: ${connections[0].founder_a_id}`);
        console.log(`   - Founder B: ${connections[0].founder_b_id}`);
        console.log(`   - Status: ${connections[0].status || 'N/A'}`);
      }
    }
    
    // Test our helper functions
    console.log('\n3️⃣ Testing helper functions...');
    
    // Test UUID validation function
    const { data: uuidResult, error: uuidError } = await supabase.rpc(
      'is_valid_uuid',
      { str: '123e4567-e89b-12d3-a456-426614174000' }
    );
    
    if (uuidError) {
      console.error('❌ Error calling is_valid_uuid function:', uuidError.message);
    } else {
      console.log('✅ Successfully called is_valid_uuid function');
      console.log(`   Result: ${uuidResult}`);
    }
    
    console.log('\n✅ Database test complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

testDatabase();

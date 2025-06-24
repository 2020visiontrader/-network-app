const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const refreshToken = process.env.SUPABASE_REFRESH_TOKEN;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

if (!accessToken || !refreshToken) {
  console.error('❌ Missing authentication tokens in environment variables');
  console.error('Run this script using persistent-auth.js: node persistent-auth.js run explicit-test.js');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  console.log('🔍 Testing database with authenticated session...');
  
  try {
    // Set the session
    console.log('🔐 Setting authenticated session...');
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    
    if (sessionError) {
      console.error('❌ Error setting session:', sessionError.message);
      return;
    }
    
    // Check current user
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError.message);
      return;
    }
    
    if (userData && userData.user) {
      console.log('✅ Authenticated as:', userData.user.email);
      console.log('🆔 User ID:', userData.user.id);
    } else {
      console.log('❌ Not authenticated');
      return;
    }
    
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
    
    console.log('\n✅ Test complete!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabase();

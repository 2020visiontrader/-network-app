const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function detailedUserCreationTest() {
  console.log('🔍 Detailed User Creation Test...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test just the auth sign up without profile creation
    console.log('1️⃣ Testing auth sign up only...');
    const testEmail = `test-detailed-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    console.log('📧 Attempting to sign up:', testEmail);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Auth sign up failed:', error.message);
      console.error('Error code:', error.status);
      console.error('Full error:', error);
      return;
    }

    if (!data.user) {
      console.error('❌ No user returned from sign up');
      console.log('Full response data:', data);
      return;
    }

    console.log('✅ Auth sign up successful!');
    console.log('🆔 User ID:', data.user.id);
    console.log('📧 User email:', data.user.email);
    console.log('✅ Email confirmed:', data.user.email_confirmed_at ? 'Yes' : 'No');
    console.log('📋 Full user data:', data.user);

    // Check if we can get session
    console.log('\n2️⃣ Checking session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else {
      console.log('✅ Session status:', sessionData.session ? 'Active' : 'None');
    }

    console.log('\n✅ Detailed test completed');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test the database schema
async function testDatabaseSchema() {
  console.log('\n📊 Testing Database Schema...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Check if founders table exists and its structure
    console.log('1️⃣ Checking founders table...');
    
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .limit(0); // Just to check schema, no data needed

    if (error) {
      console.error('❌ Founders table error:', error.message);
      console.error('Error code:', error.code);
      
      if (error.code === '42P01') {
        console.log('🚨 Table does not exist!');
      }
      return;
    }

    console.log('✅ Founders table exists and is accessible');

    // Try to get table info with a simple query
    const { data: sampleData, error: sampleError } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_complete')
      .limit(3);

    if (sampleError) {
      console.error('❌ Sample query failed:', sampleError.message);
    } else {
      console.log('✅ Sample query successful');
      console.log('📝 Current founders count:', sampleData?.length || 0);
      if (sampleData && sampleData.length > 0) {
        console.log('👥 Sample founders:', sampleData);
      }
    }

  } catch (error) {
    console.error('❌ Schema test error:', error.message);
  }
}

async function runDetailedTests() {
  await testDatabaseSchema();
  await detailedUserCreationTest();
}

runDetailedTests().catch(console.error);

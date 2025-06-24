/**
 * RLS Status Check
 * 
 * This script checks if we can connect to Supabase and
 * verifies the current state of RLS policies.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create anonymous client
const anonClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Check environment
console.log('🔑 Environment Check:');
console.log(`- SUPABASE_URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`- SUPABASE_ANON_KEY: ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`);

// Test anonymous access
async function testAnonymousAccess() {
  console.log('\n1. Testing Anonymous Access (should be restricted)');
  console.log('---------------------------------------------');
  
  try {
    // Try to select from founders table
    const { data: founders, error: selectError } = await anonClient
      .from('founders')
      .select('count(*)', { count: 'exact', head: true });
    
    if (selectError) {
      console.log('✅ Anonymous SELECT correctly restricted with error:');
      console.log(`   ${selectError.code}: ${selectError.message}`);
    } else {
      console.log('⚠️ Anonymous SELECT not restricted!');
      console.log('   This suggests RLS policies may not be working correctly.');
    }
    
    // Try to insert into founders table
    const { error: insertError } = await anonClient
      .from('founders')
      .insert({
        name: 'Anonymous Test',
        email: 'test@example.com',
        bio: 'This should fail',
        profile_visible: true
      });
    
    if (insertError) {
      console.log('\n✅ Anonymous INSERT correctly restricted with error:');
      console.log(`   ${insertError.code}: ${insertError.message}`);
    } else {
      console.log('\n⚠️ Anonymous INSERT not restricted!');
      console.log('   This is a serious security issue.');
    }
    
  } catch (err) {
    console.error('❌ Test error:', err.message);
  }
}

// Test authenticated access (we'll create a test user)
async function testBasicAuthentication() {
  console.log('\n2. Testing Basic Authentication');
  console.log('----------------------------');
  
  try {
    // Create a random test email
    const testEmail = `test-${Math.random().toString(36).substring(2, 10)}@example.com`;
    const testPassword = 'TestPassword123!';
    
    console.log(`Creating test user: ${testEmail}`);
    
    // Sign up a new user
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (signUpError) {
      console.log('❌ Sign up failed:', signUpError.message);
      return false;
    }
    
    console.log('✅ User created successfully');
    console.log(`   User ID: ${signUpData.user.id}`);
    
    // Sign in with the new user
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Sign in failed:', signInError.message);
      return false;
    }
    
    console.log('✅ Signed in successfully');
    
    // Check if RLS allows the user to query the founders table
    const { data: founders, error: foundersError } = await anonClient
      .from('founders')
      .select('*')
      .eq('user_id', signUpData.user.id);
    
    if (foundersError) {
      console.log('❌ Authenticated query failed:', foundersError.message);
    } else {
      console.log('✅ Authenticated query succeeded');
      console.log(`   Found ${founders.length} founder records for this user`);
      
      if (founders.length === 0) {
        console.log('   This is expected if:');
        console.log('   1. The user is new and has no records yet');
        console.log('   2. The auth trigger has not created a founder record');
      }
    }
    
    return signUpData.user.id;
  } catch (err) {
    console.error('❌ Test error:', err.message);
    return false;
  }
}

// Main function
async function checkRlsStatus() {
  console.log('🔒 RLS STATUS CHECK');
  console.log('=================');
  
  await testAnonymousAccess();
  const userId = await testBasicAuthentication();
  
  console.log('\n✅ RLS STATUS CHECK COMPLETE');
  
  if (userId) {
    console.log('\n⚠️ Remember to manually delete the test user from your Supabase dashboard:');
    console.log(`   User ID: ${userId}`);
  }
  
  console.log('\nNext steps:');
  console.log('1. If anonymous access is NOT restricted, run the ultimate-founders-rls-policies.sql script');
  console.log('2. Run the RLS verification tests: node ultimate-rls-verification.js');
}

checkRlsStatus();

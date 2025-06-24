// Complete RLS Policy Testing
// This script tests RLS policies through the Supabase API

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || !supabaseAnonKey) {
  console.error('⛔ Missing environment variables for Supabase connection');
  console.error('  Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase clients
const adminClient = createClient(supabaseUrl, supabaseKey);
const anonClient = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to generate random data
function generateRandomData() {
  return {
    name: `Test User ${Math.floor(Math.random() * 10000)}`,
    email: `test${Math.floor(Math.random() * 10000)}@example.com`,
    linkedin: `https://linkedin.com/in/test-${Math.floor(Math.random() * 10000)}`,
    profile_visible: Math.random() > 0.5
  };
}

// Helper function to create a test user
async function createTestUser(email, password) {
  try {
    const { data: userData, error: userError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    });

    if (userError) {
      console.error('Error creating test user:', userError);
      return null;
    }

    return userData.user;
  } catch (err) {
    console.error('Exception creating test user:', err);
    return null;
  }
}

// Helper function to sign in as a user
async function signInAsUser(email, password) {
  try {
    const { data, error } = await anonClient.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in as user:', error);
      return null;
    }

    // Create a new client with the user's session
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${data.session.access_token}`
        }
      }
    });
  } catch (err) {
    console.error('Exception signing in as user:', err);
    return null;
  }
}

// Test function to verify RLS policies
async function testRlsPolicies() {
  console.log('🔄 Testing RLS policies through the API...\n');
  
  // Create two test users
  const userAEmail = `user-a-${Math.floor(Math.random() * 10000)}@example.com`;
  const userBEmail = `user-b-${Math.floor(Math.random() * 10000)}@example.com`;
  const password = 'Test1234!';
  
  console.log(`Creating test users: ${userAEmail} and ${userBEmail}`);
  const userA = await createTestUser(userAEmail, password);
  const userB = await createTestUser(userBEmail, password);
  
  if (!userA || !userB) {
    console.error('❌ Failed to create test users. Aborting test.');
    return;
  }
  
  console.log('✅ Test users created successfully');
  
  // Sign in as the users
  console.log(`Signing in as ${userAEmail}`);
  const userAClient = await signInAsUser(userAEmail, password);
  console.log(`Signing in as ${userBEmail}`);
  const userBClient = await signInAsUser(userBEmail, password);
  
  if (!userAClient || !userBClient) {
    console.error('❌ Failed to sign in as test users. Aborting test.');
    return;
  }
  
  console.log('✅ Successfully signed in as both users');
  
  // Test 1: UserA creates their own founder record (should succeed)
  console.log('\n🧪 TEST 1: UserA creates their own founder record');
  const userAData = generateRandomData();
  const { data: founderA, error: founderAError } = await userAClient
    .from('founders')
    .insert([{ 
      user_id: userA.id,
      ...userAData
    }])
    .select();
  
  if (founderAError) {
    console.error('❌ TEST 1 FAILED: UserA could not create their own founder record:', founderAError);
  } else {
    console.log('✅ TEST 1 PASSED: UserA successfully created their own founder record');
    console.log('  Founder ID:', founderA[0].id);
  }
  
  // Test 2: UserA tries to create a founder record for UserB (should fail)
  console.log('\n🧪 TEST 2: UserA tries to create a founder record for UserB');
  const userBData = generateRandomData();
  const { data: founderImpostor, error: founderImpostorError } = await userAClient
    .from('founders')
    .insert([{ 
      user_id: userB.id,
      ...userBData
    }])
    .select();
  
  if (founderImpostorError) {
    console.log('✅ TEST 2 PASSED: UserA was prevented from creating a founder record for UserB');
    console.log('  Error:', founderImpostorError.message);
  } else {
    console.error('❌ TEST 2 FAILED: UserA was able to create a founder record for UserB!');
    console.error('  This indicates an RLS policy failure');
  }
  
  // Test 3: UserB creates their own founder record (should succeed)
  console.log('\n🧪 TEST 3: UserB creates their own founder record');
  const { data: founderB, error: founderBError } = await userBClient
    .from('founders')
    .insert([{ 
      user_id: userB.id,
      ...userBData
    }])
    .select();
  
  if (founderBError) {
    console.error('❌ TEST 3 FAILED: UserB could not create their own founder record:', founderBError);
  } else {
    console.log('✅ TEST 3 PASSED: UserB successfully created their own founder record');
    console.log('  Founder ID:', founderB[0].id);
  }
  
  if (!founderA || !founderB) {
    console.error('❌ Cannot continue tests without both founder records. Aborting.');
    return;
  }
  
  // Test 4: UserA creates a connection with UserB as founder_a_id (should succeed)
  console.log('\n🧪 TEST 4: UserA creates a connection with themselves as founder_a_id');
  const { data: connectionA, error: connectionAError } = await userAClient
    .from('connections')
    .insert([{ 
      founder_a_id: userA.id,
      founder_b_id: userB.id,
      status: 'pending'
    }])
    .select();
  
  if (connectionAError) {
    console.error('❌ TEST 4 FAILED: UserA could not create a connection with themselves as founder_a_id:', connectionAError);
  } else {
    console.log('✅ TEST 4 PASSED: UserA successfully created a connection with themselves as founder_a_id');
    console.log('  Connection ID:', connectionA[0].id);
  }
  
  // Test 5: UserB tries to create a connection with UserA as founder_a_id (should fail)
  console.log('\n🧪 TEST 5: UserB tries to create a connection with UserA as founder_a_id');
  const { data: connectionImpostor, error: connectionImpostorError } = await userBClient
    .from('connections')
    .insert([{ 
      founder_a_id: userA.id,
      founder_b_id: userB.id,
      status: 'pending'
    }])
    .select();
  
  if (connectionImpostorError) {
    console.log('✅ TEST 5 PASSED: UserB was prevented from creating a connection with UserA as founder_a_id');
    console.log('  Error:', connectionImpostorError.message);
  } else {
    console.error('❌ TEST 5 FAILED: UserB was able to create a connection with UserA as founder_a_id!');
    console.error('  This indicates an RLS policy failure');
  }
  
  // Test 6: UserB creates a connection with themselves as founder_a_id (should succeed)
  console.log('\n🧪 TEST 6: UserB creates a connection with themselves as founder_a_id');
  const { data: connectionB, error: connectionBError } = await userBClient
    .from('connections')
    .insert([{ 
      founder_a_id: userB.id,
      founder_b_id: userA.id,
      status: 'pending'
    }])
    .select();
  
  if (connectionBError) {
    console.error('❌ TEST 6 FAILED: UserB could not create a connection with themselves as founder_a_id:', connectionBError);
  } else {
    console.log('✅ TEST 6 PASSED: UserB successfully created a connection with themselves as founder_a_id');
    console.log('  Connection ID:', connectionB[0].id);
  }
  
  // Clean up test data
  console.log('\n🧹 Cleaning up test data...');
  
  // Use admin client to delete test records
  if (connectionA && connectionA[0]) {
    await adminClient.from('connections').delete().eq('id', connectionA[0].id);
  }
  
  if (connectionB && connectionB[0]) {
    await adminClient.from('connections').delete().eq('id', connectionB[0].id);
  }
  
  if (founderA && founderA[0]) {
    await adminClient.from('founders').delete().eq('id', founderA[0].id);
  }
  
  if (founderB && founderB[0]) {
    await adminClient.from('founders').delete().eq('id', founderB[0].id);
  }
  
  // Delete test users
  if (userA) {
    await adminClient.auth.admin.deleteUser(userA.id);
  }
  
  if (userB) {
    await adminClient.auth.admin.deleteUser(userB.id);
  }
  
  console.log('✅ Test data cleaned up successfully');
  
  // Summary
  console.log('\n📝 TEST SUMMARY:');
  console.log('1. UserA creating own founder record: ' + (founderA ? '✅ PASSED' : '❌ FAILED'));
  console.log('2. UserA creating founder record for UserB: ' + (founderImpostorError ? '✅ PASSED' : '❌ FAILED'));
  console.log('3. UserB creating own founder record: ' + (founderB ? '✅ PASSED' : '❌ FAILED'));
  console.log('4. UserA creating connection with self as founder_a_id: ' + (connectionA ? '✅ PASSED' : '❌ FAILED'));
  console.log('5. UserB creating connection with UserA as founder_a_id: ' + (connectionImpostorError ? '✅ PASSED' : '❌ FAILED'));
  console.log('6. UserB creating connection with self as founder_a_id: ' + (connectionB ? '✅ PASSED' : '❌ FAILED'));
}

// Main function
async function main() {
  try {
    await testRlsPolicies();
  } catch (error) {
    console.error('Fatal error:', error);
  }
}

// Run the main function
main();

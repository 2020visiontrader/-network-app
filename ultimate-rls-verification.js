/**
 * Ultimate RLS Policy Verification
 * 
 * This script performs a comprehensive verification of RLS policies,
 * with special attention to both anonymous and authenticated access.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// Create two Supabase clients - one for anonymous and one for authenticated tests
const anonClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

let authClient = null; // Will be initialized after login

// Utility to generate random data
const randomId = () => crypto.randomBytes(16).toString('hex');
const randomEmail = () => `test-${randomId()}@example.com`;

// Helper to wait between operations
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Test user data
const TEST_EMAIL = randomEmail();
const TEST_PASSWORD = 'TestPassword123!';
let TEST_USER_ID = null;
let TEST_FOUNDER_ID = null;
let OTHER_FOUNDER_ID = null;

// Helper function for consistent error logging
function logResult(operation, success, error = null) {
  if (success) {
    console.log(`✅ ${operation}`);
  } else {
    console.log(`❌ ISSUE: ${operation} - ${error ? error.message || error : 'Failed'}`);
  }
}

// STEP 1: Test anonymous access (should be fully restricted)
async function testAnonymousAccess() {
  console.log('\n1. TESTING ANONYMOUS ACCESS RESTRICTIONS');
  console.log('--------------------------------------');
  
  // Ensure the client is not authenticated
  await anonClient.auth.signOut();
  
  try {
    // 1.1 Test SELECT
    const { data: selectData, error: selectError } = await anonClient
      .from('founders')
      .select('*')
      .limit(5);
    
    if (selectError) {
      logResult('Anonymous SELECT correctly restricted', true, selectError.code);
    } else if (selectData && selectData.length === 0) {
      logResult('Anonymous SELECT returned empty array (may be correct)', true);
    } else {
      logResult('Anonymous SELECT allowed', false);
    }
    
    // 1.2 Test INSERT
    const { error: insertError } = await anonClient
      .from('founders')
      .insert({
        name: 'Anonymous Test',
        email: randomEmail(),
        bio: 'This should fail',
        profile_visible: true
      });
    
    logResult('Anonymous INSERT restricted', insertError !== null, insertError);
    
    // 1.3 Test UPDATE
    const { error: updateError } = await anonClient
      .from('founders')
      .update({ bio: 'This should fail' })
      .eq('profile_visible', true);
    
    logResult('Anonymous UPDATE restricted', updateError !== null, updateError);
    
    // 1.4 Test DELETE
    const { error: deleteError } = await anonClient
      .from('founders')
      .delete()
      .eq('profile_visible', true);
    
    logResult('Anonymous DELETE restricted', deleteError !== null, deleteError);
    
  } catch (error) {
    console.error('Unexpected error during anonymous tests:', error);
  }
}

// STEP 2: Create a test user and authenticate
async function createAndAuthenticateUser() {
  console.log('\n2. CREATING AND AUTHENTICATING TEST USER');
  console.log('----------------------------------------');
  
  try {
    // 2.1 Sign up a new user
    console.log(`Creating test user: ${TEST_EMAIL}`);
    
    const { data: signUpData, error: signUpError } = await anonClient.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signUpError) {
      logResult('User creation', false, signUpError);
      throw signUpError;
    }
    
    TEST_USER_ID = signUpData.user.id;
    logResult(`User created with ID: ${TEST_USER_ID}`, true);
    
    // 2.2 Wait for auth hooks to potentially create founder record
    console.log('Waiting for auth trigger to process...');
    await wait(3000);
    
    // 2.3 Sign in to create an authenticated client
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      logResult('User sign in', false, signInError);
      throw signInError;
    }
    
    // Create a new client with the session
    authClient = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL || '',
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        global: {
          headers: {
            Authorization: `Bearer ${signInData.session.access_token}`
          }
        }
      }
    );
    
    logResult('User authenticated', true);
    
    // 2.4 Check if founder record exists or create one
    const { data: founder, error: founderError } = await authClient
      .from('founders')
      .select('*')
      .eq('user_id', TEST_USER_ID)
      .maybeSingle();
    
    if (founderError) {
      logResult('Checking for founder record', false, founderError);
    } else if (founder) {
      TEST_FOUNDER_ID = founder.id;
      logResult(`Founder record exists with ID: ${TEST_FOUNDER_ID}`, true);
    } else {
      // Create founder record
      const { data: createdFounder, error: createError } = await authClient
        .from('founders')
        .insert({
          user_id: TEST_USER_ID,
          name: 'Test RLS User',
          email: TEST_EMAIL,
          bio: 'Testing RLS policies',
          profile_visible: true
        })
        .select()
        .maybeSingle();
      
      if (createError) {
        logResult('Creating founder record', false, createError);
      } else {
        TEST_FOUNDER_ID = createdFounder.id;
        logResult(`Created founder record with ID: ${TEST_FOUNDER_ID}`, true);
      }
    }
  } catch (error) {
    console.error('Error in user authentication:', error);
    throw error;
  }
}

// STEP 3: Test operations on own records
async function testOwnRecordAccess() {
  console.log('\n3. TESTING OPERATIONS ON OWN RECORDS');
  console.log('-----------------------------------');
  
  try {
    // 3.1 SELECT own record
    const { data: ownData, error: ownError } = await authClient
      .from('founders')
      .select('*')
      .eq('id', TEST_FOUNDER_ID)
      .maybeSingle();
    
    logResult('SELECT own record', ownData !== null && !ownError, ownError);
    
    // 3.2 UPDATE own record
    const { data: updateData, error: updateError } = await authClient
      .from('founders')
      .update({ bio: 'Updated by RLS test at ' + new Date().toISOString() })
      .eq('id', TEST_FOUNDER_ID)
      .select()
      .maybeSingle();
    
    logResult('UPDATE own record', updateData !== null && !updateError, updateError);
    
    // 3.3 INSERT (not applicable - we already created the record)
    console.log('(INSERT test skipped - record already exists)');
    
    // 3.4 DELETE (will be tested in cleanup)
    console.log('(DELETE test skipped - will be tested in cleanup)');
  } catch (error) {
    console.error('Error in own record tests:', error);
  }
}

// STEP 4: Test operations on other users' records
async function testOtherRecordsAccess() {
  console.log('\n4. TESTING OPERATIONS ON OTHER USERS\' RECORDS');
  console.log('--------------------------------------------');
  
  try {
    // 4.1 Find another visible founder
    const { data: others, error: othersError } = await authClient
      .from('founders')
      .select('*')
      .eq('profile_visible', true)
      .neq('user_id', TEST_USER_ID)
      .limit(1);
    
    if (othersError) {
      logResult('Finding other visible founders', false, othersError);
      return;
    }
    
    if (!others || others.length === 0) {
      console.log('⚠️ No other founders found to test with');
      return;
    }
    
    OTHER_FOUNDER_ID = others[0].id;
    console.log(`Found other founder with ID: ${OTHER_FOUNDER_ID}`);
    
    // 4.2 SELECT other visible record
    const { data: otherData, error: otherError } = await authClient
      .from('founders')
      .select('*')
      .eq('id', OTHER_FOUNDER_ID)
      .maybeSingle();
    
    logResult('SELECT other visible record', otherData !== null && !otherError, otherError);
    
    // 4.3 UPDATE other record (should fail)
    const { data: updateOtherData, error: updateOtherError } = await authClient
      .from('founders')
      .update({ bio: 'This update should fail due to RLS' })
      .eq('id', OTHER_FOUNDER_ID)
      .select();
    
    logResult('UPDATE other record restricted', updateOtherError !== null, 
              !updateOtherError ? 'Update succeeded when it should fail' : updateOtherError);
    
    // 4.4 DELETE other record (should fail)
    const { data: deleteOtherData, error: deleteOtherError } = await authClient
      .from('founders')
      .delete()
      .eq('id', OTHER_FOUNDER_ID)
      .select();
    
    logResult('DELETE other record restricted', deleteOtherError !== null,
              !deleteOtherError ? 'Delete succeeded when it should fail' : deleteOtherError);
  } catch (error) {
    console.error('Error in other records tests:', error);
  }
}

// STEP 5: Test visibility controls
async function testVisibilityControls() {
  console.log('\n5. TESTING VISIBILITY CONTROLS');
  console.log('-----------------------------');
  
  try {
    // 5.1 Make own profile invisible
    const { error: makeInvisibleError } = await authClient
      .from('founders')
      .update({ profile_visible: false })
      .eq('id', TEST_FOUNDER_ID);
    
    if (makeInvisibleError) {
      logResult('Update own visibility', false, makeInvisibleError);
      return;
    }
    
    console.log('Made own profile invisible for testing');
    
    // 5.2 Can still see own profile when invisible
    const { data: ownInvisibleData, error: ownInvisibleError } = await authClient
      .from('founders')
      .select('*')
      .eq('id', TEST_FOUNDER_ID)
      .maybeSingle();
    
    logResult('Can view own profile when invisible', 
              ownInvisibleData !== null && !ownInvisibleError, 
              ownInvisibleError);
    
    // 5.3 Try to find invisible profiles of others
    const { data: invisibleOthers, error: invisibleError } = await authClient
      .from('founders')
      .select('*')
      .eq('profile_visible', false)
      .neq('user_id', TEST_USER_ID)
      .limit(5);
    
    if (invisibleError) {
      logResult('Cannot view others\' invisible profiles (error)', true, invisibleError);
    } else if (invisibleOthers && invisibleOthers.length === 0) {
      logResult('Cannot view others\' invisible profiles (empty result)', true);
    } else {
      logResult('Cannot view others\' invisible profiles', false, 
                `Found ${invisibleOthers.length} invisible profiles`);
    }
    
    // 5.4 Make own profile visible again
    const { error: makeVisibleError } = await authClient
      .from('founders')
      .update({ profile_visible: true })
      .eq('id', TEST_FOUNDER_ID);
    
    logResult('Restore own visibility', !makeVisibleError, makeVisibleError);
  } catch (error) {
    console.error('Error in visibility tests:', error);
  }
}

// STEP 6: Test profile discovery
async function testProfileDiscovery() {
  console.log('\n6. TESTING PROFILE DISCOVERY');
  console.log('---------------------------');
  
  try {
    // 6.1 Find visible founders
    const { data: visibleFounders, error: visibleError } = await authClient
      .from('founders')
      .select('*')
      .eq('profile_visible', true)
      .limit(10);
    
    if (visibleError) {
      logResult('Can discover visible profiles', false, visibleError);
    } else {
      logResult(`Can discover visible profiles (found ${visibleFounders.length})`, 
                visibleFounders.length > 0);
    }
    
    // 6.2 Verify filtering works
    const filter = 'Test';
    const { data: filteredFounders, error: filterError } = await authClient
      .from('founders')
      .select('*')
      .eq('profile_visible', true)
      .ilike('name', `%${filter}%`)
      .limit(10);
    
    if (filterError) {
      logResult('Can filter profiles', false, filterError);
    } else {
      logResult(`Can filter profiles with term "${filter}" (found ${filteredFounders.length})`, 
                !filterError);
    }
  } catch (error) {
    console.error('Error in discovery tests:', error);
  }
}

// STEP 7: Clean up
async function cleanUp() {
  console.log('\n7. CLEANING UP TEST DATA');
  console.log('----------------------');
  
  try {
    // Delete founder record
    if (TEST_FOUNDER_ID) {
      const { error: deleteError } = await authClient
        .from('founders')
        .delete()
        .eq('id', TEST_FOUNDER_ID);
      
      logResult('DELETE own record', !deleteError, deleteError);
    }
    
    // Sign out
    await authClient.auth.signOut();
    console.log('⚠️ Test user auth record must be deleted manually in Supabase dashboard');
    console.log(`   User ID: ${TEST_USER_ID}`);
    console.log(`   Email: ${TEST_EMAIL}`);
  } catch (error) {
    console.error('Error in cleanup:', error);
  }
}

// Main test function
async function verifyUltimateRlsPolicies() {
  console.log('🔒 ULTIMATE RLS POLICY VERIFICATION');
  console.log('==================================');
  
  try {
    await testAnonymousAccess();
    await createAndAuthenticateUser();
    await testOwnRecordAccess();
    await testOtherRecordsAccess();
    await testVisibilityControls();
    await testProfileDiscovery();
    await cleanUp();
    
    console.log('\n✅ ULTIMATE RLS VERIFICATION COMPLETED');
    console.log('See above for any issues that need to be addressed.');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Run the verification
verifyUltimateRlsPolicies();

/**
 * Enhanced RLS Policy Verification
 * 
 * This script specifically tests each RLS policy operation (SELECT, INSERT, UPDATE, DELETE)
 * to ensure the policies are working correctly.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Utility to generate random data
const randomId = () => crypto.randomBytes(16).toString('hex');
const randomEmail = () => `test-${randomId()}@example.com`;

// Helper to wait between operations
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry operations
async function retry(operation, maxRetries = 3, delayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        console.log(`Waiting ${delayMs}ms before retrying...`);
        await wait(delayMs);
      }
    }
  }
  
  throw lastError;
}

// Test data
const TEST_EMAIL = randomEmail();
const TEST_PASSWORD = 'TestPassword123!';
let TEST_USER_ID = null;
let TEST_FOUNDER_ID = null;
let OTHER_FOUNDER_ID = null;

// Step 1: Test anonymous access (should be denied for all operations)
async function testAnonymousAccess() {
  console.log('\n1. TESTING ANONYMOUS ACCESS RESTRICTIONS');
  console.log('--------------------------------------');
  
  // Ensure we're logged out
  await supabase.auth.signOut();
  
  // 1.1 Test SELECT - should be restricted
  const { data: selectData, error: selectError } = await supabase
    .from('founders')
    .select('*')
    .limit(5);
  
  if (selectError) {
    console.log('✅ Anonymous SELECT correctly restricted with error:', selectError.code);
  } else if (selectData && selectData.length === 0) {
    console.log('✅ Anonymous SELECT returned empty result (RLS working)');
  } else {
    console.log(`❌ ISSUE: Anonymous users can SELECT from founders table! Found ${selectData.length} records`);
  }
  
  // 1.2 Test INSERT - should be restricted
  const testFounder = {
    name: 'Anonymous Test',
    email: randomEmail(),
    bio: 'This should fail due to RLS',
    profile_visible: true
  };
  
  const { error: insertError } = await supabase
    .from('founders')
    .insert(testFounder);
  
  if (insertError) {
    console.log('✅ Anonymous INSERT correctly restricted with error:', insertError.code);
  } else {
    console.log('❌ ISSUE: Anonymous users can INSERT into founders table!');
  }
  
  // 1.3 Test UPDATE - should be restricted
  const { error: updateError } = await supabase
    .from('founders')
    .update({ bio: 'Anonymous update test' })
    .eq('profile_visible', true);
  
  if (updateError) {
    console.log('✅ Anonymous UPDATE correctly restricted with error:', updateError.code);
  } else {
    console.log('❌ ISSUE: Anonymous users can UPDATE founders table!');
  }
  
  // 1.4 Test DELETE - should be restricted
  const { error: deleteError } = await supabase
    .from('founders')
    .delete()
    .eq('profile_visible', true);
  
  if (deleteError) {
    console.log('✅ Anonymous DELETE correctly restricted with error:', deleteError.code);
  } else {
    console.log('❌ ISSUE: Anonymous users can DELETE from founders table!');
  }
}

// Step 2: Create a test user and sign in
async function createAndSignInUser() {
  console.log('\n2. CREATING TEST USER AND SIGNING IN');
  console.log('----------------------------------');
  
  // Create test user
  console.log(`Creating test user: ${TEST_EMAIL}`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    throw signUpError;
  }
  
  TEST_USER_ID = signUpData.user.id;
  console.log(`✅ User created with ID: ${TEST_USER_ID}`);
  
  // Wait for auth trigger to process
  console.log('Waiting for auth trigger to process...');
  await wait(3000);
  
  // Sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    throw signInError;
  }
  
  console.log('✅ Signed in successfully');
  
  // Check if founder record exists or create one
  const { data: founder, error: founderError } = await supabase
    .from('founders')
    .select('*')
    .eq('user_id', TEST_USER_ID)
    .maybeSingle();
  
  if (founderError) {
    console.error('❌ Error checking founder record:', founderError.message);
  } else if (founder) {
    TEST_FOUNDER_ID = founder.id;
    console.log(`✅ Founder record exists with ID: ${TEST_FOUNDER_ID}`);
  } else {
    // Create founder record
    const newFounder = {
      user_id: TEST_USER_ID,
      name: 'Test RLS User',
      email: TEST_EMAIL,
      bio: 'This is a test founder for RLS verification',
      profile_visible: true
    };
    
    const { data: createdFounder, error: createError } = await supabase
      .from('founders')
      .insert(newFounder)
      .select()
      .maybeSingle();
    
    if (createError) {
      console.error('❌ Failed to create founder record:', createError.message);
    } else {
      TEST_FOUNDER_ID = createdFounder.id;
      console.log(`✅ Created founder record with ID: ${TEST_FOUNDER_ID}`);
    }
  }
}

// Step 3: Test operations on own record
async function testOwnRecordAccess() {
  console.log('\n3. TESTING OPERATIONS ON OWN RECORD');
  console.log('----------------------------------');
  
  // 3.1 Test SELECT own record - should succeed
  const { data: ownData, error: ownError } = await supabase
    .from('founders')
    .select('*')
    .eq('id', TEST_FOUNDER_ID)
    .maybeSingle();
  
  if (ownError) {
    console.log('❌ ISSUE: Cannot SELECT own record:', ownError.message);
  } else if (ownData) {
    console.log('✅ User can SELECT their own record');
  } else {
    console.log('❌ ISSUE: Own record not found');
  }
  
  // 3.2 Test UPDATE own record - should succeed
  const { data: updateData, error: updateError } = await supabase
    .from('founders')
    .update({ bio: 'Updated by RLS test at ' + new Date().toISOString() })
    .eq('id', TEST_FOUNDER_ID)
    .select()
    .maybeSingle();
  
  if (updateError) {
    console.log('❌ ISSUE: Cannot UPDATE own record:', updateError.message);
  } else if (updateData) {
    console.log('✅ User can UPDATE their own record');
  } else {
    console.log('❌ ISSUE: Own record update returned no data');
  }
  
  // 3.3 Test INSERT (not applicable for existing record)
  console.log('(INSERT test skipped - already have a record)');
  
  // 3.4 Test DELETE own record (we'll delete later in cleanup)
  console.log('(DELETE test skipped - will be tested in cleanup)');
}

// Step 4: Test operations on other records
async function testOtherRecordsAccess() {
  console.log('\n4. TESTING OPERATIONS ON OTHER USERS\' RECORDS');
  console.log('--------------------------------------------');
  
  // First, find other visible founders
  const { data: others, error: othersError } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', true)
    .neq('user_id', TEST_USER_ID)
    .limit(1);
  
  if (othersError) {
    console.log('❌ Error finding other founders:', othersError.message);
    return;
  }
  
  if (!others || others.length === 0) {
    console.log('⚠️ No other founders found to test against');
    return;
  }
  
  OTHER_FOUNDER_ID = others[0].id;
  console.log(`Found other founder with ID: ${OTHER_FOUNDER_ID}`);
  
  // 4.1 Test SELECT other visible record - should succeed
  const { data: otherVisibleData, error: otherVisibleError } = await supabase
    .from('founders')
    .select('*')
    .eq('id', OTHER_FOUNDER_ID)
    .maybeSingle();
  
  if (otherVisibleError) {
    console.log('❌ ISSUE: Cannot SELECT other visible record:', otherVisibleError.message);
  } else if (otherVisibleData) {
    console.log('✅ User can SELECT other visible records');
  } else {
    console.log('❌ ISSUE: Other visible record not found');
  }
  
  // 4.2 Test UPDATE other record - should fail
  const { data: updateOtherData, error: updateOtherError } = await supabase
    .from('founders')
    .update({ bio: 'This update should fail due to RLS' })
    .eq('id', OTHER_FOUNDER_ID)
    .select();
  
  if (updateOtherError) {
    console.log('✅ UPDATE other record correctly restricted with error:', updateOtherError.code);
  } else {
    console.log('❌ ISSUE: User can UPDATE other users\' records!');
  }
  
  // 4.3 Test DELETE other record - should fail
  const { data: deleteOtherData, error: deleteOtherError } = await supabase
    .from('founders')
    .delete()
    .eq('id', OTHER_FOUNDER_ID)
    .select();
  
  if (deleteOtherError) {
    console.log('✅ DELETE other record correctly restricted with error:', deleteOtherError.code);
  } else {
    console.log('❌ ISSUE: User can DELETE other users\' records!');
  }
}

// Step 5: Test visibility access
async function testVisibilityAccess() {
  console.log('\n5. TESTING VISIBILITY ACCESS CONTROL');
  console.log('----------------------------------');
  
  // 5.1 Update own record to be invisible
  const { error: makeInvisibleError } = await supabase
    .from('founders')
    .update({ profile_visible: false })
    .eq('id', TEST_FOUNDER_ID);
  
  if (makeInvisibleError) {
    console.log('❌ Cannot update visibility setting:', makeInvisibleError.message);
    return;
  }
  
  console.log('Made own profile invisible for testing');
  
  // 5.2 Find a user who was testing previously and might have an invisible profile
  const { data: invisibleOthers, error: invisibleError } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', false)
    .neq('user_id', TEST_USER_ID)
    .limit(5);
  
  if (invisibleError) {
    if (invisibleError.code === 'PGRST301') {
      console.log('✅ SELECT invisible records correctly restricted with error:', invisibleError.code);
    } else {
      console.log('⚠️ Unexpected error when querying invisible records:', invisibleError.message);
    }
  } else if (invisibleOthers && invisibleOthers.length > 0) {
    console.log(`❌ ISSUE: User can view ${invisibleOthers.length} invisible records from other users!`);
  } else {
    console.log('✅ No invisible records from other users returned (expected)');
  }
  
  // 5.3 Make own profile visible again
  const { error: makeVisibleError } = await supabase
    .from('founders')
    .update({ profile_visible: true })
    .eq('id', TEST_FOUNDER_ID);
  
  if (makeVisibleError) {
    console.log('❌ Cannot restore visibility setting:', makeVisibleError.message);
  } else {
    console.log('Restored own profile visibility');
  }
}

// Step 6: Clean up
async function cleanUp() {
  console.log('\n6. CLEANING UP TEST DATA');
  console.log('----------------------');
  
  // Test DELETE own record
  const { error: deleteError } = await supabase
    .from('founders')
    .delete()
    .eq('id', TEST_FOUNDER_ID);
  
  if (deleteError) {
    console.log('❌ ISSUE: Cannot DELETE own record:', deleteError.message);
  } else {
    console.log('✅ User can DELETE their own record');
  }
  
  // Note: User auth record cannot be deleted with client credentials
  console.log(`⚠️ Test user auth record (${TEST_USER_ID}) must be deleted manually`);
}

// Main test function
async function verifyEnhancedRlsPolicies() {
  console.log('🔒 ENHANCED RLS POLICY VERIFICATION');
  console.log('==================================');
  
  try {
    await testAnonymousAccess();
    await createAndSignInUser();
    await testOwnRecordAccess();
    await testOtherRecordsAccess();
    await testVisibilityAccess();
    await cleanUp();
    
    console.log('\n✅ ENHANCED RLS VERIFICATION COMPLETED');
    console.log('See above for any potential issues that need to be addressed.');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.log('Stack trace:', error.stack);
  }
}

// Run the verification
verifyEnhancedRlsPolicies();

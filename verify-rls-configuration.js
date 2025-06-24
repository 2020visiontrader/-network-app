/**
 * Comprehensive RLS Policy Verification
 * 
 * This script verifies that our RLS policies are properly configured
 * for all tables, focusing on the founders table in particular.
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

// Check RLS policy for anonymous users
async function testAnonymousAccess() {
  console.log('\n1. Testing anonymous access restrictions');
  
  // First, make sure we're logged out
  await supabase.auth.signOut();
  
  // Test reading founders table - should be restricted
  const { data: founders, error: foundersError } = await supabase
    .from('founders')
    .select('*')
    .limit(5);
  
  if (foundersError) {
    if (foundersError.code === 'PGRST301') {
      console.log('✅ Anonymous access correctly restricted (PGRST301)');
    } else {
      console.log(`⚠️ Anonymous access failed with unexpected error: ${foundersError.code} - ${foundersError.message}`);
    }
  } else if (founders && founders.length > 0) {
    console.log(`❌ ISSUE: Anonymous users can view founders table! Found ${founders.length} records`);
  } else {
    console.log('✅ Anonymous users cannot view founders (empty result)');
  }
  
  // Test inserting into founders table - should be restricted
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
    if (insertError.code === 'PGRST301') {
      console.log('✅ Anonymous insert correctly restricted (PGRST301)');
    } else {
      console.log(`⚠️ Anonymous insert failed with unexpected error: ${insertError.code} - ${insertError.message}`);
    }
  } else {
    console.log('❌ ISSUE: Anonymous users can insert into founders table!');
  }
}

// Test authenticated user flows
async function testAuthenticatedAccess() {
  console.log('\n2. Testing authenticated user access');
  
  // Create a test user
  const testEmail = randomEmail();
  const testPassword = 'TestPassword123!';
  
  console.log(`Creating test user: ${testEmail}`);
  
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword
  });
  
  if (signUpError) {
    console.error('❌ Sign up failed:', signUpError.message);
    return;
  }
  
  const userId = signUpData.user.id;
  console.log(`✅ User created with ID: ${userId}`);
  
  // Wait for auth trigger to process
  console.log('Waiting for auth trigger to process...');
  await wait(2000);
  
  // Sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    return;
  }
  
  console.log('✅ Signed in successfully');
  
  // Test viewing own profile (should work)
  const { data: ownProfile, error: ownProfileError } = await retry(async () => {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('Founder profile not found, might need to wait for auth trigger');
    return { data, error };
  });
  
  if (ownProfileError) {
    console.error('❌ Failed to view own profile:', ownProfileError.message);
  } else if (ownProfile) {
    console.log('✅ User can view their own profile');
    
    // Test updating own profile (should work)
    const { error: updateError } = await supabase
      .from('founders')
      .update({ bio: 'Updated bio for RLS test' })
      .eq('id', ownProfile.id);
    
    if (updateError) {
      console.error('❌ Failed to update own profile:', updateError.message);
    } else {
      console.log('✅ User can update their own profile');
    }
  } else {
    console.log('❌ User profile not found, auth trigger may not be working');
  }
  
  // Test viewing other visible profiles (should work)
  const { data: visibleProfiles, error: visibleError } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', true)
    .neq('user_id', userId)  // Not our own profile
    .limit(5);
  
  if (visibleError) {
    console.error('❌ Failed to view visible profiles:', visibleError.message);
  } else {
    console.log(`✅ User can view ${visibleProfiles.length} visible profiles`);
  }
  
  // Test viewing hidden profiles (should be restricted)
  const { data: hiddenProfiles, error: hiddenError } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', false)
    .neq('user_id', userId)  // Not our own profile
    .limit(5);
  
  if (hiddenError) {
    if (hiddenError.code === 'PGRST301') {
      console.log('✅ Hidden profiles correctly restricted (PGRST301)');
    } else {
      console.log(`⚠️ Hidden profiles query failed with unexpected error: ${hiddenError.code} - ${hiddenError.message}`);
    }
  } else if (hiddenProfiles && hiddenProfiles.length > 0) {
    console.log(`❌ ISSUE: User can view ${hiddenProfiles.length} hidden profiles!`);
  } else {
    console.log('✅ User cannot view hidden profiles (empty result)');
  }
  
  // Test updating someone else's profile (should fail)
  if (visibleProfiles && visibleProfiles.length > 0) {
    const otherProfile = visibleProfiles[0];
    
    const { error: updateOtherError } = await supabase
      .from('founders')
      .update({ bio: 'Should not be able to update' })
      .eq('id', otherProfile.id);
    
    if (updateOtherError) {
      if (updateOtherError.code === 'PGRST301') {
        console.log('✅ Updating other profiles correctly restricted (PGRST301)');
      } else {
        console.log(`⚠️ Update other profile failed with unexpected error: ${updateOtherError.code} - ${updateOtherError.message}`);
      }
    } else {
      console.log('❌ ISSUE: User can update other users\' profiles!');
    }
  }
}

// Verify RLS policy settings directly
async function verifyRlsPolicies() {
  console.log('\n3. Verifying RLS policies (requires admin access)');
  console.log('Cannot directly verify policy settings with client credentials.');
  console.log('Please verify in Supabase dashboard that:');
  console.log('1. RLS is enabled for the founders table');
  console.log('2. There\'s a policy allowing users to view their own records');
  console.log('3. There\'s a policy allowing users to view records with profile_visible=true');
  console.log('4. There\'s a policy restricting anonymous access');
}

// Main test function
async function verifyRlsConfiguration() {
  console.log('🔒 COMPREHENSIVE RLS POLICY VERIFICATION');
  console.log('=======================================');
  
  try {
    await testAnonymousAccess();
    await testAuthenticatedAccess();
    await verifyRlsPolicies();
    
    console.log('\n✅ RLS VERIFICATION COMPLETED');
    console.log('See above for any potential issues that need to be addressed.');
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
  }
}

// Run the verification
verifyRlsConfiguration();

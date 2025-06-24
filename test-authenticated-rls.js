/**
 * Authenticated RLS Policy Test
 * 
 * This script tests RLS policies using authenticated users.
 * You'll need to provide valid credentials for this to work.
 * 
 * IMPORTANT: Before running this script:
 * 1. Sign up a real user in your Supabase project
 * 2. Update the TEST_EMAIL and TEST_PASSWORD below with valid credentials
 * 3. Make sure the user has a corresponding entry in the founders table
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

// Test user credentials - REPLACE THESE with valid credentials
// You can also set these in your .env file as TEST_USER_EMAIL and TEST_USER_PASSWORD
const TEST_EMAIL = process.env.TEST_USER_EMAIL || 'YOUR_TEST_USER_EMAIL@example.com';
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD || 'YOUR_TEST_USER_PASSWORD';

// Check if valid credentials are provided
if (TEST_EMAIL.includes('YOUR_TEST_USER_EMAIL') || TEST_PASSWORD.includes('YOUR_TEST_USER_PASSWORD')) {
  console.log('⚠️ This script requires valid test user credentials.');
  console.log('Update TEST_EMAIL and TEST_PASSWORD before running.');
  process.exit(1);
}

async function testAuthenticatedAccess() {
  console.log('🔒 AUTHENTICATED RLS POLICY TEST');
  console.log('==============================');
  
  // Step 1: Sign in as test user
  console.log('Step 1: Signing in as test user...');
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (authError) {
    console.log('❌ Authentication failed:', authError.message);
    console.log('Please update the script with valid test user credentials');
    return;
  }
  
  console.log('✅ Successfully signed in as:', authData.user.email);
  console.log(`   User ID: ${authData.user.id}`);
  
  // Step 2: Try to read own profile
  console.log('\nStep 2: Reading own profile...');
  const { data: ownProfile, error: ownProfileError } = await supabase
    .from('founders')
    .select('*')
    .eq('user_id', authData.user.id)
    .maybeSingle();
    
  if (ownProfileError) {
    console.log('❌ Failed to read own profile:', ownProfileError.message);
  } else if (ownProfile) {
    console.log('✅ Successfully read own profile:', ownProfile.full_name);
  } else {
    console.log('⚠️ No profile found for this user.');
    
    // Create a profile if it doesn't exist
    console.log('   Creating a test profile...');
    const { data: newProfile, error: createError } = await supabase
      .from('founders')
      .insert({
        user_id: authData.user.id,
        full_name: 'Test User',
        email: authData.user.email,
        profile_visible: true,
        profile_visible: true
      })
      .select()
      .maybeSingle();
      
    if (createError) {
      console.log('❌ Failed to create profile:', createError.message);
    } else {
      console.log('✅ Created new profile:', newProfile.full_name);
    }
  }
  
  // Step 3: Try to read other profiles
  console.log('\nStep 3: Reading other visible profiles...');
  const { data: otherProfiles, error: otherProfilesError } = await supabase
    .from('founders')
    .select('*')
    .neq('user_id', authData.user.id)
    .eq('profile_visible', true)
    .limit(5);
    
  if (otherProfilesError) {
    console.log('❌ Failed to read other profiles:', otherProfilesError.message);
  } else if (otherProfiles.length > 0) {
    console.log(`✅ Successfully read ${otherProfiles.length} other visible profiles`);
  } else {
    console.log('⚠️ No other visible profiles found');
  }
  
  // Step 4: Try to update own profile
  console.log('\nStep 4: Updating own profile...');
  const randomBio = `Bio updated at ${new Date().toISOString()}`;
  const { data: updateData, error: updateError } = await supabase
    .from('founders')
    .update({ bio: randomBio })
    .eq('user_id', authData.user.id)
    .select()
    .maybeSingle();
    
  if (updateError) {
    console.log('❌ Failed to update own profile:', updateError.message);
  } else {
    console.log('✅ Successfully updated own profile with new bio');
  }
  
  // Step 5: Try to update someone else's profile (should fail)
  if (otherProfiles && otherProfiles.length > 0) {
    console.log('\nStep 5: Attempting to update another user\'s profile (should fail)...');
    const otherUserId = otherProfiles[0].user_id;
    const { data: badUpdate, error: badUpdateError } = await supabase
      .from('founders')
      .update({ bio: 'This should fail' })
      .eq('user_id', otherUserId)
      .select();
      
    if (badUpdateError) {
      console.log('✅ Correctly blocked from updating another user\'s profile:', badUpdateError.message);
    } else {
      console.log('❌ RLS ISSUE: Was able to update another user\'s profile!');
    }
  } else {
    console.log('\nStep 5: Skipped - no other profiles found to test with');
  }
  
  // Sign out at the end
  await supabase.auth.signOut();
  console.log('\n✅ Signed out successfully');
  
  console.log('\n📋 AUTHENTICATED RLS TEST SUMMARY');
  console.log('===============================');
  console.log('Replace TEST_EMAIL and TEST_PASSWORD with valid credentials');
  console.log('and run this script to fully verify authenticated RLS policies.');
}

// Only run the test if credentials are set
if (TEST_EMAIL === 'YOUR_TEST_USER_EMAIL@example.com') {
  console.log('⚠️ This script requires valid test user credentials.');
  console.log('Update TEST_EMAIL and TEST_PASSWORD before running.');
} else {
  // Run the test
  testAuthenticatedAccess()
    .then(() => {
      console.log('\n🎉 Test completed!');
    })
    .catch(err => {
      console.error('💥 Fatal error:', err);
    });
}

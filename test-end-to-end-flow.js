/**
 * End-to-End User Flow Test
 * 
 * This script tests the complete user flow:
 * 1. Sign up a new user
 * 2. Create a founder profile
 * 3. Update the profile
 * 4. Test discovery features
 * 5. Clean up test data
 * 
 * This test doesn't require pre-existing user credentials.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper to generate random data
const randomId = () => crypto.randomBytes(16).toString('hex');
const randomEmail = () => `test-${randomId()}@example.com`;

// Test user credentials generated randomly for this test
const TEST_EMAIL = randomEmail();
const TEST_PASSWORD = 'TestPassword123!';
const TEST_USERNAME = `testuser_${randomId().substring(0, 8)}`;

// Global variables to store test data
let userId = null;
let founderId = null;

// Utility function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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

// Helper to check if env variables are set
function checkEnvironment() {
  const requiredVars = [
    'EXPO_PUBLIC_SUPABASE_URL',
    'EXPO_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars.join(', '));
    console.error('Please set these variables in your .env file');
    process.exit(1);
  }
  
  console.log('✅ Environment variables present');
}

// Step 1: Sign up a new user
async function signUpUser() {
  console.log(`\n1. Creating new test user: ${TEST_EMAIL}`);
  
  const { data, error } = await supabase.auth.signUp({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    options: {
      data: {
        username: TEST_USERNAME
      }
    }
  });
  
  if (error) {
    console.error('❌ Sign up failed:', error.message);
    throw error;
  }
  
  userId = data.user.id;
  console.log(`✅ User created with ID: ${userId}`);
  
  // Wait for the auth trigger to potentially create founder record
  console.log('Waiting for auth trigger to process...');
  await wait(2000);
  
  return data.user;
}

// Step 2: Check for founder record and create if not exists
async function createFounderProfile() {
  console.log('\n2. Checking/creating founder profile');
  
  // First check if founder profile exists
  const { data: existingFounder, error: checkError } = await supabase
    .from('founders')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (checkError) {
    console.error('❌ Error checking for existing founder:', checkError.message);
  } else if (existingFounder) {
    console.log('✅ Founder profile already exists:', existingFounder.id);
    founderId = existingFounder.id;
    return existingFounder;
  }
  
  // Create founder profile if it doesn't exist
  const founderData = {
    user_id: userId,
    name: 'Test Founder',
    email: TEST_EMAIL,
    bio: 'This is a test profile created by the e2e test script',
    company_name: 'Test Company',
    company_stage: 'Pre-seed',
    profile_visible: true,
    linkedin_url: 'https://linkedin.com/in/testfounder'
  };
  
  const { data: newFounder, error: createError } = await supabase
    .from('founders')
    .insert(founderData)
    .select()
    .maybeSingle();
  
  if (createError) {
    console.error('❌ Failed to create founder profile:', createError.message);
    throw createError;
  }
  
  founderId = newFounder.id;
  console.log(`✅ Created new founder profile with ID: ${founderId}`);
  return newFounder;
}

// Step 3: Update founder profile
async function updateFounderProfile() {
  console.log('\n3. Updating founder profile');
  
  if (!founderId) {
    console.error('❌ Cannot update profile: founderId is not set');
    return null;
  }
  
  const updates = {
    bio: 'Updated bio from the e2e test',
    interests: ['AI', 'Blockchain', 'SaaS'],
    seeking: ['Co-founder', 'Investment']
  };
  
  const { data, error } = await supabase
    .from('founders')
    .update(updates)
    .eq('id', founderId)
    .select()
    .maybeSingle();
  
  if (error) {
    console.error('❌ Failed to update profile:', error.message);
    throw error;
  }
  
  console.log('✅ Successfully updated founder profile');
  return data;
}

// Step 4: Test discovery - query other founders
async function testDiscovery() {
  console.log('\n4. Testing founder discovery');
  
  // We need to sign in to test authenticated routes
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  });
  
  if (signInError) {
    console.error('❌ Sign in failed:', signInError.message);
    throw signInError;
  }
  
  console.log('✅ Signed in successfully');
  
  // Query visible founders
  const { data: founders, error } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', true)
    .limit(5);
  
  if (error) {
    console.error('❌ Discovery query failed:', error.message);
    throw error;
  }
  
  console.log(`✅ Found ${founders.length} visible founders`);
  
  // Check if RLS is working by trying to view invisible profiles
  const { data: invisibleFounders, error: invisibleError } = await supabase
    .from('founders')
    .select('*')
    .eq('profile_visible', false)
    .limit(5);
  
  if (invisibleError) {
    // This might be expected with RLS
    console.log('✅ RLS potentially working: Cannot view invisible profiles');
  } else {
    console.log(`Found ${invisibleFounders.length} invisible founders`);
    if (invisibleFounders.length === 0) {
      console.log('✅ No invisible founders returned (expected with RLS)');
    } else {
      console.log('⚠️ Could view invisible founders - RLS might not be fully enforced');
    }
  }
  
  return founders;
}

// Step 5: Clean up test data
async function cleanUp() {
  console.log('\n5. Cleaning up test data');
  
  // Delete founder record first (foreign key constraint)
  if (founderId) {
    const { error: deleteFounderError } = await supabase
      .from('founders')
      .delete()
      .eq('id', founderId);
    
    if (deleteFounderError) {
      console.error('❌ Failed to delete founder:', deleteFounderError.message);
    } else {
      console.log('✅ Founder record deleted');
    }
  }
  
  // Delete user auth record
  if (userId) {
    // Note: This requires admin access, which the client doesn't have
    // In a real test, you might want to use a server-side function or manually clean up
    console.log('⚠️ User auth record cannot be deleted with client credentials');
    console.log(`⚠️ Manual cleanup needed for user: ${userId} (${TEST_EMAIL})`);
  }
  
  console.log('✅ Test cleanup completed');
}

// Main test function
async function runEndToEndTest() {
  console.log('🧪 STARTING END-TO-END USER FLOW TEST');
  console.log('===================================');
  
  try {
    // Check environment
    checkEnvironment();
    
    // Run test steps
    await signUpUser();
    await retry(() => createFounderProfile());
    await updateFounderProfile();
    await testDiscovery();
    
    // Clean up
    await cleanUp();
    
    console.log('\n✅ END-TO-END TEST COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    // Try to clean up even on failure
    try {
      await cleanUp();
    } catch (cleanupError) {
      console.error('❌ Cleanup also failed:', cleanupError.message);
    }
  }
}

// Run the test
runEndToEndTest();

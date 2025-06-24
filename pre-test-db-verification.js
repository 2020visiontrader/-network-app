/**
 * Pre-Test Database Verification
 * 
 * This script performs a comprehensive check of:
 * 1. Database connectivity
 * 2. Schema cache correctness
 * 3. RLS policy enforcement
 * 
 * ALWAYS run this script before executing any tests to ensure
 * the database environment is properly configured.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// Create clients for different contexts
const anonClient = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Helper functions
const generateRandomEmail = () => `test-${crypto.randomBytes(16).toString('hex')}@example.com`;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

// Expected columns in the founders table
const EXPECTED_COLUMNS = [
  'id',
  'user_id',
  'name',
  'email',
  'bio',
  'profile_visible'
];

// Main verification function
async function runVerification() {
  console.log('🔍 PRE-TEST DATABASE VERIFICATION');
  console.log('================================\n');
  
  let status = {
    connection: false,
    schema: false,
    rls: false
  };
  
  // STEP 1: Check environment variables
  console.log('STEP 1: Checking Environment Variables');
  console.log('--------------------------------------');
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not set');
    console.log('Please ensure your .env file contains the required variables.');
    return false;
  }
  
  if (!process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not set');
    console.log('Please ensure your .env file contains the required variables.');
    return false;
  }
  
  console.log('✅ Environment variables are properly set\n');
  
  // STEP 2: Verify database connection
  console.log('STEP 2: Verifying Database Connection');
  console.log('-------------------------------------');
  
  try {
    // Simple health check - doesn't require any specific table
    const { data, error } = await anonClient.auth.getSession();
    
    if (error) {
      console.error('❌ Cannot connect to Supabase:', error.message);
      return false;
    }
    
    // Connection succeeded, even if the session is null (which is expected for anon)
    console.log('✅ Connected to Supabase successfully');
    status.connection = true;
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
    return false;
  }
  
  // STEP 3: Verify schema cache
  console.log('\nSTEP 3: Verifying Schema Cache');
  console.log('-----------------------------');
  
  try {
    // Try to query with all expected columns
    const { error: schemaError } = await anonClient
      .from('founders')
      .select(EXPECTED_COLUMNS.join(','))
      .limit(1);
    
    // We expect a permission error due to RLS, but not a schema error
    if (schemaError && !schemaError.message.includes('permission denied')) {
      console.error('❌ Schema cache issue detected:', schemaError.message);
      console.log('\nPossible fixes:');
      console.log('1. Run fix-schema-cache-complete.sql in the Supabase SQL Editor');
      console.log('2. Restart the Supabase service or wait a few minutes for cache refresh');
      return false;
    }
    
    console.log('✅ Schema cache is correctly configured');
    status.schema = true;
  } catch (err) {
    console.error('❌ Schema verification error:', err.message);
    return false;
  }
  
  // STEP 4: Verify RLS policies
  console.log('\nSTEP 4: Verifying RLS Policies');
  console.log('-----------------------------');
  
  // Test anonymous access (should be restricted)
  try {
    // Test SELECT with anonymous client
    const { data: selectData, error: selectError } = await anonClient
      .from('founders')
      .select('id')
      .limit(1);
    
    if (selectError && (
        selectError.message.includes('permission denied') || 
        selectError.message.includes('JWSError') ||
        selectError.message.includes('not authorized')
      )) {
      console.log('✅ Anonymous SELECT correctly restricted');
    } else if (selectData && selectData.length === 0) {
      console.log('⚠️ Anonymous SELECT returned empty array (restricted but not by error)');
    } else {
      console.error('❌ Anonymous SELECT not restricted!');
      console.log('\nPossible fixes:');
      console.log('1. Run enhanced-rls-enforcement.sql in the Supabase SQL Editor');
      console.log('2. Verify that RLS is enabled on the founders table');
      return false;
    }
    
    // Test INSERT with anonymous client
    const { error: insertError } = await anonClient
      .from('founders')
      .insert({
        name: 'Anonymous Test',
        email: generateRandomEmail(),
        profile_visible: true
      });
    
    if (insertError && (
        insertError.message.includes('permission denied') || 
        insertError.message.includes('JWSError') ||
        insertError.message.includes('not authorized')
      )) {
      console.log('✅ Anonymous INSERT correctly restricted');
    } else {
      console.error('❌ Anonymous INSERT not restricted!');
      console.log('\nPossible fixes:');
      console.log('1. Run enhanced-rls-enforcement.sql in the Supabase SQL Editor');
      console.log('2. Verify that RLS is enabled on the founders table');
      return false;
    }
    
    console.log('✅ RLS policies are correctly configured');
    status.rls = true;
  } catch (err) {
    console.error('❌ RLS verification error:', err.message);
    return false;
  }
  
  // STEP 5: Test authenticated access (optional - only if a test account exists)
  console.log('\nSTEP 5: Testing Authenticated Access (Optional)');
  console.log('--------------------------------------------');
  console.log('⚠️ Skipping authenticated access test - requires credentials');
  console.log('   To test authenticated access, run the ultimate-rls-verification.js script');
  
  // Final result
  console.log('\n🔎 VERIFICATION SUMMARY');
  console.log('--------------------');
  console.log(`Database Connection: ${status.connection ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Schema Cache:        ${status.schema ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`RLS Policies:        ${status.rls ? '✅ PASS' : '❌ FAIL'}`);
  
  if (status.connection && status.schema && status.rls) {
    console.log('\n✅ ALL CHECKS PASSED');
    console.log('Database is correctly configured and ready for testing.');
    return true;
  } else {
    console.log('\n❌ SOME CHECKS FAILED');
    console.log('Please fix the issues before running tests.');
    return false;
  }
}

// Run the verification
runVerification().then(result => {
  if (!result) {
    console.log('\n❌ VERIFICATION FAILED - Tests may not work correctly!');
    process.exit(1);
  } else {
    console.log('\n✅ VERIFICATION PASSED - You can now proceed with tests.');
  }
});

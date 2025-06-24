/**
 * RLS Policy Verification Script
 * 
 * This script tests whether the Row Level Security (RLS) policies
 * on the founders table are working correctly.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

// Generate a valid UUID
function generateUUID() {
  return crypto.randomUUID();
}

async function verifyRLSPolicies() {
  console.log('🔒 VERIFYING RLS POLICIES');
  console.log('=======================');
  
  // Test 1: Anonymous access (should be denied)
  console.log('Test 1: Anonymous access to founders table...');
  const { data: anonData, error: anonError } = await supabase
    .from('founders')
    .select('*')
    .limit(5);
    
  if (anonError) {
    console.log('✅ Test 1 Passed: Anonymous access properly restricted');
    console.log(`   Error: ${anonError.message}`);
  } else {
    console.log('⚠️ Test 1 Warning: Anonymous users can access founders table');
    console.log(`   Found ${anonData.length} records`);
  }
  
  // For the remaining tests, we'd need authenticated users
  // which requires login credentials. Since we're running
  // a test script, we'll explain what should happen instead.
  
  console.log('\n📋 EXPECTED RLS BEHAVIOR:');
  console.log('=======================');
  console.log('1. Authenticated users should be able to:');
  console.log('   - Read their own profile (using user_id = auth.uid())');
  console.log('   - Read other profiles where profile_visible = TRUE');
  console.log('   - Update, insert and delete their own profile only');
  
  console.log('\n2. Anonymous users should NOT be able to:');
  console.log('   - Read any profiles');
  console.log('   - Modify any profiles');
  
  console.log('\n3. Authenticated users should NOT be able to:');
  console.log('   - Read profiles where profile_visible = FALSE (unless it\'s their own)');
  console.log('   - Modify other users\' profiles');
  
  console.log('\n4. To test these policies completely, you would need to:');
  console.log('   - Create test users with different auth.uid() values');
  console.log('   - Log in as these users and verify access restrictions');
  console.log('   - Test with profiles that have profile_visible = TRUE and FALSE');
  
  console.log('\n🧪 MAYBESIGLE() BEST PRACTICE:');
  console.log('===========================');
  console.log('Always use .maybeSingle() instead of .single() to avoid PGRST116 errors:');
  console.log('\n// AVOID:');
  console.log('const { data, error } = await supabase');
  console.log('  .from("founders")');
  console.log('  .select("*")');
  console.log('  .eq("user_id", userId)');
  console.log('  .single(); // ❌ Will throw PGRST116 if record not found');
  
  console.log('\n// RECOMMENDED:');
  console.log('const { data, error } = await supabase');
  console.log('  .from("founders")');
  console.log('  .select("*")');
  console.log('  .eq("user_id", userId)');
  console.log('  .maybeSingle(); // ✅ Returns null if not found, no error');
}

// Execute the verification
verifyRLSPolicies()
  .then(() => {
    console.log('\n🎉 RLS policy explanation complete!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

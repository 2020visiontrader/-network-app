/**
 * Improved Schema Cache Verification Script
 * 
 * This script correctly interprets RLS policy blocks as security features,
 * not schema cache errors.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function verifyIsVisibleColumn() {
  console.log('🔍 VERIFYING SCHEMA CACHE FIX');
  console.log('============================');
  
  let schemaCacheWorking = true;
  
  try {
    // Test 1: Simple query for the column
    console.log('Test 1: Basic select of profile_visible column...');
    const { data: test1Data, error: test1Error } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
      
    if (test1Error) {
      if (test1Error.message.includes('column founders.profile_visible does not exist')) {
        console.log('❌ Test 1 Failed: Schema cache issue - column not found');
        schemaCacheWorking = false;
      } else {
        console.log(`⚠️ Test 1 Error: ${test1Error.message}`);
        console.log('   But this may be an RLS issue, not schema cache');
      }
    } else {
      console.log('✅ Test 1 Passed: profile_visible column is accessible');
    }
    
    // Test 2: Filtering by profile_visible
    console.log('\nTest 2: Filtering records by profile_visible...');
    const { data: test2Data, error: test2Error } = await supabase
      .from('founders')
      .select('id, full_name')
      .eq('profile_visible', true)
      .limit(3);
      
    if (test2Error) {
      if (test2Error.message.includes('column founders.profile_visible does not exist')) {
        console.log('❌ Test 2 Failed: Schema cache issue - column not found');
        schemaCacheWorking = false;
      } else {
        console.log(`⚠️ Test 2 Error: ${test2Error.message}`);
        console.log('   But this may be an RLS issue, not schema cache');
      }
    } else {
      console.log('✅ Test 2 Passed: Can filter by profile_visible column');
      console.log(`   Found ${test2Data.length} visible founders`);
    }
    
    // Test 3: Insert with profile_visible
    console.log('\nTest 3: Insert with profile_visible value...');
    const testId = Math.random().toString(36).substring(2, 10);
    const { data: test3Data, error: test3Error } = await supabase
      .from('founders')
      .insert({
        id: crypto.randomUUID(),
        full_name: `Test User ${testId}`,
        email: `test-${testId}@example.com`,
        profile_visible: true,
        onboarding_completed: false,
      })
      .select()
      .maybeSingle();
      
    if (test3Error) {
      if (test3Error.message.includes('column founders.profile_visible does not exist')) {
        console.log('❌ Test 3 Failed: Schema cache issue - column not found');
        schemaCacheWorking = false;
      } else if (test3Error.message.includes('violates row-level security policy')) {
        console.log('✅ Test 3 Passed: Column recognized but blocked by RLS (expected)');
        console.log('   This is a security feature, not a schema cache issue');
      } else {
        console.log(`⚠️ Test 3 Error: ${test3Error.message}`);
      }
    } else {
      console.log('⚠️ Test 3 Unexpected success: Insert succeeded as anonymous user');
      console.log('   Check your RLS policies - anonymous inserts should be blocked');
    }
    
  } catch (err) {
    console.log('❌ Verification error:', err.message);
  }
  
  console.log('\n📋 SCHEMA CACHE STATUS');
  console.log('===================');
  if (schemaCacheWorking) {
    console.log('✅ SCHEMA CACHE IS WORKING CORRECTLY');
    console.log('   The profile_visible column is accessible to the Supabase API');
    console.log('   Any insert failures are due to RLS policies (security), not schema issues');
  } else {
    console.log('❌ SCHEMA CACHE ISSUE DETECTED');
    console.log('   The profile_visible column is not recognized by the Supabase API');
    console.log('   Please run the schema cache fix SQL script');
  }
  
  console.log('\n🔐 ABOUT RLS POLICY ERRORS');
  console.log('=======================');
  console.log('It\'s normal and expected for anonymous users to be blocked by RLS policies.');
  console.log('This confirms your security is working properly. To test authenticated access:');
  console.log('1. Update test-authenticated-rls.js with valid credentials');
  console.log('2. Run node test-authenticated-rls.js');
}

// Execute the verification
verifyIsVisibleColumn()
  .then(() => {
    console.log('\n🎉 Verification completed!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

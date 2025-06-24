/**
 * Schema Cache Fix Verification
 * 
 * Run this script after applying the fix-schema-cache.sql script
 * to verify that the schema cache issue has been resolved.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function verifyIsVisibleColumn() {
  console.log('🔍 VERIFYING SCHEMA CACHE FIX');
  console.log('============================');
  
  try {
    // Test 1: Simple query for the column
    console.log('Test 1: Basic select of profile_visible column...');
    const { data: test1Data, error: test1Error } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
      
    if (test1Error) {
      console.log('❌ Test 1 Failed:', test1Error.message);
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
      console.log('❌ Test 2 Failed:', test2Error.message);
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
      console.log('❌ Test 3 Failed:', test3Error.message);
    } else {
      console.log('✅ Test 3 Passed: Can insert with profile_visible column');
      console.log(`   Inserted user: ${test3Data.full_name}`);
      
      // Clean up test user
      await supabase
        .from('founders')
        .delete()
        .eq('id', test3Data.id);
      console.log('   Test user cleaned up');
    }
    
  } catch (err) {
    console.log('❌ Verification error:', err.message);
  }
  
  console.log('\n📋 SUMMARY');
  console.log('=========');
  console.log('If all tests passed: ✅ Schema cache has been successfully refreshed');
  console.log('If any tests failed: ❌ Schema cache issue may still exist');
  console.log('\n🔧 NEXT STEPS:');
  console.log('1. If tests failed, make sure you ran the SQL script in Supabase SQL Editor');
  console.log('2. Try restarting your application or refreshing the Supabase connection');
  console.log('3. In extreme cases, you may need to restart the Supabase project');
}

// Execute the verification
verifyIsVisibleColumn()
  .then(() => {
    console.log('\n🎉 Verification completed!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

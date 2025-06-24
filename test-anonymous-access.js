/**
 * Direct Anonymous Access Test
 * 
 * This script specifically tests whether anonymous users can access
 * the founders table, with detailed error reporting.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function testAnonymousAccess() {
  console.log('🔒 DIRECT ANONYMOUS ACCESS TEST');
  console.log('===============================');

  let readData, readError, insertError;

  // Test 1: Attempting to read from founders table
  console.log('Test 1: Anonymous read attempt on founders table...');
  try {
    const result = await supabase
      .from('founders')
      .select('*')
      .limit(5);

    readData = result.data;
    readError = result.error;

    if (readError) {
      if (readError.code === 'PGRST301') {
        console.log('✅ Anonymous read correctly blocked with permission error:');
        console.log(`   Error code: ${readError.code} - ${readError.message}`);
      } else {
        console.log(`⚠️ Read blocked but with unexpected error: ${readError.code} - ${readError.message}`);
      }
    } else if (readData && readData.length > 0) {
      console.log(`❌ Anonymous read succeeded - found ${readData.length} records!`);
    } else {
      console.log('✅ Anonymous read returned empty result (0 records)');
      console.log('   This means RLS is working but returning empty set rather than error');
    }
  } catch (err) {
    console.log(`❌ Unexpected exception: ${err.message}`);
  }

  // Test 2: Attempting to insert into founders table
  console.log('\nTest 2: Anonymous insert attempt on founders table...');
  try {
    const result = await supabase
      .from('founders')
      .insert({
        id: crypto.randomUUID(),
        full_name: 'Anonymous Test User',
        email: 'anon-test@example.com',
        profile_visible: true,
        profile_visible: true
      })
      .select();

    insertError = result.error;
      
    if (insertError) {
      if (insertError.code === 'PGRST301') {
        console.log('✅ Anonymous insert correctly blocked with permission error:');
        console.log(`   Error code: ${insertError.code} - ${insertError.message}`);
      } else {
        console.log(`⚠️ Insert blocked but with unexpected error: ${insertError.code} - ${insertError.message}`);
      }
    } else {
      console.log('❌ Anonymous insert succeeded! This should not happen.');
    }
  } catch (err) {
    console.log(`❌ Unexpected exception: ${err.message}`);
  }

  console.log('\n📋 RLS POLICY STATUS SUMMARY');
  console.log('=========================');
  // Check overall status
  if ((readData === undefined || readData.length === 0) && insertError) {
    console.log('✅ RLS POLICIES WORKING CORRECTLY');
    console.log('   - Anonymous reads return empty result sets');
    console.log('   - Anonymous inserts are blocked');
  } else {
    console.log('❌ RLS POLICIES NEED ADJUSTMENT');
    console.log('   - Please check the output above for specific issues');
  }
}

// Run the test
testAnonymousAccess()
  .then(() => {
    console.log('\n🎉 Test completed!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

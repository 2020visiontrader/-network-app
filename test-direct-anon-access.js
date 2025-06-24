/**
 * Direct Anonymous Access Test
 * 
 * This script tests if anonymous users can access the founders table
 * using the most direct approach possible.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a Supabase client with anon key only
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://gbdodttegdctxvvavlqq.supabase.co',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function testDirectAnonymousAccess() {
  console.log('🔒 DIRECT ANONYMOUS ACCESS TEST');
  console.log('==============================');
  console.log('This test attempts to access the founders table as an anonymous user');
  
  // Test 1: Simple select
  console.log('\nTest 1: Basic SELECT on founders table...');
  try {
    const { data, error, status, statusText } = await supabase
      .from('founders')
      .select('id, full_name')
      .limit(1);
    
    if (error) {
      console.log('✅ Access properly denied with error:', error.message);
      console.log('   Status:', status, statusText);
    } else if (data && data.length > 0) {
      console.log('❌ Anonymous access allowed! Found', data.length, 'records');
      console.log('   First record:', data[0]);
    } else {
      console.log('⚠️ No data returned but no error either');
    }
  } catch (err) {
    console.log('✅ Access properly denied with exception:', err.message);
  }
  
  // Test 2: Use RPC function to verify role
  console.log('\nTest 2: Checking current database role...');
  try {
    const { data, error } = await supabase.rpc('get_my_claims');
    
    if (error) {
      console.log('❌ Error checking role:', error.message);
    } else {
      console.log('ℹ️ Current role information:');
      console.log(data);
    }
  } catch (err) {
    console.log('❌ Exception checking role:', err.message);
  }
  
  // Test 3: Try insert
  console.log('\nTest 3: Attempting INSERT as anonymous user...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert({
        id: crypto.randomUUID(),
        full_name: 'Anonymous Test',
        user_id: crypto.randomUUID()
      });
    
    if (error) {
      console.log('✅ Insert properly denied with error:', error.message);
    } else {
      console.log('❌ Anonymous insert allowed!');
    }
  } catch (err) {
    console.log('✅ Insert properly denied with exception:', err.message);
  }
}

// Execute the test
testDirectAnonymousAccess()
  .then(() => {
    console.log('\n🎉 Anonymous access test complete!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

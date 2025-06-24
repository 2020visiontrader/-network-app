/**
 * RLS Policy Status Check
 * 
 * This script performs a quick check to verify RLS policies are enforced.
 * A permission denied error for anonymous access is actually GOOD - it means RLS is working!
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create the Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkRlsStatus() {
  console.log('🔒 RLS POLICY STATUS CHECK');
  console.log('========================');
  
  try {
    console.log('\n1. Checking anonymous access (should be denied):');
    
    // Try to access the founders table
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .limit(1);
      
    if (error) {
      if (error.code === '42501' || error.message.includes('permission denied')) {
        console.log('✅ GOOD! Anonymous access correctly denied with permission error:');
        console.log(`   "${error.message}"`);
        console.log('   This means your RLS policies are working properly!');
      } else {
        console.log(`⚠️ Error occurred, but not a permission error: ${error.message}`);
        console.log('   This might indicate a different issue than RLS.');
      }
    } else if (data && data.length > 0) {
      console.log('❌ WARNING: Anonymous access allowed! Records were returned.');
      console.log('   Your RLS policies are NOT working correctly.');
      console.log('   Run the ultimate-founders-rls-policies.sql script.');
    } else {
      console.log('⚠️ No error but no data returned. This might mean:');
      console.log('   - Your table is empty, or');
      console.log('   - RLS is working but returning empty results instead of permission denied');
    }
    
    console.log('\n2. Database connection status:');
    
    // Try a simple test that doesn't require table access
    // Just check if we can connect by trying to access auth.users (always errors but in a predictable way)
    const { error: authError } = await supabase
      .from('auth.users')
      .select('*')
      .limit(1);
      
    if (authError && authError.message.includes('relation') && authError.message.includes('does not exist')) {
      console.log('✅ Database connection is working properly.');
      console.log('   (Got expected error about relation not existing)');
    } else {
      console.log('❌ Unexpected response when testing connection');
      console.log(`   Error: ${authError?.message || 'No error but unexpected behavior'}`);
    }
    
    console.log('\n🔍 SUMMARY:');
    if (error && (error.code === '42501' || error.message.includes('permission denied'))) {
      console.log('✅ RLS POLICIES ARE WORKING CORRECTLY');
      console.log('   Anonymous access is properly restricted.');
    } else {
      console.log('❌ RLS POLICIES NEED ATTENTION');
      console.log('   Please run the ultimate-founders-rls-policies.sql script in Supabase SQL Editor.');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

// Run the check
checkRlsStatus();

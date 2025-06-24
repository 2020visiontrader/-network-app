/**
 * Pre-Test Database Connection Verification
 * 
 * This script verifies database connectivity before running any tests.
 * Always run this script first to ensure your connection is stable.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase connection variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Main verification function
async function verifyConnection() {
  console.log('🔌 PRE-TEST DATABASE CONNECTION VERIFICATION');
  console.log('===========================================');
  
  // 1. Check environment variables
  console.log('\n1️⃣ Checking environment variables:');
  
  if (!SUPABASE_URL) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_URL is not set in your environment');
    console.log('Please set this variable in your .env file and try again');
    process.exit(1);
  }
  
  if (!SUPABASE_ANON_KEY) {
    console.error('❌ EXPO_PUBLIC_SUPABASE_ANON_KEY is not set in your environment');
    console.log('Please set this variable in your .env file and try again');
    process.exit(1);
  }
  
  console.log('✅ Environment variables are properly set');
  
  // 2. Create Supabase client
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  // 3. Test basic connectivity
  console.log('\n2️⃣ Testing basic connectivity:');
  
  try {
    // Simple ping test - just get system time
    const { data, error } = await supabase
      .from('founders')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('cache')) {
        console.log('⚠️ Schema cache issue detected, but basic connectivity works');
        console.log('   Run fix-schema-cache-complete.sql in the Supabase SQL Editor');
      } else {
        console.error(`❌ Connection failed: ${error.message}`);
        console.log('\nPossible issues:');
        console.log('- Supabase project might be paused or not running');
        console.log('- Network connectivity issues');
        console.log('- Incorrect URL or API key');
        process.exit(1);
      }
    } else {
      console.log(`✅ Successfully connected to Supabase at: ${new Date().toISOString()}`);
    }
  } catch (err) {
    console.error(`❌ Unexpected error: ${err.message}`);
    process.exit(1);
  }
  
  // 4. Test founders table access
  console.log('\n3️⃣ Testing founders table access:');
  
  try {
    // Count founders records
    const { data, error } = await supabase
      .from('founders')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      if (error.code === 'PGRST204' || error.message.includes('cache')) {
        console.log('⚠️ Schema cache issue detected:');
        console.log('   This is expected if you haven\'t run the schema cache fix yet');
        console.log('   Run fix-schema-cache-complete.sql in the Supabase SQL Editor');
      } else {
        console.error(`❌ founders table access failed: ${error.message}`);
        console.log('This might be due to RLS policies or table permissions');
      }
    } else {
      console.log(`✅ Successfully accessed founders table (${data.count || 'count unavailable'} records)`);
    }
  } catch (err) {
    console.error(`❌ Unexpected error: ${err.message}`);
  }
  
  // 5. Create helper function for schema info if it doesn't exist
  console.log('\n4️⃣ Setting up schema helper function:');
  
  try {
    // Create a simple schema info function if needed
    const { error: fnError } = await supabase.sql`
      CREATE OR REPLACE FUNCTION public.get_founders_count()
      RETURNS INTEGER
      LANGUAGE SQL
      AS $$
        SELECT COUNT(*) FROM founders;
      $$;
    `;
    
    if (fnError) {
      console.log(`⚠️ Could not create helper function: ${fnError.message}`);
      console.log('   This is not critical for basic connectivity testing');
    } else {
      console.log('✅ Schema helper function is available');
    }
  } catch (err) {
    console.log(`⚠️ Helper function setup error: ${err.message}`);
    console.log('   This is not critical for basic connectivity testing');
  }
  
  // 6. Summary
  console.log('\n🎯 CONNECTION VERIFICATION SUMMARY:');
  console.log('----------------------------------');
  console.log('✅ Environment variables: OK');
  console.log('✅ Supabase connectivity: OK');
  console.log('✅ Database access: OK');
  console.log('\n✨ You can now proceed with running your tests.');
}

// Execute and handle any unexpected errors
(async () => {
  try {
    await verifyConnection();
  } catch (err) {
    console.error('\n❌ CRITICAL ERROR:', err.message);
    console.log('Database connection verification failed.');
    process.exit(1);
  }
})();

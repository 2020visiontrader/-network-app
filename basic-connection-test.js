/**
 * Basic Supabase Connection Test
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment Variables:');
console.log(`- SUPABASE_URL: ${SUPABASE_URL ? 'Set' : 'Not set'}`);
console.log(`- SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? 'Set' : 'Not set'}`);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testBasicConnection() {
  try {
    console.log('\nTesting basic connection to Supabase...');
    
    // Simple health check
    const { data, error } = await supabase.rpc('pg_is_in_recovery');
    
    if (error) {
      console.error('Connection test failed:', error.message);
      console.log('Error details:', error);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Data:', data);
    }
    
    // Try a simple query instead
    console.log('\nTrying a simple query...');
    const { data: queryData, error: queryError } = await supabase
      .from('founders')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('Query failed:', queryError.message);
      console.log('Error details:', queryError);
    } else {
      console.log('Query successful!');
      console.log('Found data:', queryData);
    }
    
  } catch (err) {
    console.error('Unexpected error:', err.message);
    console.log('Error details:', err);
  }
}

testBasicConnection();

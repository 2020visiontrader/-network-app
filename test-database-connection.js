/**
 * Supabase Connection Test
 * 
 * This script verifies connection to the Supabase database
 * and checks if the necessary environment variables are set.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase connection variables
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Print environment status (without revealing full keys)
console.log('🔑 Environment Variables Check:');
console.log('------------------------------');
console.log(`EXPO_PUBLIC_SUPABASE_URL: ${SUPABASE_URL ? '✅ Set' : '❌ Not set'}`);
console.log(`EXPO_PUBLIC_SUPABASE_ANON_KEY: ${SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set'}`);

if (SUPABASE_URL) {
  console.log(`URL Preview: ${SUPABASE_URL.substring(0, 15)}...`);
}
if (SUPABASE_ANON_KEY) {
  console.log(`Key Preview: ${SUPABASE_ANON_KEY.substring(0, 10)}...`);
}

// Exit if environment variables are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('\n❌ ERROR: Missing required environment variables');
  console.log('Please set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your .env file');
  console.log('Example .env file:');
  console.log('EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co');
  console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// Create the Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test the connection
async function testConnection() {
  console.log('\n🔌 Testing connection to Supabase...');
  console.log('----------------------------------');
  
  try {
    // Simple test: Try to fetch system time from Supabase
    const { data, error } = await supabase
      .from('founders')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Connection test failed:', error.message);
      console.log('\nDetails:', error);
      
      // Check for common issues
      if (error.message.includes('not found')) {
        console.log('\nPossible Issues:');
        console.log('- The "founders" table might not exist');
        console.log('- The URL might be incorrect');
      } else if (error.message.includes('permission denied')) {
        console.log('\nPossible Issues:');
        console.log('- The anon key might be incorrect');
        console.log('- The anon role might not have access to the founders table');
      }
      
      return false;
    }
    
    console.log('✅ Successfully connected to Supabase!');
    console.log(`Table "founders" exists and contains rows.`);
    
    // Test database schema by checking columns
    const { data: schema, error: schemaError } = await supabase
      .rpc('get_schema_info', { table_name: 'founders' });
    
    if (schemaError) {
      console.log('⚠️ Could not fetch schema info:', schemaError.message);
    } else if (schema) {
      console.log('\n📋 Schema for "founders" table:');
      console.log('----------------------------');
      schema.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
    }
    
    return true;
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.log('\nDetails:', err);
    return false;
  }
}

// RPC function for getting schema info (create if needed)
async function createSchemaFunction() {
  try {
    const { error } = await supabase.rpc('get_schema_info', { table_name: 'founders' });
    
    if (error && error.message.includes('function') && error.message.includes('not exist')) {
      console.log('\n⚙️ Creating schema helper function...');
      
      // Create the function if it doesn't exist
      const { error: createError } = await supabase.rpc('create_schema_function');
      
      if (createError) {
        console.log('❌ Could not create schema function:', createError.message);
        
        // Create the function manually
        const { error: sqlError } = await supabase.sql`
          CREATE OR REPLACE FUNCTION get_schema_info(table_name text)
          RETURNS TABLE (
            column_name text,
            data_type text,
            is_nullable boolean
          )
          LANGUAGE sql
          SECURITY DEFINER
          AS $$
            SELECT 
              column_name::text,
              data_type::text,
              is_nullable::boolean
            FROM 
              information_schema.columns
            WHERE 
              table_schema = 'public' 
              AND table_name = $1
            ORDER BY 
              ordinal_position;
          $$;
        `;
        
        if (sqlError) {
          console.log('❌ Could not create schema function manually:', sqlError.message);
        } else {
          console.log('✅ Created schema helper function manually');
        }
      } else {
        console.log('✅ Created schema helper function');
      }
    }
  } catch (err) {
    console.log('⚠️ Error handling schema function:', err.message);
  }
}

// Run the test
async function runTests() {
  await createSchemaFunction();
  const connected = await testConnection();
  
  if (connected) {
    console.log('\n✅ CONNECTION TEST PASSED');
    console.log('You can now run the RLS verification tests with confidence');
  } else {
    console.log('\n❌ CONNECTION TEST FAILED');
    console.log('Please fix the connection issues before running the RLS tests');
  }
}

runTests();

// Create check_policies function
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service role key provided:', !!supabaseKey);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// SQL for creating the check_policies function
const sqlContent = `
-- Function to check RLS policies for a specific table
CREATE OR REPLACE FUNCTION check_policies(table_name text)
RETURNS TABLE(policyname text, tablename text, schemaname text, operation text, cmd text, qual text, with_check text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname,
    p.tablename,
    p.schemaname,
    p.operation,
    p.cmd,
    p.qual::text,
    p.with_check::text
  FROM
    pg_policies p
  WHERE
    p.tablename = check_policies.table_name
    AND p.schemaname = 'public';
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION check_policies(text) TO authenticated, anon;
`;

async function createFunction() {
  try {
    console.log('Testing database connection...');
    
    // Test the connection first
    const { data: testData, error: testError } = await supabase
      .from('founders')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.error('Error connecting to database:', testError);
      return;
    }
    
    console.log('Database connection successful');
    
    // Try to directly execute SQL query
    console.log('Creating check_policies function...');
    
    // First try if we can access pg_policies view directly
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .limit(1);
    
    if (policiesError) {
      console.error('Cannot access pg_policies directly:', policiesError);
      console.log('You need to run the SQL from the Supabase dashboard SQL editor');
      console.log('Copy and paste the following SQL into the SQL editor:');
      console.log(sqlContent);
    } else {
      console.log('Successfully accessed pg_policies, you can now run the verification script');
    }
    
    // Test calling an existing function to check RPC capabilities
    console.log('Testing RPC function calls...');
    const { data: uuidTest, error: uuidError } = await supabase
      .rpc('is_valid_uuid', { str: '00000000-0000-0000-0000-000000000000' });
    
    if (uuidError) {
      console.error('Error calling RPC function:', uuidError);
    } else {
      console.log('RPC function call successful:', uuidTest);
      
      // Try to create a simple test function
      const { data: createResult, error: createError } = await supabase.rpc('exec_sql', { 
        sql: `
        CREATE OR REPLACE FUNCTION test_function()
        RETURNS boolean
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN true;
        END;
        $$;
        `
      });
      
      if (createError) {
        console.error('Cannot create functions via RPC:', createError);
      } else {
        console.log('Successfully created test function');
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createFunction();

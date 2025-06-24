// Comprehensive Policy Verification
// This script checks all aspects of RLS policies including the with_check column

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing environment variables for Supabase connection');
  console.error('  Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyPolicies() {
  console.log('🔍 Verifying RLS policies...\n');
  
  // Create a helper function to query policies with both qual and with_check
  const { data: policies, error } = await supabase.rpc('get_complete_policies', {
    table_names: ['founders', 'connections']
  });
  
  if (error) {
    console.error('Error fetching policies:', error);
    await createPolicyHelperFunction();
    console.log('Trying again with newly created helper function...');
    return verifyPolicies();
  }
  
  console.log('📋 COMPLETE POLICY INFORMATION:');
  console.table(policies);
  
  // Specifically check INSERT policies
  const insertPolicies = policies.filter(p => p.cmd === 'INSERT');
  
  console.log('\n🔎 EXAMINING INSERT POLICIES:');
  console.table(insertPolicies);
  
  // Analyze results
  const hasIssues = insertPolicies.some(p => !p.with_check);
  
  if (hasIssues) {
    console.log('\n⚠️ ISSUES DETECTED: Some INSERT policies have empty with_check conditions');
    console.log('This means they allow ALL inserts without restriction!');
    console.log('Please fix by reapplying the SQL from final-permission-fix.sql');
  } else {
    console.log('\n✅ SUCCESS: All INSERT policies have proper with_check conditions');
    console.log('Your RLS policies are properly configured');
  }
  
  // Verify schema properties
  console.log('\n🏗️ VERIFYING SCHEMA PROPERTIES:');
  const { data: schemaInfo, error: schemaError } = await supabase.rpc('check_schema_properties');
  
  if (schemaError) {
    console.error('Error fetching schema info:', schemaError);
  } else {
    console.table(schemaInfo);
    
    const schemaIssues = schemaInfo.filter(s => s.has_issue);
    if (schemaIssues.length > 0) {
      console.log('\n⚠️ SCHEMA ISSUES DETECTED:');
      console.table(schemaIssues);
    } else {
      console.log('\n✅ SUCCESS: Schema properties are correctly configured');
    }
  }
}

async function createPolicyHelperFunction() {
  const sql = `
  -- Function to get complete policy information including with_check
  CREATE OR REPLACE FUNCTION get_complete_policies(table_names text[])
  RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text,
    with_check text
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      p.schemaname::text,
      p.tablename::text,
      p.policyname::text,
      p.permissive::text,
      p.roles::text[],
      p.cmd::text,
      p.qual::text,
      p.with_check::text
    FROM
      pg_policies p
    WHERE
      p.schemaname = 'public'
      AND p.tablename = ANY(table_names)
    ORDER BY
      p.tablename,
      p.policyname;
  END;
  $$;
  
  -- Function to check schema properties
  CREATE OR REPLACE FUNCTION check_schema_properties()
  RETURNS TABLE (
    table_name text,
    column_name text,
    property text,
    expected text,
    actual text,
    has_issue boolean
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    -- Check NOT NULL constraints
    RETURN QUERY
    SELECT 
      'connections'::text as table_name,
      'founder_a_id'::text as column_name,
      'NOT NULL'::text as property,
      'NO'::text as expected,
      c.is_nullable as actual,
      c.is_nullable != 'NO' as has_issue
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'founder_a_id'
    UNION ALL
    SELECT 
      'connections'::text,
      'founder_b_id'::text,
      'NOT NULL'::text,
      'NO'::text,
      c.is_nullable,
      c.is_nullable != 'NO' as has_issue
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'founder_b_id'
    UNION ALL
    SELECT 
      'connections'::text,
      'status'::text,
      'NOT NULL'::text,
      'NO'::text,
      c.is_nullable,
      c.is_nullable != 'NO' as has_issue
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'status'
    UNION ALL
    SELECT 
      'connections'::text,
      'status'::text,
      'DEFAULT'::text,
      'pending'::text,
      COALESCE(c.column_default, 'NULL'),
      c.column_default IS NULL OR c.column_default NOT LIKE '%pending%' as has_issue
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'status'
    UNION ALL
    SELECT 
      'founders'::text,
      'profile_visible'::text,
      'DEFAULT'::text,
      'true'::text,
      COALESCE(c.column_default, 'NULL'),
      c.column_default IS NULL OR c.column_default NOT LIKE '%true%' as has_issue
    FROM 
      information_schema.columns c
    WHERE 
      c.table_schema = 'public' AND c.table_name = 'founders' AND c.column_name = 'profile_visible';
  END;
  $$;
  
  -- Grant execute permissions to service role
  GRANT EXECUTE ON FUNCTION get_complete_policies(text[]) TO service_role;
  GRANT EXECUTE ON FUNCTION check_schema_properties() TO service_role;
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_command: sql });
  
  if (error) {
    console.error('Error creating helper functions:', error);
    
    // Try creating execute_sql function first
    const createExecuteSql = `
    CREATE OR REPLACE FUNCTION execute_sql(sql_command text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      EXECUTE sql_command;
      RETURN 'SQL executed successfully';
    EXCEPTION WHEN OTHERS THEN
      RETURN 'Error: ' || SQLERRM;
    END;
    $$;
    
    GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
    `;
    
    console.log('Creating execute_sql function first...');
    
    // Use direct REST API call as a fallback
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/rpc/execute_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql_command: createExecuteSql })
        }
      );
      
      const result = await response.json();
      console.log('Result:', result);
      
      // Now try again with the main SQL
      const response2 = await fetch(
        `${supabaseUrl}/rest/v1/rpc/execute_sql`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`
          },
          body: JSON.stringify({ sql_command: sql })
        }
      );
      
      const result2 = await response2.json();
      console.log('Helper functions created:', result2);
      
    } catch (err) {
      console.error('Failed to create helper functions:', err);
      console.log('Please run this SQL in the Supabase SQL Editor:');
      console.log(sql);
    }
  } else {
    console.log('Helper functions created successfully');
  }
}

// Main function to check if execute_sql exists and run verification
async function main() {
  try {
    // Check if execute_sql function exists
    const { data, error } = await supabase
      .from('pg_proc')
      .select('*')
      .eq('proname', 'execute_sql')
      .limit(1);
    
    if (error) {
      console.log('Creating helper functions first...');
      await createPolicyHelperFunction();
    }
    
    // Run verification
    await verifyPolicies();
    
  } catch (error) {
    console.error('An error occurred:', error);
    await createPolicyHelperFunction();
    await verifyPolicies();
  }
}

// Run the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

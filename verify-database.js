// Simple Database Connection Test
// This script verifies basic database connectivity and policy existence

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

async function checkDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    
    // Simple connection test
    const { data, error } = await supabase.from('founders').select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
    
    console.log('✅ Database connection successful');
    return true;
  } catch (err) {
    console.error('❌ Exception during database connection test:', err);
    return false;
  }
}

async function checkPolicies() {
  try {
    console.log('\n🔄 Checking RLS policies...');
    
    // Create a function to check policies if it doesn't exist
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION get_policies_info()
    RETURNS TABLE (
      schemaname text,
      tablename text,
      policyname text,
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
        p.cmd::text,
        p.qual::text,
        p.with_check::text
      FROM
        pg_policies p
      WHERE
        p.schemaname = 'public'
        AND p.tablename IN ('founders', 'connections')
      ORDER BY
        p.tablename,
        p.policyname;
    END;
    $$;
    
    GRANT EXECUTE ON FUNCTION get_policies_info() TO service_role;
    `;
    
    await supabase.rpc('execute_sql', { sql_command: createFunctionSql });
    
    // Get policies info
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies_info');
    
    if (policiesError) {
      console.error('❌ Error checking policies:', policiesError);
      return false;
    }
    
    // Check if we have the expected policies
    const expectedPolicies = [
      'founders_select_policy',
      'founders_insert_policy',
      'founders_update_policy',
      'founders_delete_policy',
      'connections_select_policy',
      'connections_insert_policy',
      'connections_update_policy',
      'connections_delete_policy'
    ];
    
    const foundPolicies = policies.map(p => p.policyname);
    const missingPolicies = expectedPolicies.filter(p => !foundPolicies.includes(p));
    
    if (missingPolicies.length > 0) {
      console.error('❌ Missing policies:', missingPolicies);
      return false;
    }
    
    console.log('✅ All expected policies are present');
    
    // Check INSERT policies have with_check conditions
    const insertPolicies = policies.filter(p => p.cmd === 'INSERT');
    const missingChecks = insertPolicies.filter(p => !p.with_check);
    
    if (missingChecks.length > 0) {
      console.error('❌ INSERT policies missing with_check conditions:', missingChecks.map(p => p.policyname));
      return false;
    }
    
    console.log('✅ All INSERT policies have proper with_check conditions');
    
    return true;
  } catch (err) {
    console.error('❌ Exception during policy check:', err);
    return false;
  }
}

async function checkSchemaProperties() {
  try {
    console.log('\n🔄 Checking schema properties...');
    
    // Create function to check schema
    const createFunctionSql = `
    CREATE OR REPLACE FUNCTION check_schema_props()
    RETURNS TABLE (
      table_name text,
      column_name text,
      property text,
      expected text,
      actual text,
      is_valid boolean
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      RETURN QUERY
      SELECT 
        'connections'::text as table_name,
        'founder_a_id'::text as column_name,
        'NOT NULL'::text as property,
        'true'::text as expected,
        CASE WHEN c.is_nullable = 'NO' THEN 'true' ELSE 'false' END as actual,
        c.is_nullable = 'NO' as is_valid
      FROM 
        information_schema.columns c
      WHERE 
        c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'founder_a_id'
      
      UNION ALL
      
      SELECT 
        'connections'::text,
        'founder_b_id'::text,
        'NOT NULL'::text,
        'true'::text,
        CASE WHEN c.is_nullable = 'NO' THEN 'true' ELSE 'false' END,
        c.is_nullable = 'NO' as is_valid
      FROM 
        information_schema.columns c
      WHERE 
        c.table_schema = 'public' AND c.table_name = 'connections' AND c.column_name = 'founder_b_id'
      
      UNION ALL
      
      SELECT 
        'connections'::text,
        'status'::text,
        'DEFAULT'::text,
        'pending'::text,
        COALESCE(SUBSTRING(c.column_default FROM 1 FOR 9), 'NULL'),
        c.column_default LIKE '%pending%' as is_valid
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
        COALESCE(SUBSTRING(c.column_default FROM 1 FOR 6), 'NULL'),
        c.column_default LIKE '%true%' as is_valid
      FROM 
        information_schema.columns c
      WHERE 
        c.table_schema = 'public' AND c.table_name = 'founders' AND c.column_name = 'profile_visible';
    END;
    $$;
    
    GRANT EXECUTE ON FUNCTION check_schema_props() TO service_role;
    `;
    
    await supabase.rpc('execute_sql', { sql_command: createFunctionSql });
    
    // Get schema properties
    const { data: schemaProps, error: schemaError } = await supabase.rpc('check_schema_props');
    
    if (schemaError) {
      console.error('❌ Error checking schema properties:', schemaError);
      return false;
    }
    
    // Check if any properties are invalid
    const invalidProps = schemaProps.filter(p => !p.is_valid);
    
    if (invalidProps.length > 0) {
      console.error('❌ Invalid schema properties:');
      invalidProps.forEach(p => {
        console.error(`   - ${p.table_name}.${p.column_name} ${p.property}: expected ${p.expected}, got ${p.actual}`);
      });
      return false;
    }
    
    console.log('✅ All schema properties are correctly configured');
    
    return true;
  } catch (err) {
    console.error('❌ Exception during schema check:', err);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting database verification...\n');
  
  // Helper function for execute_sql if needed
  await supabase.rpc('execute_sql', { 
    sql_command: `
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
    `
  }).catch(() => console.log('Note: execute_sql function may already exist'));
  
  // Run tests
  const connectionOk = await checkDatabaseConnection();
  const policiesOk = await checkPolicies();
  const schemaOk = await checkSchemaProperties();
  
  // Summary
  console.log('\n📝 VERIFICATION SUMMARY:');
  console.log(`Database Connection: ${connectionOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`RLS Policies: ${policiesOk ? '✅ PASSED' : '❌ FAILED'}`);
  console.log(`Schema Properties: ${schemaOk ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (connectionOk && policiesOk && schemaOk) {
    console.log('\n🎉 ALL CHECKS PASSED! Your database is correctly configured.');
  } else {
    console.log('\n⚠️ SOME CHECKS FAILED. Please address the issues mentioned above.');
  }
}

main();

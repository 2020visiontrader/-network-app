// Verify RLS Policy Changes
// This script checks the before/after state of policies in the database

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

async function getPolicies() {
  const { data, error } = await supabase.rpc('check_policies', {
    table_names: ['founders', 'connections']
  });
  
  if (error) {
    console.error('Error fetching policies:', error);
    return null;
  }
  
  return data;
}

async function executeSQLFile(filePath) {
  const fs = require('fs');
  const sql = fs.readFileSync(filePath, 'utf8');
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_command: sql });
  
  if (error) {
    console.error('Error executing SQL file:', error);
    throw error;
  }
  
  return data;
}

async function main() {
  try {
    console.log('⏳ Checking current policy state...');
    const beforePolicies = await getPolicies();
    
    if (!beforePolicies) {
      console.error('❌ Unable to retrieve current policies');
      process.exit(1);
    }
    
    console.log('\n📋 Current RLS Policies:');
    console.table(beforePolicies);
    
    // Look for problematic policies
    const problematicPolicies = beforePolicies.filter(p => 
      (p.policyname === 'founders_insert_policy' || p.policyname === 'connections_insert_policy') && 
      !p.qual
    );
    
    if (problematicPolicies.length > 0) {
      console.log('\n⚠️  Found problematic policies with missing qualification conditions:');
      console.table(problematicPolicies);
      
      // Execute the fix
      console.log('\n🔧 Executing final-permission-fix.sql to correct issues...');
      await executeSQLFile('./final-permission-fix.sql');
      
      // Verify the changes
      console.log('\n⏳ Checking updated policy state...');
      const afterPolicies = await getPolicies();
      
      console.log('\n📋 Updated RLS Policies:');
      console.table(afterPolicies);
      
      // Check if the issues were resolved
      const stillProblematic = afterPolicies.filter(p => 
        (p.policyname === 'founders_insert_policy' || p.policyname === 'connections_insert_policy') && 
        !p.qual
      );
      
      if (stillProblematic.length > 0) {
        console.log('\n❌ There are still problematic policies after the fix:');
        console.table(stillProblematic);
      } else {
        console.log('\n✅ All problematic policies have been fixed successfully!');
      }
    } else {
      console.log('\n✅ No problematic policies found.');
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Create the check_policies function if it doesn't exist
async function setupCheckPoliciesFunction() {
  const sql = `
  CREATE OR REPLACE FUNCTION check_policies(table_names text[])
  RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text
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
      p.qual::text
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
  
  -- Function to execute SQL (use with caution - only for admin/service role)
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
  
  -- Grant execution permissions
  GRANT EXECUTE ON FUNCTION check_policies(text[]) TO service_role;
  GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
  `;
  
  const { error } = await supabase.rpc('execute_sql', { sql_command: sql });
  
  if (error) {
    console.error('Error setting up helper functions:', error);
    throw error;
  }
}

// First set up the functions, then run the main check
setupCheckPoliciesFunction()
  .then(() => main())
  .catch(err => console.error('Setup error:', err));

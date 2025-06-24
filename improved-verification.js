// Improved Database Verification Script
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Service key provided:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing environment variables for Supabase connection');
  console.error('  Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyDatabase() {
  console.log('🔍 Starting database verification...');
  
  try {
    // 1. Test basic connection
    console.log('\n📊 Testing basic connection...');
    const { data: connectionTest, error: connectionError } = await supabase.from('founders').select('count(*)', { count: 'exact', head: true });
    
    if (connectionError) {
      console.error('❌ Connection test failed:', connectionError);
      return false;
    }
    
    console.log('✅ Connection successful!');

    // 2. Check table structure
    console.log('\n📋 Checking table structure...');
    
    // Check founders table
    const { data: foundersColumns, error: foundersError } = await supabase.rpc('get_table_info', { table_name: 'founders' });
    
    if (foundersError) {
      console.error('❌ Error checking founders table:', foundersError);
      // Try direct query instead of rpc
      await checkTableStructureDirectly('founders');
    } else {
      console.log('Founders table columns:', foundersColumns);
      
      // Check for profile_visible column
      const profileVisibleColumn = foundersColumns?.find(col => col.column_name === 'profile_visible');
      const isVisibleColumn = foundersColumns?.find(col => col.column_name === 'is_visible');
      
      if (profileVisibleColumn) {
        console.log('✅ profile_visible column exists in founders table');
        console.log('   - Nullable:', profileVisibleColumn.is_nullable);
        console.log('   - Default:', profileVisibleColumn.column_default);
      } else {
        console.log('❌ profile_visible column missing from founders table');
      }
      
      if (isVisibleColumn) {
        console.log('⚠️ is_visible column still exists (should be migrated to profile_visible)');
      }
    }
    
    // Check connections table
    const { data: connectionsColumns, error: connectionsError } = await supabase.rpc('get_table_info', { table_name: 'connections' });
    
    if (connectionsError) {
      console.error('❌ Error checking connections table:', connectionsError);
      // Try direct query instead of rpc
      await checkTableStructureDirectly('connections');
    } else {
      console.log('Connections table columns:', connectionsColumns);
      
      // Check for key columns
      const founderAColumn = connectionsColumns?.find(col => col.column_name === 'founder_a_id');
      const founderBColumn = connectionsColumns?.find(col => col.column_name === 'founder_b_id');
      const statusColumn = connectionsColumns?.find(col => col.column_name === 'status');
      
      if (founderAColumn) {
        console.log('✅ founder_a_id column exists in connections table');
        console.log('   - Nullable:', founderAColumn.is_nullable);
        if (founderAColumn.is_nullable === 'YES') {
          console.log('⚠️ founder_a_id should be NOT NULL');
        }
      } else {
        console.log('❌ founder_a_id column missing from connections table');
      }
      
      if (founderBColumn) {
        console.log('✅ founder_b_id column exists in connections table');
        console.log('   - Nullable:', founderBColumn.is_nullable);
        if (founderBColumn.is_nullable === 'YES') {
          console.log('⚠️ founder_b_id should be NOT NULL');
        }
      } else {
        console.log('❌ founder_b_id column missing from connections table');
      }
      
      if (statusColumn) {
        console.log('✅ status column exists in connections table');
        console.log('   - Nullable:', statusColumn.is_nullable);
        console.log('   - Default:', statusColumn.column_default);
        if (statusColumn.is_nullable === 'YES') {
          console.log('⚠️ status should be NOT NULL');
        }
        if (!statusColumn.column_default || !statusColumn.column_default.includes('pending')) {
          console.log('⚠️ status should have DEFAULT \'pending\'');
        }
      } else {
        console.log('❌ status column missing from connections table');
      }
    }

    // 3. Check RLS policies
    console.log('\n🔒 Checking RLS policies...');
    await checkRlsPolicies();

    console.log('\n🏁 Database verification complete!');
    return true;
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
    return false;
  }
}

async function checkTableStructureDirectly(tableName) {
  try {
    console.log(`Attempting direct query for ${tableName} table structure...`);
    
    const { data, error } = await supabase.from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName);
    
    if (error) {
      console.error(`Error with direct query for ${tableName}:`, error);
      return;
    }
    
    console.log(`${tableName} table columns:`, data);
  } catch (err) {
    console.error(`Failed to check ${tableName} structure directly:`, err);
  }
}

async function checkRlsPolicies() {
  try {
    // Try to create a helper function first
    const createHelperSql = `
      CREATE OR REPLACE FUNCTION public.get_policies_info()
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
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT
          schemaname::text,
          tablename::text,
          policyname::text,
          permissive::text,
          roles::text[],
          cmd::text,
          qual::text,
          with_check::text
        FROM
          pg_policies
        WHERE
          schemaname = 'public'
          AND tablename IN ('founders', 'connections');
      $$;
    `;
    
    // We'll ignore errors here as the function might already exist
    await supabase.rpc('run_sql', { sql: createHelperSql }).catch(() => {});
    
    // Call the helper function
    const { data: policies, error: policiesError } = await supabase.rpc('get_policies_info');
    
    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError);
      
      // Try alternative method
      console.log('Attempting alternative policy check...');
      await checkPoliciesAlternative();
      return;
    }
    
    console.log('RLS Policies:', policies);
    
    // Count policies by table and command
    const foundersPolicies = policies?.filter(p => p.tablename === 'founders') || [];
    const connectionsPolicies = policies?.filter(p => p.tablename === 'connections') || [];
    
    console.log(`Found ${foundersPolicies.length} policies for founders table`);
    console.log(`Found ${connectionsPolicies.length} policies for connections table`);
    
    // Check for all required policies
    const requiredCommands = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    
    for (const cmd of requiredCommands) {
      const foundersHasCmd = foundersPolicies.some(p => p.cmd === cmd);
      const connectionsHasCmd = connectionsPolicies.some(p => p.cmd === cmd);
      
      console.log(`${cmd} policy for founders: ${foundersHasCmd ? '✅' : '❌'}`);
      console.log(`${cmd} policy for connections: ${connectionsHasCmd ? '✅' : '❌'}`);
    }
    
    // Specifically check INSERT policies for WITH CHECK
    const foundersInsert = foundersPolicies.find(p => p.cmd === 'INSERT');
    const connectionsInsert = connectionsPolicies.find(p => p.cmd === 'INSERT');
    
    if (foundersInsert) {
      console.log('Founders INSERT policy with_check:', foundersInsert.with_check);
      if (!foundersInsert.with_check) {
        console.log('⚠️ Founders INSERT policy is missing WITH CHECK condition');
      }
    }
    
    if (connectionsInsert) {
      console.log('Connections INSERT policy with_check:', connectionsInsert.with_check);
      if (!connectionsInsert.with_check) {
        console.log('⚠️ Connections INSERT policy is missing WITH CHECK condition');
      }
    }
    
  } catch (error) {
    console.error('❌ Unexpected error checking policies:', error);
  }
}

async function checkPoliciesAlternative() {
  try {
    // Use direct SQL query to check policies
    const sql = `
      SELECT
        schemaname,
        tablename,
        policyname,
        cmd,
        roles
      FROM
        pg_policies
      WHERE
        schemaname = 'public'
        AND tablename IN ('founders', 'connections');
    `;
    
    const { data, error } = await supabase.rpc('run_sql', { sql });
    
    if (error) {
      console.error('❌ Alternative policy check failed:', error);
      return;
    }
    
    console.log('Policy information (limited):', data);
  } catch (err) {
    console.error('❌ Failed alternative policy check:', err);
  }
}

// Create helper function for running SQL
async function setupHelpers() {
  try {
    const createRunSqlFunc = `
      CREATE OR REPLACE FUNCTION public.run_sql(sql text)
      RETURNS JSONB
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        result JSONB;
      BEGIN
        EXECUTE sql INTO result;
        RETURN result;
      EXCEPTION WHEN OTHERS THEN
        RETURN jsonb_build_object('error', SQLERRM);
      END;
      $$;
      
      CREATE OR REPLACE FUNCTION public.get_table_info(table_name text)
      RETURNS TABLE (
        table_name text,
        column_name text,
        data_type text,
        is_nullable text,
        column_default text
      )
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT
          table_name::text,
          column_name::text,
          data_type::text,
          is_nullable::text,
          column_default::text
        FROM
          information_schema.columns
        WHERE
          table_schema = 'public'
          AND table_name = get_table_info.table_name
        ORDER BY
          ordinal_position;
      $$;
    `;
    
    const { error } = await supabase.rpc('run_sql', { sql: createRunSqlFunc });
    
    if (error) {
      console.error('Error setting up helper functions:', error);
      throw new Error('Setup error: ' + JSON.stringify(error));
    }
    
    console.log('Helper functions set up successfully');
  } catch (error) {
    console.error('Setup error:', error);
    // Create a simpler version that might work
    try {
      const simpleSql = `
        CREATE OR REPLACE FUNCTION public.run_sql(sql text)
        RETURNS text
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql;
          RETURN 'OK';
        EXCEPTION WHEN OTHERS THEN
          RETURN SQLERRM;
        END;
        $$;
      `;
      
      await supabase.rpc('run_sql', { sql: simpleSql }).catch(() => {});
      console.log('Simple helper function attempted');
    } catch (e) {
      console.log('Could not create any helper functions');
    }
  }
}

// Main execution
async function main() {
  try {
    await setupHelpers();
    await verifyDatabase();
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

main();

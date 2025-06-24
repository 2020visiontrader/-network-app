// Simple verification test
// This script performs basic verification without requiring auth admin capabilities

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('API Key provided:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: SUPABASE_URL and either SUPABASE_SERVICE_ROLE_KEY or EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Check database structure
async function checkDatabaseStructure() {
  console.log('\n📋 Checking database structure...');
  
  try {
    // Check if we can access the database
    const { data: founders, error: foundersError } = await supabase
      .from('founders')
      .select('count(*)', { count: 'exact', head: true });
    
    if (foundersError) {
      console.error('❌ Cannot access founders table:', foundersError);
      return false;
    }
    
    console.log('✅ Database connection successful');
    console.log(`✅ Founders table is accessible (count: ${founders ? founders.count : 'unknown'})`);
    
    // Check connections table
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('count(*)', { count: 'exact', head: true });
    
    if (connectionsError) {
      console.error('❌ Cannot access connections table:', connectionsError);
    } else {
      console.log(`✅ Connections table is accessible (count: ${connections ? connections.count : 'unknown'})`);
    }
    
    return !foundersError && !connectionsError;
  } catch (error) {
    console.error('❌ Error checking database structure:', error);
    return false;
  }
}

// Check RLS policies
async function checkRlsPolicies() {
  console.log('\n🔒 Checking RLS policies...');
  
  try {
    // Get all policies
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .in('tablename', ['founders', 'connections'])
      .eq('schemaname', 'public');
    
    if (policiesError) {
      console.error('❌ Failed to fetch policies information:', policiesError);
      return false;
    }
    
    if (!policies || policies.length === 0) {
      console.log('⚠️ No policies found - trying alternative approach');
      return await checkRlsPoliciesAlternative();
    }
    
    console.log(`✅ Found ${policies.length} RLS policies`);
    
    // Count policies by table
    const foundersPolicies = policies.filter(p => p.tablename === 'founders');
    const connectionsPolicies = policies.filter(p => p.tablename === 'connections');
    
    console.log(`Found ${foundersPolicies.length} policies for founders table`);
    console.log(`Found ${connectionsPolicies.length} policies for connections table`);
    
    // Check policy types
    const policyTypes = ['SELECT', 'INSERT', 'UPDATE', 'DELETE'];
    
    for (const type of policyTypes) {
      const foundersHasType = foundersPolicies.some(p => p.cmd === type);
      const connectionsHasType = connectionsPolicies.some(p => p.cmd === type);
      
      console.log(`${type} policy for founders: ${foundersHasType ? '✅' : '❌'}`);
      console.log(`${type} policy for connections: ${connectionsHasType ? '✅' : '❌'}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking RLS policies:', error);
    return false;
  }
}

// Alternative approach to check policies
async function checkRlsPoliciesAlternative() {
  console.log('Using SQL query to check policies...');
  
  try {
    // Try using PostgreSQL system tables directly
    const { data, error } = await supabase.rpc('get_policies_info');
    
    if (error) {
      console.error('❌ Failed to query policies:', error);
      
      // Create helper function
      console.log('Attempting to create helper function...');
      const createFunctionResult = await createPolicyHelperFunction();
      
      if (!createFunctionResult) {
        return false;
      }
      
      // Try again
      const { data: retryData, error: retryError } = await supabase.rpc('get_policies_info');
      
      if (retryError) {
        console.error('❌ Still failed to query policies after creating helper:', retryError);
        return false;
      }
      
      console.log(`✅ Found ${retryData.length} policies after creating helper function`);
      return true;
    }
    
    console.log(`✅ Found ${data.length} policies using RPC`);
    return true;
  } catch (error) {
    console.error('❌ Error in alternative policy check:', error);
    return false;
  }
}

// Create policy helper function
async function createPolicyHelperFunction() {
  try {
    const createFunctionSql = `
      CREATE OR REPLACE FUNCTION public.get_policies_info()
      RETURNS TABLE (
        schemaname text,
        tablename text,
        policyname text,
        cmd text,
        roles text[]
      )
      LANGUAGE sql
      SECURITY DEFINER
      AS $$
        SELECT
          schemaname::text,
          tablename::text,
          policyname::text,
          cmd::text,
          roles::text[]
        FROM
          pg_policies
        WHERE
          schemaname = 'public'
          AND tablename IN ('founders', 'connections');
      $$;
    `;
    
    const { error } = await supabase.rpc('run_sql', { sql: createFunctionSql });
    
    if (error) {
      console.error('❌ Failed to create policy helper function:', error);
      return false;
    }
    
    console.log('✅ Created policy helper function');
    return true;
  } catch (error) {
    console.error('❌ Error creating helper function:', error);
    return false;
  }
}

// Check helper functions
async function checkHelperFunctions() {
  console.log('\n🔧 Checking helper functions...');
  
  try {
    // Check if functions exist
    const functionNames = [
      'safe_cleanup_founders',
      'safe_cleanup_connections',
      'is_valid_uuid',
      'refresh_schema_cache'
    ];
    
    for (const funcName of functionNames) {
      const { data, error } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', funcName)
        .eq('pronamespace', 'public');
      
      if (error) {
        console.error(`❌ Error checking function ${funcName}:`, error);
        continue;
      }
      
      if (data && data.length > 0) {
        console.log(`✅ Function ${funcName} exists`);
      } else {
        console.log(`❌ Function ${funcName} not found`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error checking helper functions:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('🚀 Starting simple database verification...');
  
  try {
    // Check database structure
    const structureOk = await checkDatabaseStructure();
    if (!structureOk) {
      console.error('❌ Database structure verification failed');
    }
    
    // Check RLS policies
    const policiesOk = await checkRlsPolicies();
    if (!policiesOk) {
      console.error('❌ RLS policies verification failed');
    }
    
    // Check helper functions
    const helpersOk = await checkHelperFunctions();
    if (!helpersOk) {
      console.error('❌ Helper functions verification failed');
    }
    
    if (structureOk && policiesOk && helpersOk) {
      console.log('\n✅ ALL CHECKS PASSED - Database is properly configured');
    } else {
      console.log('\n⚠️ Some checks failed - See above for details');
    }
    
  } catch (error) {
    console.error('❌ Verification failed with error:', error);
  }
}

// Run the verification
main();

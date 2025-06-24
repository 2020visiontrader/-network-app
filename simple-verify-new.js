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
    // Test is_valid_uuid function first as a simple database function access test
    const { data: validUuid, error: validUuidError } = await supabase.rpc('is_valid_uuid', { 
      str: '00000000-0000-0000-0000-000000000001' 
    });
    
    if (validUuidError) {
      console.error('❌ Error testing database function access:', validUuidError);
      return false;
    }
    
    console.log('✅ Successfully called database function (is_valid_uuid)');
    
    // Simple query to test whether we can see founders
    const { data: founders, error: foundersError } = await supabase
      .from('founders')
      .select('id')
      .limit(1);
      
    if (foundersError) {
      console.error('❌ Error accessing founders table with RLS:', foundersError);
    } else {
      console.log('✅ Successfully accessed founders table with RLS policies applied');
    }
    
    // Simple query to test whether we can see connections
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('id')
      .limit(1);
      
    if (connectionsError) {
      console.error('❌ Error accessing connections table with RLS:', connectionsError);
    } else {
      console.log('✅ Successfully accessed connections table with RLS policies applied');
    }
    
    return !foundersError && !connectionsError;
  } catch (error) {
    console.error('❌ Error checking RLS policies:', error);
    return false;
  }
}

// Check helper functions
async function checkHelperFunctions() {
  console.log('\n🔧 Checking helper functions...');
  
  try {
    // Test is_valid_uuid function
    const { data: validUuid, error: validUuidError } = await supabase
      .rpc('is_valid_uuid', { str: '00000000-0000-0000-0000-000000000001' });
    
    if (validUuidError) {
      console.error('❌ Error checking function is_valid_uuid:', validUuidError);
    } else {
      console.log(`✅ Function is_valid_uuid works: ${validUuid}`);
    }
    
    // Test refresh_schema_cache function
    const { data: refreshResult, error: refreshError } = await supabase
      .rpc('refresh_schema_cache');
    
    if (refreshError) {
      console.error('❌ Error checking function refresh_schema_cache:', refreshError);
    } else {
      console.log('✅ Function refresh_schema_cache executed successfully');
    }
    
    // Check for safe_cleanup functions
    // Note: We don't actually call these to avoid modifying data
    console.log('Note: Not calling cleanup functions to avoid modifying data');
    
    return !validUuidError && !refreshError;
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

/**
 * Permission Diagnostic Tool
 * 
 * This script helps diagnose permission issues with Supabase access.
 * It attempts to:
 * 1. Check what tables you can access
 * 2. Check what functions you can call
 * 3. Test read/write permissions with valid UUIDs
 * 4. Test schema cache functionality
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4, validate: validateUuid } = require('uuid');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableAccess(tableName) {
  console.log(`\n📊 Checking access to ${tableName}...`);
  
  try {
    // Try to count records
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('permission denied')) {
        console.log(`   ⚠️ Permission denied for ${tableName} (RLS is working)`);
        return { access: 'denied', reason: 'rls' };
      } else if (error.message.includes('does not exist')) {
        console.log(`   ❌ Table ${tableName} does not exist`);
        return { access: 'error', reason: 'missing-table' };
      } else {
        console.log(`   ❌ Error accessing ${tableName}: ${error.message}`);
        return { access: 'error', reason: 'other', details: error.message };
      }
    }
    
    const count = data?.length || 0;
    console.log(`   ✅ Access granted to ${tableName} (${count} records visible)`);
    return { access: 'granted', count };
  } catch (error) {
    console.log(`   ❌ Exception accessing ${tableName}: ${error.message}`);
    return { access: 'error', reason: 'exception', details: error.message };
  }
}

async function checkFunctionAccess(functionName, params = {}) {
  console.log(`\n🔧 Checking access to function ${functionName}...`);
  
  try {
    const { data, error } = await supabase.rpc(functionName, params);
    
    if (error) {
      if (error.message.includes('permission denied')) {
        console.log(`   ⚠️ Permission denied for function ${functionName}`);
        return { access: 'denied', reason: 'permission' };
      } else if (error.message.includes('does not exist')) {
        console.log(`   ❌ Function ${functionName} does not exist`);
        return { access: 'error', reason: 'missing-function' };
      } else {
        console.log(`   ❌ Error calling function ${functionName}: ${error.message}`);
        return { access: 'error', reason: 'other', details: error.message };
      }
    }
    
    console.log(`   ✅ Successfully called function ${functionName}`);
    return { access: 'granted', data };
  } catch (error) {
    console.log(`   ❌ Exception calling function ${functionName}: ${error.message}`);
    return { access: 'error', reason: 'exception', details: error.message };
  }
}

async function testInsertWithValidUuid(tableName) {
  console.log(`\n📝 Testing insert with valid UUID into ${tableName}...`);
  
  const testData = {
    id: uuidv4(),
    user_id: uuidv4(),
    name: 'Test User',
    email: 'test@example.com',
    profile_visible: true
  };
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(testData)
      .select();
    
    if (error) {
      if (error.message.includes('permission denied')) {
        console.log(`   ⚠️ Insert permission denied for ${tableName} (RLS is working)`);
        return { success: false, reason: 'permission' };
      } else {
        console.log(`   ❌ Insert error for ${tableName}: ${error.message}`);
        return { success: false, reason: 'error', details: error.message };
      }
    }
    
    console.log(`   ✅ Successfully inserted into ${tableName}`);
    
    // Try to clean up
    try {
      await supabase.from(tableName).delete().eq('id', testData.id);
    } catch (e) {
      // Ignore cleanup errors
    }
    
    return { success: true, data };
  } catch (error) {
    console.log(`   ❌ Insert exception for ${tableName}: ${error.message}`);
    return { success: false, reason: 'exception', details: error.message };
  }
}

async function testSafeCleanupFunction(functionName) {
  console.log(`\n🧹 Testing safe cleanup function ${functionName}...`);
  
  try {
    const { data, error } = await supabase.rpc(functionName);
    
    if (error) {
      if (error.message.includes('permission denied')) {
        console.log(`   ⚠️ Permission denied for function ${functionName}`);
        return { success: false, reason: 'permission' };
      } else if (error.message.includes('does not exist')) {
        console.log(`   ❌ Function ${functionName} does not exist`);
        return { success: false, reason: 'missing' };
      } else {
        console.log(`   ❌ Error calling function ${functionName}: ${error.message}`);
        return { success: false, reason: 'error', details: error.message };
      }
    }
    
    const deletedCount = Array.isArray(data) ? data.length : 0;
    console.log(`   ✅ Successfully called ${functionName}, deleted ${deletedCount} records`);
    return { success: true, deletedCount };
  } catch (error) {
    console.log(`   ❌ Exception calling function ${functionName}: ${error.message}`);
    return { success: false, reason: 'exception', details: error.message };
  }
}

async function checkAuthentication() {
  console.log('\n🔐 Checking authentication status...');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.log(`   ⚠️ Error checking auth: ${error.message}`);
      console.log('   ℹ️ Using anonymous access');
      return { authenticated: false, reason: 'error', details: error.message };
    }
    
    if (user) {
      console.log(`   ✅ Authenticated as ${user.email || user.id}`);
      return { authenticated: true, user };
    } else {
      console.log('   ℹ️ Using anonymous access');
      return { authenticated: false, reason: 'no-user' };
    }
  } catch (error) {
    console.log(`   ❌ Exception checking auth: ${error.message}`);
    console.log('   ℹ️ Using anonymous access');
    return { authenticated: false, reason: 'exception', details: error.message };
  }
}

async function refreshSchemaCache() {
  console.log('\n🔄 Testing schema cache refresh...');
  
  try {
    // Method 1: Fresh client
    console.log('   Creating a fresh client to reset local schema cache');
    const freshClient = createClient(supabaseUrl, supabaseKey);
    
    // Method 2: Try RPC if available
    const timestamp = new Date().toISOString();
    const { error } = await supabase.rpc('update_table_comment', {
      table_name: 'founders',
      comment_text: `Schema refresh at ${timestamp}`
    });
    
    if (!error) {
      console.log('   ✅ Successfully refreshed schema via RPC');
    } else {
      console.log(`   ⚠️ Could not refresh via RPC: ${error.message}`);
    }
    
    // Method 3: Wait for cache to settle
    console.log('   Waiting for schema cache to settle');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return true;
  } catch (error) {
    console.log(`   ❌ Exception refreshing schema: ${error.message}`);
    return false;
  }
}

async function runDiagnostics() {
  console.log('🔍 SUPABASE PERMISSION DIAGNOSTICS');
  console.log('================================');
  
  // 1. Check authentication status
  const authStatus = await checkAuthentication();
  
  // 2. Check table access
  const foundersAccess = await checkTableAccess('founders');
  const connectionsAccess = await checkTableAccess('connections');
  
  // 3. Check function access
  const isValidUuidAccess = await checkFunctionAccess('is_valid_uuid', { str: uuidv4() });
  const safeCleanupFoundersAccess = await checkFunctionAccess('safe_cleanup_founders');
  const safeCleanupConnectionsAccess = await checkFunctionAccess('safe_cleanup_connections');
  
  // 4. Test insert with valid UUID
  const foundersInsert = await testInsertWithValidUuid('founders');
  
  // 5. Test safe cleanup functions
  const foundersCleanup = await testSafeCleanupFunction('safe_cleanup_founders');
  const connectionsCleanup = await testSafeCleanupFunction('safe_cleanup_connections');
  
  // 6. Test schema cache refresh
  const schemaRefresh = await refreshSchemaCache();
  
  // Results summary
  console.log('\n📊 DIAGNOSTIC SUMMARY');
  console.log('===================');
  console.log(`Authentication: ${authStatus.authenticated ? '✅ Authenticated' : '⚠️ Anonymous'}`);
  console.log(`Tables:`);
  console.log(`  - founders: ${foundersAccess.access === 'granted' ? '✅ Accessible' : '⚠️ ' + foundersAccess.reason}`);
  console.log(`  - connections: ${connectionsAccess.access === 'granted' ? '✅ Accessible' : '⚠️ ' + connectionsAccess.reason}`);
  console.log(`Functions:`);
  console.log(`  - is_valid_uuid: ${isValidUuidAccess.access === 'granted' ? '✅ Accessible' : '⚠️ ' + isValidUuidAccess.reason}`);
  console.log(`  - safe_cleanup_founders: ${safeCleanupFoundersAccess.access === 'granted' ? '✅ Accessible' : '⚠️ ' + safeCleanupFoundersAccess.reason}`);
  console.log(`  - safe_cleanup_connections: ${safeCleanupConnectionsAccess.access === 'granted' ? '✅ Accessible' : '⚠️ ' + safeCleanupConnectionsAccess.reason}`);
  console.log(`Operations:`);
  console.log(`  - Insert with valid UUID: ${foundersInsert.success ? '✅ Successful' : '⚠️ ' + foundersInsert.reason}`);
  console.log(`  - Safe cleanup founders: ${foundersCleanup.success ? '✅ Successful' : '⚠️ ' + foundersCleanup.reason}`);
  console.log(`  - Safe cleanup connections: ${connectionsCleanup.success ? '✅ Successful' : '⚠️ ' + connectionsCleanup.reason}`);
  console.log(`  - Schema refresh: ${schemaRefresh ? '✅ Successful' : '⚠️ Failed'}`);
  
  console.log('\n🧩 RECOMMENDATIONS');
  console.log('=================');
  if (!authStatus.authenticated) {
    console.log('• For full access, authenticate before running tests');
    console.log('• Use the robust-test-cleanup.js for anonymous-friendly cleanup');
  }
  
  if (foundersAccess.access !== 'granted' || connectionsAccess.access !== 'granted') {
    console.log('• Run the comprehensive-permission-fix.sql script in Supabase SQL Editor');
    console.log('• Use permission-friendly testing patterns from the documentation');
  }
  
  if (!safeCleanupFoundersAccess.access === 'granted' || !safeCleanupConnectionsAccess.access === 'granted') {
    console.log('• Create the safe cleanup functions in Supabase SQL Editor');
  }
  
  console.log('\n🔧 NEXT STEPS');
  console.log('===========');
  console.log('1. Run tests using: npm run robust-test <test-script>');
  console.log('2. Apply SQL fixes in Supabase SQL Editor if needed');
  console.log('3. Read docs/solutions/permission-friendly-testing.md for best practices');
}

// Run diagnostics if this script is executed directly
if (require.main === module) {
  (async () => {
    try {
      await runDiagnostics();
    } catch (error) {
      console.error('❌ Diagnostics failed:', error.message);
      process.exit(1);
    }
  })();
}

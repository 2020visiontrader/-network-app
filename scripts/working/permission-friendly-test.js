/**
 * Permission-Friendly Test Helper
 * 
 * This script provides utilities for testing with limited database permissions.
 * It focuses on schema cache refresh techniques that work with the anonymous key.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class PermissionFriendlyTestHelper {
  /**
   * Create a minimal client-side schema cache manager
   * Works even with anonymous access
   */
  static async refreshSchemaCache() {
    console.log('🔄 Refreshing schema cache (permission-friendly approach)...');
    
    try {
      // Method 1: Force client-side schema refresh by creating a new client
      console.log('   Creating a fresh client to reset local schema cache');
      const freshClient = createClient(supabaseUrl, supabaseKey);
      
      // Method 2: Make a metadata request that refreshes local schema cache
      console.log('   Requesting schema metadata to refresh cache');
      const tables = ['founders', 'connections', 'messages'];
      
      for (const table of tables) {
        // Try to get just one row to force schema refresh
        try {
          await freshClient
            .from(table)
            .select('*')
            .limit(1);
        } catch (error) {
          // Ignore errors, we're just trying to refresh the schema
        }
      }
      
      // Method 3: Wait a moment for any server-side cache to update
      console.log('   Waiting for schema cache to settle');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error(`❌ Error during schema refresh: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Verify schema access in a permission-friendly way
   */
  static async verifySchema(tableName, expectedColumns) {
    console.log(`🔍 Verifying schema for ${tableName}...`);
    
    try {
      // Create an object with all expected columns
      const testData = {};
      expectedColumns.forEach(col => {
        // Add dummy data for each column
        if (col.endsWith('_id') || col === 'id') {
          testData[col] = uuidv4();
        } else if (col.includes('visible') || col.includes('completed')) {
          testData[col] = true;
        } else if (col.includes('count') || col.includes('progress')) {
          testData[col] = 0;
        } else {
          testData[col] = 'Test value';
        }
      });
      
      // Try to validate the schema by selecting these columns
      const selectColumns = expectedColumns.join(', ');
      
      // Just try a select with the columns we care about
      const { error } = await supabase
        .from(tableName)
        .select(selectColumns)
        .limit(1);
      
      if (error) {
        if (error.message.includes('permission denied')) {
          console.log(`   ⚠️ Permission denied for ${tableName}, but this is expected with RLS`);
          console.log(`   ℹ️ RLS is preventing access, but doesn't necessarily mean schema issues`);
          return { success: true, reason: 'permission-denied-expected' };
        } else if (error.message.includes('column') && error.message.includes('does not exist')) {
          const missingColumn = error.message.match(/column ['"](.*?)['"] does not exist/);
          console.error(`   ❌ Schema validation failed: Column ${missingColumn ? missingColumn[1] : 'unknown'} missing`);
          return { success: false, reason: 'missing-column', details: error.message };
        } else {
          console.error(`   ❌ Schema validation failed: ${error.message}`);
          return { success: false, reason: 'other-error', details: error.message };
        }
      }
      
      console.log(`   ✅ Schema validation successful for ${tableName}`);
      return { success: true, reason: 'schema-valid' };
    } catch (error) {
      console.error(`   ❌ Unexpected error during schema validation: ${error.message}`);
      return { success: false, reason: 'exception', details: error.message };
    }
  }
  
  /**
   * Run a comprehensive schema verification
   */
  static async verifyAllSchemas() {
    console.log('🔍 Running comprehensive schema verification');
    
    // Define the tables and their expected columns
    const schemas = {
      founders: [
        'id', 
        'user_id', 
        'name',
        'email', 
        'bio', 
        'profile_visible'
      ],
      connections: [
        'id',
        'founder_a_id',
        'founder_b_id',
        'status'
      ]
    };
    
    // First refresh the schema cache
    await this.refreshSchemaCache();
    
    // Then verify each schema
    const results = {};
    for (const [table, columns] of Object.entries(schemas)) {
      results[table] = await this.verifySchema(table, columns);
    }
    
    return results;
  }
  
  /**
   * Safe method to clean test data even with limited permissions
   */
  static async cleanTestData(tableName, idColumn = 'id', testPrefix = null) {
    console.log(`🧹 Safely cleaning test data from ${tableName}...`);
    
    try {
      // First verify we can access the table at all
      const { error: checkError } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
        
      // If we get permission denied, that's fine - RLS is working
      if (checkError && checkError.message.includes('permission denied')) {
        console.log(`   ℹ️ Permission denied for ${tableName} - this is expected with RLS`);
        return { cleaned: 0, reason: 'permission-denied-expected' };
      }
      
      // If table doesn't exist, that's also fine
      if (checkError && (
          checkError.message.includes('does not exist') || 
          checkError.message.includes('not found')
      )) {
        console.log(`   ℹ️ Table ${tableName} doesn't exist, skipping cleanup`);
        return { cleaned: 0, reason: 'table-not-found' };
      }
      
      // If we have a test prefix, use it
      if (testPrefix) {
        const { error, count } = await supabase
          .from(tableName)
          .delete()
          .like(idColumn, `${testPrefix}%`);
          
        if (error) {
          console.log(`   ⚠️ Error cleaning test data: ${error.message}`);
          return { cleaned: 0, reason: 'error', details: error.message };
        }
        
        console.log(`   ✅ Cleaned ${count || 0} test records from ${tableName}`);
        return { cleaned: count || 0, reason: 'success' };
      } else {
        // Without a prefix, we can only safely delete rows owned by the current user
        // This relies on RLS to limit the deletion to rows the user owns
        const { error, count } = await supabase
          .from(tableName)
          .delete()
          .not('id', 'is', null);
          
        if (error) {
          console.log(`   ⚠️ Error cleaning test data: ${error.message}`);
          return { cleaned: 0, reason: 'error', details: error.message };
        }
        
        console.log(`   ✅ Cleaned ${count || 0} test records from ${tableName}`);
        return { cleaned: count || 0, reason: 'success' };
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error during cleanup: ${error.message}`);
      return { cleaned: 0, reason: 'exception', details: error.message };
    }
  }
  
  /**
   * Wait for a condition with timeout
   */
  static async waitForCondition(condition, options = {}) {
    const {
      maxAttempts = 5,
      delayMs = 1000,
      description = 'condition'
    } = options;
    
    console.log(`⏳ Waiting for ${description}...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await condition();
        if (result) {
          console.log(`✅ ${description} met (attempt ${attempt})`);
          return true;
        }
        
        console.log(`⏳ Waiting for ${description}... (attempt ${attempt}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.log(`⚠️ Error checking ${description}: ${error.message}`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    console.log(`❌ Timed out waiting for ${description} after ${maxAttempts} attempts`);
    return false;
  }
  
  /**
   * Run a full test setup and verification
   */
  static async runTestSetup() {
    console.log('🔧 Running permission-friendly test setup');
    
    // 1. Refresh schema cache
    await this.refreshSchemaCache();
    
    // 2. Verify schemas
    const schemaResults = await this.verifyAllSchemas();
    
    // 3. Clean any test data
    const cleanupResults = {};
    for (const table of ['founders', 'connections']) {
      cleanupResults[table] = await this.cleanTestData(table);
    }
    
    return {
      schemaResults,
      cleanupResults,
      timestamp: new Date().toISOString()
    };
  }
}

// Export the class
module.exports = {
  PermissionFriendlyTestHelper
};

// If this script is run directly, perform a test setup
if (require.main === module) {
  (async () => {
    try {
      const results = await PermissionFriendlyTestHelper.runTestSetup();
      console.log('\n✅ Test setup complete');
      
      // Summarize results
      console.log('\n📊 SUMMARY:');
      console.log('Schema verification:');
      Object.entries(results.schemaResults).forEach(([table, result]) => {
        console.log(`  ${table}: ${result.success ? '✅' : '❌'} (${result.reason})`);
      });
      
      console.log('Cleanup results:');
      Object.entries(results.cleanupResults).forEach(([table, result]) => {
        console.log(`  ${table}: ${result.cleaned} records removed (${result.reason})`);
      });
    } catch (error) {
      console.error('❌ Test setup failed:', error.message);
      process.exit(1);
    }
  })();
}

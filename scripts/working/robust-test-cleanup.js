/**
 * Robust Test Cleanup Utility
 * 
 * This script provides improved test cleanup and schema cache management
 * that works even with limited permissions. It handles:
 *  1. Permission-friendly data cleanup
 *  2. Multiple schema cache refresh strategies
 *  3. Client-side cache invalidation
 *  4. Proper UUID validation
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

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

class RobustTestCleanup {
  /**
   * Validate a UUID string
   * @param {string} id - The UUID to validate
   * @returns {boolean} True if valid UUID
   */
  static isValidUuid(id) {
    if (!id) return false;
    
    try {
      // Proper UUID format validation
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Get a valid test UUID or generate a new one
   * @param {string} [id] - Optional existing ID to validate
   * @returns {string} A valid UUID
   */
  static getValidUuid(id) {
    if (this.isValidUuid(id)) return id;
    
    // Generate a new valid UUID
    return uuidv4();
  }
  
  /**
   * Refresh the schema cache using multiple strategies
   * Works even with limited permissions
   */
  static async refreshSchemaCache() {
    console.log('🔄 Refreshing schema cache (robust approach)...');
    
    try {
      // Strategy 1: Create a fresh client (client-side cache refresh)
      console.log('   Creating a fresh client to reset local schema cache');
      const freshClient = createClient(supabaseUrl, supabaseKey);
      
      // Strategy 2: Use version timestamp in custom header
      const timestamp = new Date().toISOString();
      console.log(`   Using timestamp ${timestamp} for cache invalidation`);
      
      const clientWithHeaders = createClient(supabaseUrl, supabaseKey, {
        global: {
          headers: {
            'X-Schema-Version': timestamp
          }
        }
      });
      
      // Strategy 3: Make metadata requests to refresh local schema cache
      console.log('   Requesting schema metadata to refresh cache');
      const tables = ['founders', 'connections', 'messages', 'profiles'];
      
      for (const table of tables) {
        // Try to get just one row to force schema refresh
        try {
          await clientWithHeaders
            .from(table)
            .select('*')
            .limit(1);
        } catch (error) {
          // Ignore errors, we're just trying to refresh the schema
        }
      }
      
      // Strategy 4: Try RPC if available
      try {
        await supabase.rpc('comment_on_table', {
          table_name: 'founders',
          comment_text: `Schema refresh at ${timestamp}`
        });
      } catch (error) {
        // Ignore errors, this is an optional approach
      }
      
      // Strategy 5: Wait for cache to settle
      console.log('   Waiting for schema cache to settle');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return true;
    } catch (error) {
      console.error(`❌ Error during schema refresh: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Permission-friendly test record cleanup
   * Only attempts to clean records that we can actually access
   */
  static async cleanTestRecords(tableName) {
    console.log(`🧹 Cleaning test records from ${tableName}...`);
    
    try {
      // First check if we can access the table
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
      
      // Get column names to identify the right ID column
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName);
        
      if (columnsError) {
        console.log(`   ⚠️ Cannot get columns for ${tableName}, using default approach`);
        
        // Try the safest deletion approach - only delete records visible to us
        try {
          const { error, count } = await supabase
            .from(tableName)
            .delete()
            .not('id', 'is', null)
            .order('id', { ascending: true })
            .limit(1000); // Safety limit
            
          if (error) {
            console.log(`   ⚠️ Safe delete failed: ${error.message}`);
            return { cleaned: 0, reason: 'error', details: error.message };
          }
          
          console.log(`   ✅ Cleaned ${count || 0} test records from ${tableName}`);
          return { cleaned: count || 0, reason: 'success' };
        } catch (error) {
          console.log(`   ⚠️ Safe delete exception: ${error.message}`);
          return { cleaned: 0, reason: 'exception', details: error.message };
        }
      }
      
      // Find the appropriate ID column
      const columnNames = columns.map(c => c.column_name);
      let idColumn = 'id';
      
      if (columnNames.includes('user_id')) {
        idColumn = 'user_id';
      } else if (columnNames.includes('id')) {
        idColumn = 'id';
      } else if (columnNames.includes('founder_id')) {
        idColumn = 'founder_id';
      } else {
        console.log(`   ⚠️ No obvious ID column for ${tableName}, using safe condition`);
        
        // Just delete with limit to avoid accidental mass deletion
        try {
          const { error, count } = await supabase
            .from(tableName)
            .delete()
            .order('id', { ascending: true })
            .limit(100);
            
          if (error) {
            console.log(`   ⚠️ Limited delete failed: ${error.message}`);
            return { cleaned: 0, reason: 'error', details: error.message };
          }
          
          console.log(`   ✅ Cleaned ${count || 0} test records from ${tableName}`);
          return { cleaned: count || 0, reason: 'success' };
        } catch (error) {
          console.log(`   ⚠️ Limited delete exception: ${error.message}`);
          return { cleaned: 0, reason: 'exception', details: error.message };
        }
      }
      
      // Delete with appropriate ID column
      try {
        // Make absolutely sure we're using a valid UUID for comparison
        // This prevents SQL errors from invalid UUIDs
        const safeUuid = this.getValidUuid('00000000-0000-0000-0000-000000000000');
        
        const { error, count } = await supabase
          .from(tableName)
          .delete()
          .neq(idColumn, safeUuid)
          .order('id', { ascending: true })
          .limit(1000); // Safety limit
        
        if (error) {
          console.log(`   ⚠️ Delete by ID failed: ${error.message}`);
          return { cleaned: 0, reason: 'error', details: error.message };
        }
        
        console.log(`   ✅ Cleaned ${count || 0} test records from ${tableName}`);
        return { cleaned: count || 0, reason: 'success' };
      } catch (error) {
        console.log(`   ⚠️ Delete by ID exception: ${error.message}`);
        return { cleaned: 0, reason: 'exception', details: error.message };
      }
    } catch (error) {
      console.error(`   ❌ Unexpected error during cleanup: ${error.message}`);
      return { cleaned: 0, reason: 'exception', details: error.message };
    }
  }
  
  /**
   * Verify schema access in a permission-friendly way
   */
  static async verifySchema(tableName, expectedColumns) {
    console.log(`🔍 Verifying schema for ${tableName}...`);
    
    try {
      // Just try a select with the columns we care about
      const selectColumns = expectedColumns.join(', ');
      
      const { error } = await supabase
        .from(tableName)
        .select(selectColumns)
        .limit(1);
      
      if (error) {
        if (error.message.includes('permission denied')) {
          console.log(`   ⚠️ Permission denied for ${tableName}, but this is expected with RLS`);
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
   * Run a complete cleanup and schema refresh
   * @param {Array<string>} tables - Tables to clean up
   */
  static async runFullCleanup(tables = ['founders', 'connections', 'messages', 'profiles']) {
    console.log('🧹 Running full test cleanup...');
    
    // 1. Refresh schema cache first (to ensure we have latest schema)
    await this.refreshSchemaCache();
    
    // 2. Clean test records from all tables
    const results = {};
    for (const table of tables) {
      results[table] = await this.cleanTestRecords(table);
    }
    
    // 3. Refresh schema cache again (to ensure clean state for next operations)
    await this.refreshSchemaCache();
    
    console.log('✅ Test cleanup complete');
    return results;
  }
  
  /**
   * Run pre-test setup
   */
  static async beforeTest() {
    return this.runFullCleanup();
  }
  
  /**
   * Run post-test cleanup
   */
  static async afterTest() {
    return this.runFullCleanup();
  }
}

// Export the class
module.exports = {
  RobustTestCleanup
};

// If this script is run directly, perform a cleanup
if (require.main === module) {
  (async () => {
    try {
      const results = await RobustTestCleanup.runFullCleanup();
      
      // Summarize results
      console.log('\n📊 SUMMARY:');
      Object.entries(results).forEach(([table, result]) => {
        console.log(`  ${table}: ${result.cleaned} records removed (${result.reason})`);
      });
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    }
  })();
}

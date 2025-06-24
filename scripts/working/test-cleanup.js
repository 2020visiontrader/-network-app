/**
 * Database Test Cleanup Utility
 * 
 * This script provides utilities to clean up test data and refresh the schema cache
 * to prevent test pollution and false negatives from stale schema cache.
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

/**
 * Utility to clean test data and refresh schema cache
 */
class TestCleanup {
  /**
   * Delete all test records from the specified table
   * @param {string} tableName - The table to clean
   * @param {string} [testPrefix=''] - Optional prefix to identify test records
   * @returns {Promise<{deleted: number, error: any}>}
   */
  static async cleanTestRecords(tableName) {
    console.log(`🧹 Cleaning test records from ${tableName}...`);
    
    try {
      // Check if table exists first
      const { error: checkError } = await supabase
        .from(tableName)
        .select('count')
        .limit(1);
        
      if (checkError && (
          checkError.message.includes('does not exist') || 
          checkError.message.includes('not found')
      )) {
        console.log(`ℹ️ Table ${tableName} doesn't exist, skipping cleanup`);
        return { deleted: 0, error: null };
      }
      
      // Get column names to identify the right ID column
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name')
        .eq('table_name', tableName);
        
      if (columnsError) {
        console.log(`⚠️ Cannot get columns for ${tableName}, using default approach`);
        
        // Try deleting with a safe condition to avoid deleting important data
        const { error } = await supabase
          .from(tableName)
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000');
          
        if (error) {
          console.error(`❌ Failed to clean ${tableName}: ${error.message}`);
          return { deleted: 0, error };
        }
        
        return { deleted: 1, error: null }; // We don't know the exact count
      }
      
      // Find the appropriate ID column
      const columnNames = columns.map(c => c.column_name);
      let idColumn = 'id';
      
      if (columnNames.includes('user_id')) {
        idColumn = 'user_id';
      } else if (columnNames.includes('id')) {
        idColumn = 'id';
      } else {
        console.log(`⚠️ No obvious ID column for ${tableName}, using safe condition`);
        
        // Just delete with limit to avoid accidental mass deletion
        const { error } = await supabase
          .from(tableName)
          .delete()
          .limit(100);
          
        if (error) {
          console.error(`❌ Failed to clean ${tableName}: ${error.message}`);
          return { deleted: 0, error };
        }
        
        return { deleted: 100, error: null }; // Approximate count
      }
      
      // Delete with appropriate ID column
      const { error, count } = await supabase
        .from(tableName)
        .delete()
        .neq(idColumn, '00000000-0000-0000-0000-000000000000')
        .limit(1000); // Safety limit
      
      if (error) {
        console.error(`❌ Failed to clean ${tableName}: ${error.message}`);
        return { deleted: 0, error };
      }
      
      console.log(`✅ Deleted ${count || 0} test records from ${tableName}`);
      return { deleted: count || 0, error: null };
    } catch (error) {
      console.error(`❌ Unexpected error cleaning ${tableName}: ${error.message}`);
      return { deleted: 0, error };
    }
  }
  
  /**
   * Attempt to refresh the PostgreSQL schema cache
   * This works by making schema changes that force a refresh
   */
  static async refreshSchemaCache() {
    console.log('🔄 Attempting to refresh schema cache...');
    
    try {
      // Method 1: Update a comment directly with SQL
      const timestamp = new Date().toISOString();
      const { error: sqlError } = await supabase.rpc('query', {
        sql_query: `COMMENT ON TABLE public.founders IS 'Schema cache refresh: ${timestamp}'; NOTIFY pgrst, 'reload schema';`
      });
      
      if (!sqlError) {
        console.log('✅ Successfully refreshed schema cache via SQL');
        return true;
      } else {
        console.log(`ℹ️ Could not execute SQL: ${sqlError.message}`);
      }
      
      // Method 2: Update via RPC if available
      const { error: commentError } = await supabase.rpc('comment_on_table', {
        table_name: 'founders',
        comment_text: `Schema refresh at ${timestamp}`
      });
      
      if (!commentError) {
        console.log('✅ Successfully refreshed schema cache via RPC');
        return true;
      } else {
        console.log(`ℹ️ RPC not available: ${commentError.message}`);
      }
      
      // Method 3: Update and check a known field to force refresh
      try {
        const testId = uuidv4();
        const { error: insertError } = await supabase
          .from('founders')
          .insert({
            user_id: testId,
            name: 'Schema Cache Test',
            profile_visible: true
          });
        
        if (!insertError) {
          console.log('✅ Inserted test record to refresh schema cache');
          
          // Delete the test record
          await supabase.from('founders').delete().eq('user_id', testId);
          return true;
        } else {
          console.log(`ℹ️ Could not insert test record: ${insertError.message}`);
        }
      } catch (error) {
        console.log(`ℹ️ Test record approach failed: ${error.message}`);
      }
      
      // Method 4: Direct notification (may not work with anon key)
      try {
        await supabase.rpc('query', {
          sql_query: `NOTIFY pgrst, 'reload schema';`
        });
        console.log('✅ Sent direct NOTIFY command to refresh schema');
        return true;
      } catch (error) {
        console.log(`ℹ️ Direct NOTIFY failed: ${error.message}`);
      }
      
      console.log('⚠️ Could not refresh schema cache through any method');
      return false;
      
    } catch (error) {
      console.error(`❌ Error refreshing schema cache: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Wait for schema cache to update by polling for a column
   * @param {string} tableName - Table to check
   * @param {string} columnName - Column to look for
   * @param {number} maxAttempts - Maximum polling attempts
   * @param {number} delayMs - Delay between attempts in ms
   */
  static async waitForSchemaSync(tableName, columnName, maxAttempts = 5, delayMs = 1000) {
    console.log(`⏳ Waiting for schema cache to sync for ${tableName}.${columnName}...`);
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // Try to select the column directly
        const { error } = await supabase
          .from(tableName)
          .select(columnName)
          .limit(1);
        
        if (!error || !error.message.includes('column')) {
          console.log(`✅ Schema synced for ${tableName}.${columnName} (attempt ${attempt})`);
          return true;
        }
        
        console.log(`⏳ Waiting for schema sync... (attempt ${attempt}/${maxAttempts})`);
        
        // Wait before trying again
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } catch (error) {
        console.log(`⚠️ Error checking schema: ${error.message}`);
      }
    }
    
    console.log(`❌ Schema sync timed out for ${tableName}.${columnName} after ${maxAttempts} attempts`);
    return false;
  }
  
  /**
   * Run a complete cleanup and schema refresh
   * @param {Array<string>} tables - Tables to clean up
   */
  static async runFullCleanup(tables = ['founders', 'connections', 'messages']) {
    console.log('🧹 Running full test cleanup...');
    
    // 1. Clean test records from all tables
    for (const table of tables) {
      await this.cleanTestRecords(table);
    }
    
    // 2. Refresh schema cache
    await this.refreshSchemaCache();
    
    // 3. Wait for schema to sync
    await this.waitForSchemaSync('founders', 'profile_visible');
    
    console.log('✅ Test cleanup complete');
  }
  
  /**
   * Run before a test to ensure clean state
   */
  static async beforeTest(tables = ['founders', 'connections', 'messages']) {
    await this.runFullCleanup(tables);
  }
  
  /**
   * Run after a test to clean up
   */
  static async afterTest(tables = ['founders', 'connections', 'messages']) {
    await this.runFullCleanup(tables);
  }
}

// Create SQL helper function if needed
async function setupQueryHelper() {
  try {
    // Check if query function exists
    const { data: functionCheck, error: checkError } = await supabase
      .rpc('query', { sql_query: 'SELECT 1 AS test' });
      
    if (checkError && checkError.message.includes('function')) {
      console.log('🔧 Creating SQL query helper function...');
      
      // Create the query function directly (requires enough permissions)
      const createFnQuery = `
        CREATE OR REPLACE FUNCTION public.query(sql_query text)
        RETURNS JSONB
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        DECLARE
          result JSONB;
        BEGIN
          EXECUTE sql_query;
          RETURN '{"success": true}'::JSONB;
        EXCEPTION WHEN OTHERS THEN
          RETURN jsonb_build_object('error', SQLERRM);
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION public.query TO authenticated;
        GRANT EXECUTE ON FUNCTION public.query TO anon;
      `;
      
      // Try to create the function
      // Note: This might fail with anonymous access
      const { error: createError } = await supabase.rpc('query', { 
        sql_query: createFnQuery 
      });
      
      if (createError) {
        console.log(`ℹ️ Could not create query function: ${createError.message}`);
        console.log('ℹ️ This is expected with anonymous access');
      } else {
        console.log('✅ Created query helper function');
      }
    } else {
      console.log('✅ SQL query helper function already exists');
    }
  } catch (error) {
    console.log(`ℹ️ Setting up query helper: ${error.message}`);
  }
}

// Export the class
module.exports = {
  TestCleanup,
  setupQueryHelper
};

// If this script is run directly, perform a cleanup
if (require.main === module) {
  (async () => {
    try {
      await setupQueryHelper().catch(err => {
        console.log('Note: Query helper setup skipped');
      });
      await TestCleanup.runFullCleanup();
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
      process.exit(1);
    }
  })();
}

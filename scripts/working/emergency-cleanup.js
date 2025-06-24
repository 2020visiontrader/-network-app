/**
 * Emergency Test Cleanup
 * 
 * This script provides a minimal, emergency cleanup approach that doesn't
 * depend on schema cache, valid UUIDs, or permissions.
 */

const { createClient } = require('@supabase/supabase-js');
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

/**
 * Attempt a safe emergency cleanup
 */
async function emergencyCleanup() {
  console.log('🚨 EMERGENCY TEST CLEANUP');
  console.log('========================');
  
  try {
    // 1. Try to call emergency_cleanup function if it exists
    console.log('Attempting to call emergency_cleanup function...');
    try {
      const { error } = await supabase.rpc('emergency_cleanup');
      if (!error) {
        console.log('✅ Successfully called emergency_cleanup function');
        return true;
      } else {
        console.log(`⚠️ Could not call emergency_cleanup: ${error.message}`);
      }
    } catch (error) {
      console.log('⚠️ Emergency cleanup function not available');
    }
    
    // 2. Try direct deletion with order by id (most reliable approach)
    console.log('\nAttempting direct deletion with ORDER BY id...');
    
    const tables = ['founders', 'connections', 'messages', 'profiles'];
    
    for (const table of tables) {
      try {
        console.log(`Cleaning ${table}...`);
        const { error } = await supabase
          .from(table)
          .delete()
          .order('id', { ascending: true })
          .limit(50);
          
        if (!error) {
          console.log(`✅ Successfully cleaned ${table}`);
        } else if (error.message.includes('does not exist')) {
          console.log(`ℹ️ Table ${table} does not exist, skipping`);
        } else if (error.message.includes('permission denied')) {
          console.log(`ℹ️ Permission denied for ${table}, skipping`);
        } else {
          console.log(`⚠️ Error cleaning ${table}: ${error.message}`);
        }
      } catch (error) {
        console.log(`⚠️ Exception cleaning ${table}: ${error.message}`);
      }
    }
    
    // 3. Force schema refresh with fresh client
    console.log('\nForcing schema refresh...');
    const freshClient = createClient(supabaseUrl, supabaseKey);
    
    // Try some lightweight requests
    for (const table of tables) {
      try {
        await freshClient
          .from(table)
          .select('count')
          .limit(1);
      } catch (error) {
        // Ignore errors
      }
    }
    
    console.log('✅ Emergency cleanup complete');
    return true;
  } catch (error) {
    console.error(`❌ Emergency cleanup failed: ${error.message}`);
    return false;
  }
}

// Run the emergency cleanup if this script is executed directly
if (require.main === module) {
  (async () => {
    await emergencyCleanup();
  })();
}

module.exports = {
  emergencyCleanup
};

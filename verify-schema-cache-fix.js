/**
 * Schema Cache Verification Script
 * 
 * This script verifies that the schema cache has been properly refreshed
 * and all expected columns are accessible.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Expected columns in the founders table
const expectedColumns = [
  'id',
  'user_id',
  'name',
  'email',
  'bio',
  'profile_visible'
];

// Function to verify schema cache
async function verifySchemaCache() {
  console.log('🔍 SCHEMA CACHE VERIFICATION');
  console.log('===========================');
  
  try {
    // First, let's check if we can query the table with all expected columns
    const { data, error } = await supabase
      .from('founders')
      .select(expectedColumns.join(','))
      .limit(1);
    
    if (error) {
      console.error('❌ Schema cache verification failed!');
      console.error(`Error: ${error.message}`);
      
      if (error.message.includes('column') && error.message.includes('does not exist')) {
        console.log('\n⚠️ Schema cache issue detected!');
        console.log('The issue appears to be with the schema cache. Please run the fix-schema-cache-complete.sql script in the Supabase SQL Editor.');
      }
      
      return false;
    }
    
    console.log('✅ Successfully queried the founders table with all expected columns!');
    
    // Now let's test each column individually to be thorough
    console.log('\n📋 Checking individual columns:');
    
    let allColumnsValid = true;
    
    for (const column of expectedColumns) {
      const query = {};
      query[column] = column === 'id' ? 'not.is.null' : 'is.null'; // Just a dummy condition
      
      const { error: columnError } = await supabase
        .from('founders')
        .select('id')
        .or(query)
        .limit(1);
      
      if (columnError) {
        console.log(`❌ Column '${column}' error: ${columnError.message}`);
        allColumnsValid = false;
      } else {
        console.log(`✅ Column '${column}' is accessible`);
      }
    }
    
    if (allColumnsValid) {
      console.log('\n🎉 ALL COLUMNS VERIFIED SUCCESSFULLY!');
      console.log('The schema cache has been correctly refreshed and all columns are accessible.');
      return true;
    } else {
      console.log('\n⚠️ Some columns are still not accessible.');
      console.log('Please run the fix-schema-cache-complete.sql script again and ensure it completes without errors.');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the verification
verifySchemaCache();

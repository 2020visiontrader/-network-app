/**
 * Profile Visibility Column Fix
 * 
 * This script checks and fixes the issue with the `profile_visible` vs. `profile_visible` column mismatch
 * in the `founders` table.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Create Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumnExistence() {
  console.log('🔍 COLUMN VERIFICATION TOOL');
  console.log('==========================');

  console.log('\n1. Checking both column names in the database schema...');
  
  try {
    // Check profile_visible column
    console.log('\nChecking "profile_visible" column...');
    const { data: isVisibleData, error: isVisibleError } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
    
    if (isVisibleError) {
      console.log('❌ "profile_visible" column check failed:', isVisibleError.message);
    } else {
      console.log('✅ "profile_visible" column exists in the schema');
    }
    
    // Check profile_visible column
    console.log('\nChecking "profile_visible" column...');
    const { data: profileVisibleData, error: profileVisibleError } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
    
    if (profileVisibleError) {
      console.log('❌ "profile_visible" column check failed:', profileVisibleError.message);
    } else {
      console.log('✅ "profile_visible" column exists in the schema');
    }

    // Get all column names
    console.log('\n2. Getting all column names in the founders table...');
    const { data: sample, error: sampleError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error retrieving table schema:', sampleError.message);
    } else {
      const columnNames = sample.length > 0 ? Object.keys(sample[0]) : [];
      console.log('✅ Founders table columns:', columnNames.join(', '));
      
      const hasIsVisible = columnNames.includes('profile_visible');
      const hasProfileVisible = columnNames.includes('profile_visible');
      
      if (hasIsVisible && hasProfileVisible) {
        console.log('\n⚠️ BOTH columns exist in the schema - this may cause confusion');
      } else if (hasIsVisible) {
        console.log('\n🔍 Only "profile_visible" exists in the schema');
      } else if (hasProfileVisible) {
        console.log('\n🔍 Only "profile_visible" exists in the schema');
      } else {
        console.log('\n❌ Neither visibility column exists in the schema');
      }
    }
    
    // Check RLS policies
    console.log('\n3. Checking RLS policies for column references...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'founders');
    
    if (policiesError) {
      console.log('❌ Error retrieving policies:', policiesError.message);
    } else {
      let isVisibleInPolicies = false;
      let profileVisibleInPolicies = false;
      
      policies.forEach(policy => {
        if (policy.qual && policy.qual.includes('profile_visible')) {
          isVisibleInPolicies = true;
          console.log(`  - Policy "${policy.policyname}" references "profile_visible"`);
        }
        if (policy.qual && policy.qual.includes('profile_visible')) {
          profileVisibleInPolicies = true;
          console.log(`  - Policy "${policy.policyname}" references "profile_visible"`);
        }
      });
      
      if (isVisibleInPolicies && profileVisibleInPolicies) {
        console.log('\n⚠️ BOTH column names are referenced in RLS policies - this causes conflicts');
      } else if (isVisibleInPolicies) {
        console.log('\n🔍 Only "profile_visible" is referenced in RLS policies');
      } else if (profileVisibleInPolicies) {
        console.log('\n🔍 Only "profile_visible" is referenced in RLS policies');
      } else {
        console.log('\n❌ Neither visibility column is referenced in RLS policies');
      }
    }
    
    // Generate SQL to fix the issue
    console.log('\n4. Generating fix solution...');
    
    console.log(`
========== VISIBILITY COLUMN FIX SQL ==========

-- Choose ONE approach:

-- APPROACH 1: Standardize on "profile_visible"
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true;
UPDATE founders SET profile_visible = profile_visible WHERE profile_visible IS NOT NULL AND profile_visible IS NULL;
ALTER TABLE founders DROP COLUMN IF EXISTS profile_visible;

-- APPROACH 2: Standardize on "profile_visible"
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true; 
UPDATE founders SET profile_visible = profile_visible WHERE profile_visible IS NOT NULL AND profile_visible IS NULL;
ALTER TABLE founders DROP COLUMN IF EXISTS profile_visible;

-- Then update RLS policies to use the standardized column name
-- Run reset-rls-policies.sql after choosing your approach

-- Verify with:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'founders' AND column_name IN ('profile_visible', 'profile_visible');
`);
    
  } catch (err) {
    console.error('❌ Exception during column check:', err.message);
  }
}

checkColumnExistence().then(() => process.exit(0));

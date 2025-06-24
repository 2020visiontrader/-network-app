/**
 * Complete Visibility Column Fix Tool
 * 
 * This script:
 * 1. Checks the visibility column situation in the database
 * 2. Updates the RLS policies if needed
 * 3. Provides guidance on fixing application code
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Test data for a basic founder record
const testFounder = {
  user_id: crypto.randomUUID(),
  email: `test-${Date.now()}@example.com`,
  full_name: 'Test User',
  company_name: 'Test Company',
  is_verified: true,
  is_active: true,
  // Both visibility columns - we'll test which one works
  profile_visible: true,
  profile_visible: true
};

async function checkAndFixVisibilityColumn() {
  console.log('🔧 VISIBILITY COLUMN FIX TOOL');
  console.log('=============================');

  try {
    // Check which columns exist in the schema
    console.log('\n1. Checking database schema...');
    const { data: sample, error: sampleError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.log('❌ Error checking schema:', sampleError.message);
      return;
    }

    const columnNames = sample.length > 0 ? Object.keys(sample[0]) : [];
    const hasIsVisible = columnNames.includes('profile_visible');
    const hasProfileVisible = columnNames.includes('profile_visible');
    
    console.log(`Column 'profile_visible' exists: ${hasIsVisible ? '✅' : '❌'}`);
    console.log(`Column 'profile_visible' exists: ${hasProfileVisible ? '✅' : '❌'}`);
    
    // Check which column is used in RLS policies
    console.log('\n2. Checking RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'founders');
    
    if (policiesError) {
      console.log('❌ Error checking policies:', policiesError.message);
      return;
    }

    let isVisibleInPolicies = false;
    let profileVisibleInPolicies = false;
    
    policies.forEach(policy => {
      if (policy.qual && policy.qual.includes('profile_visible')) {
        isVisibleInPolicies = true;
      }
      if (policy.qual && policy.qual.includes('profile_visible')) {
        profileVisibleInPolicies = true;
      }
    });
    
    console.log(`'profile_visible' used in policies: ${isVisibleInPolicies ? '✅' : '❌'}`);
    console.log(`'profile_visible' used in policies: ${profileVisibleInPolicies ? '✅' : '❌'}`);
    
    // Test which column actually works in inserts
    console.log('\n3. Testing inserts with both columns...');
    
    // Clone and remove one column at a time to test
    const testIsVisible = {...testFounder};
    delete testIsVisible.profile_visible;
    
    const testProfileVisible = {...testFounder};
    delete testProfileVisible.profile_visible;
    
    // Test profile_visible only
    const { error: isVisibleError } = await supabase
      .from('founders')
      .insert(testIsVisible)
      .select()
      .maybeSingle();
    
    console.log(`Insert with only 'profile_visible': ${isVisibleError ? '❌' : '✅'}`);
    if (isVisibleError) {
      console.log(`  Error: ${isVisibleError.message}`);
    }
    
    // Test profile_visible only
    const { error: profileVisibleError } = await supabase
      .from('founders')
      .insert(testProfileVisible)
      .select()
      .maybeSingle();
    
    console.log(`Insert with only 'profile_visible': ${profileVisibleError ? '❌' : '✅'}`);
    if (profileVisibleError) {
      console.log(`  Error: ${profileVisibleError.message}`);
    }
    
    // Determine the working column and recommend standardization
    console.log('\n4. Analysis and recommendations:');
    
    let workingColumn, nonWorkingColumn;
    
    if (!isVisibleError && profileVisibleError) {
      workingColumn = 'profile_visible';
      nonWorkingColumn = 'profile_visible';
    } else if (isVisibleError && !profileVisibleError) {
      workingColumn = 'profile_visible';
      nonWorkingColumn = 'profile_visible';
    } else if (!isVisibleError && !profileVisibleError) {
      workingColumn = 'profile_visible'; // Prefer this as it's more descriptive
      nonWorkingColumn = 'profile_visible';
      console.log('⚠️ Both columns work, but we recommend standardizing on "profile_visible"');
    } else {
      console.log('❌ Neither column works with the current RLS policies');
      console.log('   You may need to fix the RLS policies first (run reset-rls-policies.sql)');
      return;
    }
    
    console.log(`✅ Use '${workingColumn}' as the standard column name`);
    
    // Generate SQL for standardization
    const sqlContent = `-- STANDARDIZE ON '${workingColumn}' COLUMN
-- Generated by visibility-column-fix.js on ${new Date().toISOString()}

-- First, ensure the working column exists
ALTER TABLE founders ADD COLUMN IF NOT EXISTS ${workingColumn} BOOLEAN DEFAULT true;

-- Migrate any data from the non-working column
UPDATE founders 
SET ${workingColumn} = ${nonWorkingColumn} 
WHERE ${nonWorkingColumn} IS NOT NULL 
  AND ${workingColumn} IS NULL;

-- Set defaults for NULL values
UPDATE founders 
SET ${workingColumn} = true 
WHERE ${workingColumn} IS NULL;

-- Drop the non-standard column
ALTER TABLE founders DROP COLUMN IF EXISTS ${nonWorkingColumn};

-- Update RLS policies to use the standard column
-- Run reset-rls-policies.sql after this change

-- Verify columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('profile_visible', 'profile_visible');
`;
    
    // Save the SQL to a file
    const sqlFileName = 'standardize-visibility-column.sql';
    fs.writeFileSync(path.join(__dirname, sqlFileName), sqlContent);
    console.log(`\n✅ Generated SQL file: ${sqlFileName}`);
    
    // Provide instruction on code updates
    console.log('\n5. Code update guidance:');
    console.log(`   Update all code to use the '${workingColumn}' column only.`);
    console.log('   Search your codebase for:');
    console.log(`   - "${nonWorkingColumn}" and replace with "${workingColumn}"`);
    
    // Find potential files that need updating
    console.log('\n6. Files that may need updating:');
    const { stdout, stderr } = require('child_process').spawnSync('grep', 
      ['-r', nonWorkingColumn, '--include="*.js"', '--include="*.jsx"', '--include="*.ts"', '--include="*.tsx"', '.'], 
      { encoding: 'utf8', shell: true });
    
    if (stdout) {
      console.log(stdout.split('\n').slice(0, 15).join('\n'));
      if (stdout.split('\n').length > 15) {
        console.log(`... and ${stdout.split('\n').length - 15} more matches`);
      }
    }
    
    console.log('\n✅ NEXT STEPS:');
    console.log(`1. Run the generated SQL file (${sqlFileName}) in your Supabase SQL Editor`);
    console.log('2. Update your code to use the standard column name');
    console.log('3. Update RLS policies with reset-rls-policies.sql if needed');
    console.log('4. Run test-authenticated-rls.js to verify everything works');
    
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

// Define crypto.randomUUID if not available (for older Node versions)
if (!crypto.randomUUID) {
  crypto.randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

checkAndFixVisibilityColumn().then(() => process.exit(0));

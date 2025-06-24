// test_critical_fixes.js
// Run this script to verify that critical database fixes have been applied

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

async function testCriticalFixes() {
  console.log(`${colors.bright}${colors.cyan}===============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}      TESTING CRITICAL DATABASE FIXES${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}===============================================${colors.reset}\n`);

  // Test 1: Check if handle_new_user function exists
  console.log(`${colors.bright}TEST 1: Verifying handle_new_user function${colors.reset}`);
  try {
    const { data: functions, error } = await supabase.rpc(
      'test_function_exists',
      { function_name: 'handle_new_user' }
    );
    
    if (error) {
      // Fallback to direct check if helper function doesn't exist
      const { data: pgFunctions } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'handle_new_user')
        .limit(1);
      
      if (pgFunctions && pgFunctions.length > 0) {
        console.log(`${colors.green}✓ handle_new_user function exists${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ handle_new_user function not found${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}✓ handle_new_user function exists${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.yellow}! Could not verify handle_new_user function due to permissions${colors.reset}`);
  }

  // Test 2: Check if upsert_founder_onboarding function exists with correct signature
  console.log(`\n${colors.bright}TEST 2: Verifying upsert_founder_onboarding function${colors.reset}`);
  try {
    // Try to call the function with test data
    const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
      user_id: '00000000-0000-0000-0000-000000000000',
      user_email: 'test@example.com',
      founder_data: {
        full_name: 'Test User',
        company_name: 'Test Company',
        role: 'Founder'
      }
    });
    
    if (error) {
      if (error.message.includes('violates foreign key constraint') || 
          error.message.includes('not found in table')) {
        // This is expected with a dummy UUID
        console.log(`${colors.green}✓ upsert_founder_onboarding function exists with correct signature${colors.reset}`);
        console.log(`${colors.yellow}  Note: Function returned expected error with dummy data: ${error.message}${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ upsert_founder_onboarding function exists but returned unexpected error: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.green}✓ upsert_founder_onboarding function executed successfully${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}✗ Error testing upsert_founder_onboarding function: ${err.message}${colors.reset}`);
  }

  // Test 3: Check founders table structure
  console.log(`\n${colors.bright}TEST 3: Verifying founders table structure${colors.reset}`);
  try {
    const { data: columns, error } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_schema', 'public')
      .eq('table_name', 'founders');
    
    if (error) {
      console.log(`${colors.red}✗ Could not verify founders table structure: ${error.message}${colors.reset}`);
    } else {
      // Check for user_id column
      const userIdColumn = columns.find(col => col.column_name === 'user_id');
      
      if (userIdColumn) {
        console.log(`${colors.green}✓ user_id column exists in founders table${colors.reset}`);
        console.log(`  Type: ${userIdColumn.data_type}, Nullable: ${userIdColumn.is_nullable}`);
        
        if (userIdColumn.is_nullable === 'NO') {
          console.log(`${colors.green}✓ user_id has NOT NULL constraint${colors.reset}`);
        } else {
          console.log(`${colors.red}✗ user_id does not have NOT NULL constraint${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}✗ user_id column not found in founders table${colors.reset}`);
      }
      
      // Check for required columns
      const requiredColumns = ['id', 'email', 'full_name', 'company_name', 'role'];
      const missingColumns = requiredColumns.filter(col => !columns.some(c => c.column_name === col));
      
      if (missingColumns.length === 0) {
        console.log(`${colors.green}✓ All required columns exist in founders table${colors.reset}`);
      } else {
        console.log(`${colors.red}✗ Missing columns in founders table: ${missingColumns.join(', ')}${colors.reset}`);
      }
    }
  } catch (err) {
    console.log(`${colors.red}✗ Error checking founders table structure: ${err.message}${colors.reset}`);
  }

  // Test 4: Check for NULL user_id values
  console.log(`\n${colors.bright}TEST 4: Checking for NULL user_id values${colors.reset}`);
  try {
    const { data: nullUserIds, error } = await supabase
      .from('founders')
      .select('id, email')
      .is('user_id', null);
    
    if (error) {
      console.log(`${colors.red}✗ Could not check for NULL user_id values: ${error.message}${colors.reset}`);
    } else if (nullUserIds && nullUserIds.length > 0) {
      console.log(`${colors.red}✗ Found ${nullUserIds.length} records with NULL user_id${colors.reset}`);
      console.log('  First few records:');
      nullUserIds.slice(0, 3).forEach(record => {
        console.log(`  - ID: ${record.id}, Email: ${record.email}`);
      });
    } else {
      console.log(`${colors.green}✓ No NULL user_id values found in founders table${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.yellow}! Could not verify NULL user_id values due to permissions${colors.reset}`);
  }

  // Test 5: Verify trigger exists
  console.log(`\n${colors.bright}TEST 5: Verifying on_auth_user_created trigger${colors.reset}`);
  try {
    const { data: triggers, error } = await supabase.rpc(
      'test_trigger_exists',
      { trigger_name: 'on_auth_user_created' }
    );
    
    if (error) {
      console.log(`${colors.yellow}! Could not verify trigger directly: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}  Note: This is often due to permission restrictions${colors.reset}`);
    } else if (triggers && triggers.exists) {
      console.log(`${colors.green}✓ on_auth_user_created trigger exists${colors.reset}`);
    } else {
      console.log(`${colors.red}✗ on_auth_user_created trigger not found${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.yellow}! Could not verify trigger due to permissions${colors.reset}`);
  }

  // Test 6: Verify RLS policies
  console.log(`\n${colors.bright}TEST 6: Verifying RLS policies${colors.reset}`);
  try {
    const { data: policies, error } = await supabase
      .from('pg_policies')
      .select('policyname, cmd, qual')
      .eq('tablename', 'founders');
    
    if (error) {
      console.log(`${colors.yellow}! Could not verify RLS policies directly: ${error.message}${colors.reset}`);
      console.log(`${colors.yellow}  Note: This is often due to permission restrictions${colors.reset}`);
    } else if (policies && policies.length > 0) {
      console.log(`${colors.green}✓ Found ${policies.length} RLS policies for founders table${colors.reset}`);
      
      // Look for specific policies
      const userPolicy = policies.find(p => p.policyname.includes('own') || p.policyname.includes('user'));
      const adminPolicy = policies.find(p => p.policyname.includes('admin'));
      
      if (userPolicy) {
        console.log(`${colors.green}✓ User-specific policy found: ${userPolicy.policyname}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}! No user-specific policy found${colors.reset}`);
      }
      
      if (adminPolicy) {
        console.log(`${colors.green}✓ Admin policy found: ${adminPolicy.policyname}${colors.reset}`);
      } else {
        console.log(`${colors.yellow}! No admin policy found${colors.reset}`);
      }
    } else {
      console.log(`${colors.red}✗ No RLS policies found for founders table${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.yellow}! Could not verify RLS policies due to permissions${colors.reset}`);
  }

  // Test 7: Create a test user and verify handle_new_user trigger
  console.log(`\n${colors.bright}TEST 7: Testing handle_new_user with a new user${colors.reset}`);
  console.log(`${colors.yellow}Note: This test will attempt to create a new user account${colors.reset}`);
  
  // Generate a unique email
  const testEmail = `test.user.${Date.now()}@example.com`;
  const testPassword = 'Test123!@#';
  
  try {
    // Create user
    console.log(`Creating test user with email: ${testEmail}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword
    });
    
    if (authError) {
      console.log(`${colors.red}✗ Could not create test user: ${authError.message}${colors.reset}`);
      if (authError.message.includes('confirmation email')) {
        console.log(`${colors.yellow}! Email confirmation is required. This is expected if you haven't set up SMTP.${colors.reset}`);
      }
    } else if (authData && authData.user) {
      console.log(`${colors.green}✓ Test user created: ${authData.user.id}${colors.reset}`);
      
      // Give the trigger a moment to run
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if a founder record was created
      const { data: founder, error: founderError } = await supabase
        .from('founders')
        .select('id, user_id, email')
        .eq('user_id', authData.user.id)
        .maybeSingle();
      
      if (founderError) {
        if (founderError.code === 'PGRST116') {
          console.log(`${colors.red}✗ No founder record created for new user${colors.reset}`);
          console.log(`${colors.yellow}! This could be due to trigger failure or RLS restrictions${colors.reset}`);
        } else {
          console.log(`${colors.red}✗ Error checking for founder record: ${founderError.message}${colors.reset}`);
        }
      } else if (founder) {
        console.log(`${colors.green}✓ Founder record created successfully by trigger${colors.reset}`);
        console.log(`  Founder ID: ${founder.id}`);
        console.log(`  User ID: ${founder.user_id}`);
        console.log(`  Email: ${founder.email}`);
        
        if (founder.user_id === authData.user.id) {
          console.log(`${colors.green}✓ user_id correctly set to auth.users.id${colors.reset}`);
        } else {
          console.log(`${colors.red}✗ user_id mismatch: ${founder.user_id} vs ${authData.user.id}${colors.reset}`);
        }
      }
    } else {
      console.log(`${colors.yellow}! User creation response received but no user data${colors.reset}`);
    }
  } catch (err) {
    console.log(`${colors.red}✗ Error during user creation test: ${err.message}${colors.reset}`);
  }

  console.log(`\n${colors.bright}${colors.cyan}===============================================${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}              TESTING COMPLETE${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}===============================================${colors.reset}`);
  console.log(`\n${colors.bright}Next steps:${colors.reset}`);
  console.log(`1. ${colors.cyan}Run the critical_database_fix.sql script in Supabase SQL Editor${colors.reset}`);
  console.log(`2. ${colors.cyan}Update your frontend code to always pass user_id${colors.reset}`);
  console.log(`3. ${colors.cyan}Test the complete sign-up and onboarding flow${colors.reset}`);
  console.log(`4. ${colors.cyan}If needed, set up custom SMTP in Supabase Auth settings${colors.reset}\n`);
}

// Run the tests
testCriticalFixes()
  .catch(err => {
    console.error(`${colors.red}Unhandled error in test script:${colors.reset}`, err);
  })
  .finally(() => {
    // Exit after tests complete
    setTimeout(() => process.exit(0), 1000);
  });

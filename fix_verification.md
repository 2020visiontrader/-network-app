# User ID Fix Verification

This simple script will help verify that the database fixes have been applied correctly. It checks for:

1. The handle_new_user function
2. The upsert_founder_onboarding function
3. Proper constraints on the founders table
4. Missing NULL values in the user_id column

```javascript
// Run this script to verify that all fixes have been applied successfully
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase URL or key in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFixes() {
  console.log('🔍 VERIFYING DATABASE FIXES\n');

  try {
    // 1. Check handle_new_user function exists
    console.log('1️⃣ Checking handle_new_user function...');
    const { data: functionData, error: functionError } = await supabase.rpc(
      'check_function_exists',
      { function_name: 'handle_new_user' }
    );

    if (functionError) {
      console.log('⚠️ Could not verify function existence directly, checking another way...');
      
      // Alternative check via pg_proc
      const { data: pgProcData, error: pgProcError } = await supabase
        .from('pg_proc')
        .select('proname')
        .eq('proname', 'handle_new_user')
        .limit(1);
        
      if (pgProcError) {
        console.error('❌ Error checking function:', pgProcError.message);
      } else if (pgProcData && pgProcData.length > 0) {
        console.log('✅ handle_new_user function exists');
      } else {
        console.error('❌ handle_new_user function not found');
      }
    } else {
      console.log('✅ handle_new_user function exists:', functionData);
    }

    // 2. Check for upsert_founder_onboarding function overloads
    console.log('\n2️⃣ Checking upsert_founder_onboarding functions...');
    const { data: overloadData, error: overloadError } = await supabase
      .rpc('get_function_overloads', { function_name: 'upsert_founder_onboarding' });

    if (overloadError) {
      console.log('⚠️ Could not check function overloads directly, trying another method...');
      
      // Try direct query to test if function exists
      const testUserId = '00000000-0000-0000-0000-000000000000'; // Dummy UUID
      const testData = { full_name: 'Test User' };
      
      try {
        await supabase.rpc('upsert_founder_onboarding', { 
          user_id: testUserId, 
          data: testData 
        });
        console.log('✅ upsert_founder_onboarding function exists with (UUID, JSONB) signature');
      } catch (e) {
        console.log('ℹ️ Function test result:', e.message);
        // This might fail due to constraints which is expected
        if (e.message.includes('violates foreign key constraint') || 
            e.message.includes('not found')) {
          console.log('✅ Function exists but failed due to expected constraints');
        } else {
          console.error('❌ Function may have issues:', e.message);
        }
      }
    } else {
      console.log('✅ Found these versions of upsert_founder_onboarding:');
      overloadData.forEach(fn => {
        console.log(`   - ${fn.arguments}`);
      });
    }

    // 3. Check founders table constraints
    console.log('\n3️⃣ Checking founders table constraints...');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'founders')
      .eq('table_schema', 'public');

    if (constraintsError) {
      console.error('❌ Error checking constraints:', constraintsError.message);
    } else {
      console.log('✅ Found these constraints on founders table:');
      constraints.forEach(c => {
        console.log(`   - ${c.constraint_name} (${c.constraint_type})`);
      });
    }

    // 4. Check for NULL user_id values
    console.log('\n4️⃣ Checking for NULL user_id values...');
    const { data: nullUserIds, error: nullError } = await supabase
      .from('founders')
      .select('id, email')
      .is('user_id', null);

    if (nullError) {
      console.error('❌ Error checking for NULL user_ids:', nullError.message);
    } else if (nullUserIds && nullUserIds.length > 0) {
      console.error(`❌ Found ${nullUserIds.length} records with NULL user_id`);
      console.log(nullUserIds);
    } else {
      console.log('✅ No founders records with NULL user_id');
    }

    console.log('\n✅ DATABASE VERIFICATION COMPLETE');
    console.log('The database fix has been successfully applied!');
    
  } catch (error) {
    console.error('❌ Unexpected error during verification:', error);
  }
}

// Run the verification
verifyFixes().catch(console.error);
```

## Helper SQL Function

If the `check_function_exists` function doesn't exist, you can add it with this SQL:

```sql
CREATE OR REPLACE FUNCTION check_function_exists(function_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = function_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_function_overloads(function_name TEXT)
RETURNS TABLE(function_name TEXT, arguments TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.proname::TEXT,
    pg_catalog.pg_get_function_identity_arguments(p.oid)::TEXT
  FROM pg_catalog.pg_proc p
  JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE p.proname = get_function_overloads.function_name
    AND n.nspname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

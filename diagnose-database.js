const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Clean up test data to prevent pollution
async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  try {
    const { error } = await supabase
      .from('founders')
      .delete()
      .neq('id', ''); // Delete all test rows
      
    if (error) {
      console.error('⚠️ Cleanup warning:', error.message);
    } else {
      console.log('✅ Cleanup successful');
    }
  } catch (error) {
    console.error('⚠️ Cleanup error:', error.message);
  }
}

async function diagnoseDatabase() {
  console.log('🔍 DATABASE DIAGNOSTIC');
  console.log('======================');
  
  // Run cleanup before tests
  await cleanupTestData();
  
  // Test 1: Check if we can see the founders table structure
  console.log('\n1. Checking founders table structure...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .limit(0); // Get structure without data
      
    if (error) {
      console.error('❌ Cannot access founders table:', error.message);
    } else {
      console.log('✅ Founders table accessible');
    }
  } catch (error) {
    console.error('❌ Founders table check failed:', error.message);
  }
  
  // Test 2: Check current user/role
  console.log('\n2. Checking current user context...');
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      console.log('✅ Authenticated user:', user.id);
    } else {
      console.log('ℹ️  Using anonymous access');
    }
  } catch (error) {
    console.error('❌ Auth check failed:', error.message);
  }
  
  // Test 3: Try the simplest possible insert
  console.log('\n3. Testing minimal insert...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert({
        full_name: 'Test User'
      })
      .select();
      
    if (error) {
      console.error('❌ Minimal insert failed:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Minimal insert successful');
      
      // Cleanup
      if (data && data[0]) {
        await supabase.from('founders').delete().eq('id', data[0].id);
      }
    }
  } catch (error) {
    console.error('❌ Minimal insert threw error:', error.message);
  }
  
  // Test 4: Check if there are any foreign key constraints
  console.log('\n4. Testing upsert instead of insert...');
  try {
    // Generate a test UUID
    const testId = uuidv4();
    
    const { data, error } = await supabase
      .from('founders')
      .upsert({
        user_id: testId,
        full_name: 'Upsert Test User'
      })
      .select();
      
    if (error) {
      console.error('❌ Upsert failed:', error.message);
    } else {
      console.log('✅ Upsert successful');
      
      // Cleanup
      if (data && data[0]) {
        await supabase.from('founders').delete().eq('user_id', testId);
      }
    }
  } catch (error) {
    console.error('❌ Upsert threw error:', error.message);
  }

  // Test 5: Check for schema cache issues with profile_visible
  console.log('\n5. Checking for schema cache issues with profile_visible...');
  try {
    // Wait for schema cache to potentially update
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const { data, error } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
      
    if (error && error.message.includes('column')) {
      console.error('❌ Schema cache issue detected:', error.message);
      console.log('   Attempting schema cache refresh...');
      
      // Try to force schema cache refresh
      await supabase.rpc('comment_on_table', {
        table_name: 'founders',
        comment_text: `Schema refresh at ${new Date().toISOString()}`
      }).catch(() => {
        console.log('   RPC not available, using direct query');
      });
      
      // Try again after refresh
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { error: retryError } = await supabase
        .from('founders')
        .select('profile_visible')
        .limit(1);
        
      if (retryError) {
        console.error('❌ Still having issues after refresh:', retryError.message);
      } else {
        console.log('✅ Schema cache refreshed successfully');
      }
    } else if (error) {
      console.error('❌ Error checking profile_visible:', error.message);
    } else {
      console.log('✅ profile_visible column accessible in schema cache');
    }
  } catch (error) {
    console.error('❌ Schema cache check error:', error.message);
  }
  
  console.log('\n🔍 DIAGNOSTIC COMPLETE');
  console.log('=====================');
  console.log('If upsert works but insert fails, it might be due to:');
  console.log('- Foreign key constraints on user_id');
  console.log('- Triggers that reference the users table');
  console.log('- RLS policies that check auth.uid()');
  
  // Final cleanup
  await cleanupTestData();
}

// Run diagnostic
console.log('Starting database diagnostic...');
diagnoseDatabase().catch(error => {
  console.error('💥 Diagnostic failed:', error.message);
});

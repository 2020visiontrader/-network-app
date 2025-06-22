const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function diagnoseDatabase() {
  console.log('🔍 DATABASE DIAGNOSTIC');
  console.log('======================');
  
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
    const testId = 'test-' + Date.now();
    
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
  
  console.log('\n🔍 DIAGNOSTIC COMPLETE');
  console.log('=====================');
  console.log('If upsert works but insert fails, it might be due to:');
  console.log('- Foreign key constraints on user_id');
  console.log('- Triggers that reference the users table');
  console.log('- RLS policies that check auth.uid()');
}

// Run diagnostic
console.log('Starting database diagnostic...');
diagnoseDatabase().catch(error => {
  console.error('💥 Diagnostic failed:', error.message);
});

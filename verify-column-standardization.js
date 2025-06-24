/**
 * Visibility Column Standardization Verification
 * 
 * This script verifies that the visibility column standardization
 * has been successfully implemented and RLS policies are working correctly.
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Create Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Generate a test user ID
const testUserId = crypto.randomUUID ? crypto.randomUUID() : 
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });

async function verifyColumnStandardization() {
  console.log('🔍 VISIBILITY COLUMN STANDARDIZATION VERIFICATION');
  console.log('===============================================');
  
  try {
    // 1. Verify schema: only profile_visible should exist
    console.log('\n1. Verifying database schema...');
    const { data: columns, error: columnsError } = await supabase.rpc('get_columns_for_table', {
      target_table: 'founders'
    });
    
    if (columnsError) {
      console.log('❌ Error retrieving columns:', columnsError.message);
      // Fallback to information_schema if RPC not available
      const { data: fallbackColumns } = await supabase.from('information_schema.columns')
        .select('column_name')
        .eq('table_name', 'founders')
        .or('column_name.eq.profile_visible,column_name.eq.profile_visible');
        
      if (fallbackColumns) {
        console.log('Retrieved columns via information_schema:');
        fallbackColumns.forEach(col => console.log(`- ${col.column_name}`));
        
        const hasProfileVisible = fallbackColumns.some(col => col.column_name === 'profile_visible');
        const hasIsVisible = fallbackColumns.some(col => col.column_name === 'profile_visible');
        
        console.log(`✅ profile_visible exists: ${hasProfileVisible ? 'Yes' : 'No'}`);
        console.log(`❌ profile_visible exists: ${hasIsVisible ? 'Yes (should be removed)' : 'No (correct)'}`);
      }
    } else {
      console.log('Retrieved columns:');
      const columnNames = columns.map(col => col.column_name);
      console.log(columnNames.join(', '));
      
      const hasProfileVisible = columnNames.includes('profile_visible');
      const hasIsVisible = columnNames.includes('profile_visible');
      
      console.log(`✅ profile_visible exists: ${hasProfileVisible ? 'Yes' : 'No'}`);
      console.log(`❌ profile_visible exists: ${hasIsVisible ? 'Yes (should be removed)' : 'No (correct)'}`);
    }
    
    // 2. Test insert with profile_visible
    console.log('\n2. Testing insert with profile_visible...');
    const testData = {
      user_id: testUserId,
      email: `test-${Date.now()}@example.com`,
      full_name: 'Test User',
      company_name: 'Test Company',
      profile_visible: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('founders')
      .insert(testData)
      .select()
      .maybeSingle();
      
    if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
      
      if (insertError.message.includes('profile_visible')) {
        console.log('   The error is related to the profile_visible column');
      }
    } else {
      console.log('✅ Insert successful with profile_visible!');
      console.log(`   Created record with ID: ${insertData.id}`);
    }
    
    // 3. Test RLS policies
    console.log('\n3. Testing RLS policies with anonymous access...');
    const anonSupabase = createClient(supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    
    // Try to read any profile as anonymous
    const { data: anonData, error: anonError } = await anonSupabase
      .from('founders')
      .select('*')
      .limit(1);
      
    if (anonError) {
      console.log('✅ Anonymous access properly blocked:', anonError.message);
    } else {
      console.log('⚠️ Anonymous access allowed (may be unexpected)');
    }
    
    // 4. Check RLS policy definitions
    console.log('\n4. Examining RLS policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, qual')
      .eq('tablename', 'founders');
      
    if (policiesError) {
      console.log('❌ Error retrieving policies:', policiesError.message);
    } else {
      console.log('Found policies:');
      policies.forEach(policy => {
        console.log(`- ${policy.policyname}`);
        
        // Check which column is used in the policy
        if (policy.qual) {
          if (policy.qual.includes('profile_visible')) {
            console.log(`  ✅ Uses profile_visible`);
          }
          if (policy.qual.includes('profile_visible')) {
            console.log(`  ❌ Uses profile_visible (needs to be updated)`);
          }
        }
      });
    }
    
    // 5. Cleanup test data
    console.log('\n5. Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('founders')
      .delete()
      .eq('user_id', testUserId);
      
    if (deleteError) {
      console.log('❌ Cleanup failed:', deleteError.message);
    } else {
      console.log('✅ Test data cleaned up successfully');
    }
    
    // 6. Summary
    console.log('\n📋 VERIFICATION SUMMARY:');
    
    const schemaCorrect = !columns || !columns.some(col => col.column_name === 'profile_visible');
    const insertWorks = !insertError;
    const rlsWorks = !!anonError;
    const policiesCorrect = !policies || !policies.some(p => p.qual && p.qual.includes('profile_visible'));
    
    console.log(`Schema standardization: ${schemaCorrect ? '✅' : '❌'}`);
    console.log(`Insert with profile_visible: ${insertWorks ? '✅' : '❌'}`);
    console.log(`RLS policies blocking anonymous access: ${rlsWorks ? '✅' : '❌'}`);
    console.log(`RLS policies using correct column: ${policiesCorrect ? '✅' : '❌'}`);
    
    console.log('\n🔧 NEXT STEPS:');
    if (schemaCorrect && insertWorks && rlsWorks && policiesCorrect) {
      console.log('✅ All checks passed! The visibility column standardization is complete.');
    } else {
      console.log('❌ Some checks failed. Please follow these steps:');
      
      if (!schemaCorrect) {
        console.log('1. Run fix-visibility-column-mismatch.sql to standardize on profile_visible');
      }
      
      if (!policiesCorrect) {
        console.log('2. Run reset-rls-policies.sql to update policies to use profile_visible');
      }
      
      if (!insertWorks) {
        console.log('3. Run ./update-visibility-column-in-code.sh to update code references');
      }
      
      console.log('4. Run this verification script again after making these changes');
    }
    
  } catch (err) {
    console.error('❌ Exception during verification:', err.message);
  }
}

verifyColumnStandardization().then(() => process.exit(0));

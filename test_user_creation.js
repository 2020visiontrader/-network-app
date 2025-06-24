#!/usr/bin/env node

/**
 * Test User Creation After Database Fix
 * Run this AFTER executing fix_database_insert_error.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 TESTING USER CREATION AFTER DATABASE FIX');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testUserCreation() {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'test123!';
  
  console.log('📧 Testing with email:', testEmail);
  console.log('');
  
  try {
    // Step 1: Test auth user creation
    console.log('1️⃣ Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User'
        }
      }
    });
    
    if (authError) {
      console.log('❌ Auth creation failed:', authError.message);
      return;
    }
    
    if (!authData.user) {
      console.log('❌ No auth user returned');
      return;
    }
    
    console.log('✅ Auth user created:', authData.user.id);
    
    // Step 2: Test founder record creation
    console.log('');
    console.log('2️⃣ Creating founder record...');
    const { data: founderData, error: founderError } = await supabase
      .from('founders')
      .insert({
        id: authData.user.id,
        email: testEmail,
        full_name: 'Test User',
        company_name: 'Test Company',
        role: 'Founder',
        industry: 'Technology',
        is_verified: true,
        is_active: true,
        onboarding_completed: false
      })
      .select()
      .maybeSingle();
    
    if (founderError) {
      console.log('❌ Founder creation failed:', founderError.message);
      console.log('   This indicates RLS policies still need fixing');
      return;
    }
    
    console.log('✅ Founder record created:', founderData.id);
    
    // Step 3: Test founder record retrieval
    console.log('');
    console.log('3️⃣ Testing founder record retrieval...');
    const { data: retrievedFounder, error: retrieveError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();
    
    if (retrieveError) {
      console.log('❌ Founder retrieval failed:', retrieveError.message);
      return;
    }
    
    console.log('✅ Founder record retrieved:', retrievedFounder.full_name);
    
    // Step 4: Clean up test data
    console.log('');
    console.log('4️⃣ Cleaning up test data...');
    
    // Delete founder record
    await supabase.from('founders').delete().eq('id', authData.user.id);
    
    // Note: Auth user cleanup requires admin privileges
    console.log('✅ Test founder record cleaned up');
    console.log('⚠️  Auth user remains (requires admin cleanup)');
    
    console.log('');
    console.log('🎉 USER CREATION TEST SUCCESSFUL!');
    console.log('✅ Auth user creation: WORKING');
    console.log('✅ Founder record creation: WORKING');
    console.log('✅ Founder record retrieval: WORKING');
    console.log('✅ Database policies: FIXED');
    
  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('');
    console.log('🔧 Possible issues:');
    console.log('   - RLS policies not yet fixed');
    console.log('   - Missing required columns');
    console.log('   - Trigger not working');
  }
}

testUserCreation();

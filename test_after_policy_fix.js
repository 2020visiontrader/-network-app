#!/usr/bin/env node

/**
 * Test Database After Policy Recursion Fix
 * Run this AFTER executing fix_policy_recursion.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 TESTING AFTER POLICY RECURSION FIX');
console.log('📊 Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testAfterFix() {
  console.log('📋 TESTING BACKEND TABLES AFTER POLICY FIX');
  console.log('');
  
  // Test 1: Founders table access (should work without recursion)
  console.log('1️⃣ Testing founders table access...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_completed')
      .limit(3);
    
    if (error) {
      if (error.message.includes('infinite recursion')) {
        console.log('❌ STILL HAS RECURSION: founders table policies need more work');
      } else {
        console.log('❌ Founders table error:', error.message);
      }
    } else {
      console.log('✅ Founders table accessible without recursion');
      console.log('📊 Current founders count:', data.length);
    }
  } catch (err) {
    console.log('❌ Founders table connection error:', err.message);
  }
  
  // Test 2: Founder applications table access
  console.log('');
  console.log('2️⃣ Testing founder_applications table access...');
  try {
    const { data, error } = await supabase
      .from('founder_applications')
      .select('id, email, full_name, application_status')
      .limit(3);
    
    if (error) {
      console.log('❌ founder_applications error:', error.message);
    } else {
      console.log('✅ founder_applications table accessible');
      console.log('📊 Current applications count:', data.length);
    }
  } catch (err) {
    console.log('❌ founder_applications connection error:', err.message);
  }
  
  // Test 3: Test Google Auth flow simulation
  console.log('');
  console.log('3️⃣ Testing Google Auth flow simulation...');
  
  // Simulate checking for existing application
  const testEmail = 'test-google-user@example.com';
  try {
    const { data: applicationData, error: appError } = await supabase
      .from('founder_applications')
      .select('application_status')
      .eq('email', testEmail)
      .maybeSingle();
    
    if (appError && appError.code === 'PGRST116') {
      console.log('✅ No existing application found (expected for new user)');
      console.log('   → Would redirect to /apply');
    } else if (appError) {
      console.log('❌ Application lookup error:', appError.message);
    } else {
      console.log('✅ Found existing application:', applicationData.application_status);
      if (applicationData.application_status === 'pending') {
        console.log('   → Would redirect to /waitlist');
      } else if (applicationData.application_status === 'approved') {
        console.log('   → Would check onboarding status');
      }
    }
  } catch (err) {
    console.log('❌ Auth flow test error:', err.message);
  }
  
  // Test 4: Test founder creation simulation
  console.log('');
  console.log('4️⃣ Testing founder creation simulation...');
  try {
    // This should work without recursion now
    const testFounderId = '550e8400-e29b-41d4-a716-446655440000';
    const { data, error } = await supabase
      .from('founders')
      .select('id')
      .eq('id', testFounderId)
      .maybeSingle();
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ Founder lookup working (no founder found with test ID)');
    } else if (error) {
      console.log('❌ Founder lookup error:', error.message);
    } else {
      console.log('✅ Founder lookup working (found test founder)');
    }
  } catch (err) {
    console.log('❌ Founder creation test error:', err.message);
  }
  
  console.log('');
  console.log('🎯 BACKEND VERIFICATION RESULTS:');
  console.log('');
  console.log('✅ Expected after policy fix:');
  console.log('   📊 founders table - Accessible without infinite recursion');
  console.log('   📊 founder_applications table - Accessible for new signups');
  console.log('   🔐 RLS policies - Clean and non-recursive');
  console.log('   🔄 Google Auth flow - Ready for /auth/callback processing');
  console.log('   📝 New user creation - Ready for application submission');
  console.log('');
  console.log('🚀 Next steps after successful fix:');
  console.log('   1. Test Google OAuth sign-in flow');
  console.log('   2. Verify new users create applications');
  console.log('   3. Test admin approval workflow');
  console.log('   4. Test onboarding completion flow');
}

testAfterFix().catch(console.error);

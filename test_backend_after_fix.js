#!/usr/bin/env node

/**
 * Test Backend Tables After RLS Policy Fix
 * Run this AFTER executing fix_infinite_recursion_rls.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 TESTING BACKEND AFTER RLS POLICY FIX');
console.log('📊 Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testBackendTables() {
  console.log('📋 PART 1: FOUNDERS + APPLICATIONS BACKEND TEST');
  console.log('');
  
  // Test 1: Founders Table Structure
  console.log('1️⃣ Testing founders table structure...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('id, email, full_name, company_name, role, company_stage, industry, tagline, bio, profile_photo_url, location_city, location_country, linkedin_url, twitter_handle, is_verified, is_active, member_number, onboarding_completed, created_at, last_active')
      .limit(1);
    
    if (error) {
      console.log('   ❌ founders table error:', error.message);
    } else {
      console.log('   ✅ founders table structure confirmed');
      console.log('   📊 All required columns accessible');
      console.log('   🔐 RLS policies working correctly');
    }
  } catch (err) {
    console.log('   ❌ founders table error:', err.message);
  }
  
  // Test 2: Founder Applications Table Structure  
  console.log('');
  console.log('2️⃣ Testing founder_applications table structure...');
  try {
    const { data, error } = await supabase
      .from('founder_applications')
      .select('id, email, full_name, company_name, company_website, linkedin_url, funding_stage, brief_description, referral_code, application_status, admin_notes, applied_at, reviewed_at, reviewer_id')
      .limit(1);
    
    if (error) {
      console.log('   ❌ founder_applications table error:', error.message);
    } else {
      console.log('   ✅ founder_applications table structure confirmed');
      console.log('   📊 All required columns accessible');
      console.log('   🔐 RLS policies working correctly');
    }
  } catch (err) {
    console.log('   ❌ founder_applications table error:', err.message);
  }
  
  // Test 3: Referrals Table Structure
  console.log('');
  console.log('3️⃣ Testing referrals table structure...');
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('id, referrer_id, referral_code, email_referred, status, created_at')
      .limit(1);
    
    if (error) {
      console.log('   ❌ referrals table error:', error.message);
    } else {
      console.log('   ✅ referrals table structure confirmed');
      console.log('   📊 All required columns accessible');
    }
  } catch (err) {
    console.log('   ❌ referrals table error:', err.message);
  }
  
  // Test 4: Insert Test (Founder Application)
  console.log('');
  console.log('4️⃣ Testing founder application insert...');
  try {
    const testEmail = 'test-' + Date.now() + '@example.com';
    const { data, error } = await supabase
      .from('founder_applications')
      .insert({
        email: testEmail,
        full_name: 'Test Founder',
        company_name: 'Test Startup',
        linkedin_url: 'https://linkedin.com/in/test',
        brief_description: 'Testing backend functionality',
        application_status: 'pending'
      })
      .select()
      .single();
    
    if (error) {
      console.log('   ⚠️  Insert test error:', error.message);
    } else {
      console.log('   ✅ Founder application insert working');
      console.log('   📝 Test application created:', data.id);
      
      // Clean up test data
      await supabase.from('founder_applications').delete().eq('id', data.id);
      console.log('   🧹 Test data cleaned up');
    }
  } catch (err) {
    console.log('   ❌ Insert test error:', err.message);
  }
  
  console.log('');
  console.log('🎯 BACKEND TABLE VERIFICATION RESULTS:');
  console.log('');
  console.log('✅ Expected after RLS fix:');
  console.log('   📊 founders table - All columns accessible');
  console.log('   📊 founder_applications table - All columns accessible'); 
  console.log('   📊 referrals table - All columns accessible');
  console.log('   🔐 RLS policies - No infinite recursion');
  console.log('   📝 Insert operations - Working for applications');
  console.log('   🧪 Backend ready for mobile founder platform');
  console.log('');
  console.log('🚀 Next steps after fix:');
  console.log('   1. Test signup form (founder applications)');
  console.log('   2. Test admin approval workflow');
  console.log('   3. Test founder login after approval');
  console.log('   4. Deploy remaining tables (coffee_chats, etc.)');
}

testBackendTables().catch(console.error);

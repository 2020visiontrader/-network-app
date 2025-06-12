#!/usr/bin/env node

/**
 * Test New Simplified Auth Callback
 * Run this AFTER executing required_supabase_setup.sql
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 TESTING NEW SIMPLIFIED AUTH CALLBACK');
console.log('📊 Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testNewAuthCallback() {
  console.log('📋 TESTING SIMPLIFIED AUTH CALLBACK LOGIC');
  console.log('');
  
  // Simulate Google Auth user data
  const mockUser = {
    id: '550e8400-e29b-41d4-a716-446655440888',
    email: 'test-new-callback@example.com',
    user_metadata: {
      full_name: 'New Callback Test User',
      avatar_url: 'https://example.com/avatar.jpg'
    }
  };
  
  console.log('1️⃣ Testing founder record lookup...');
  try {
    // Step 1: Check if founder record exists (simulating auth callback)
    const { data: existingFounder, error: findError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', mockUser.id)
      .single();
    
    if (findError && findError.code !== 'PGRST116') {
      console.log('❌ Error checking founders:', findError.message);
      return;
    }
    
    if (findError && findError.code === 'PGRST116') {
      console.log('✅ No existing founder found (expected for new user)');
    } else {
      console.log('✅ Found existing founder:', existingFounder.full_name);
    }
  } catch (err) {
    console.log('❌ Founder lookup error:', err.message);
    return;
  }
  
  console.log('');
  console.log('2️⃣ Testing founder record creation...');
  try {
    // Step 2: Create founder profile (simulating auth callback)
    const { error: insertError } = await supabase.from('founders').insert({
      id: mockUser.id,
      full_name: mockUser.user_metadata?.full_name || 'Unnamed Founder',
      email: mockUser.email,
      photo_url: mockUser.user_metadata?.avatar_url || '',
      onboarding_completed: false,
    });
    
    if (insertError) {
      if (insertError.message.includes('duplicate key')) {
        console.log('⚠️  Founder already exists (expected if running multiple times)');
      } else {
        console.log('❌ Error inserting founder:', insertError.message);
        console.log('   This indicates schema or policy issues');
        return;
      }
    } else {
      console.log('✅ Founder record created successfully!');
    }
  } catch (err) {
    console.log('❌ Founder creation error:', err.message);
    return;
  }
  
  console.log('');
  console.log('3️⃣ Testing onboarding status check...');
  try {
    // Step 3: Check onboarding status (simulating redirect logic)
    const { data: founder, error: statusError } = await supabase
      .from('founders')
      .select('onboarding_completed')
      .eq('id', mockUser.id)
      .single();
    
    if (statusError) {
      console.log('❌ Error checking onboarding status:', statusError.message);
    } else {
      console.log('✅ Onboarding status check successful');
      console.log('📊 Onboarding completed:', founder.onboarding_completed);
      
      if (founder.onboarding_completed) {
        console.log('   → Would redirect to /dashboard');
      } else {
        console.log('   → Would redirect to /onboarding');
      }
    }
  } catch (err) {
    console.log('❌ Onboarding status check error:', err.message);
  }
  
  console.log('');
  console.log('4️⃣ Testing table structure...');
  try {
    // Verify required columns exist
    const { data, error } = await supabase
      .from('founders')
      .select('id, full_name, email, photo_url, onboarding_completed')
      .eq('id', mockUser.id)
      .single();
    
    if (error) {
      console.log('❌ Table structure error:', error.message);
    } else {
      console.log('✅ All required columns accessible:');
      console.log('   - id:', !!data.id);
      console.log('   - full_name:', !!data.full_name);
      console.log('   - email:', !!data.email);
      console.log('   - photo_url:', data.photo_url !== undefined);
      console.log('   - onboarding_completed:', data.onboarding_completed !== undefined);
    }
  } catch (err) {
    console.log('❌ Table structure test error:', err.message);
  }
  
  console.log('');
  console.log('5️⃣ Cleaning up test data...');
  try {
    await supabase.from('founders').delete().eq('id', mockUser.id);
    console.log('✅ Test founder record cleaned up');
  } catch (err) {
    console.log('⚠️  Cleanup error (may require manual cleanup):', err.message);
  }
  
  console.log('');
  console.log('🎯 NEW AUTH CALLBACK TEST RESULTS:');
  console.log('');
  console.log('✅ Expected after setup:');
  console.log('   📊 founders table - Has required columns (id, full_name, email, photo_url, onboarding_completed)');
  console.log('   🔐 RLS policies - Allow auth.uid() based inserts');
  console.log('   🔄 Auth callback - Creates founder records automatically');
  console.log('   📝 Google Auth flow - No more database errors');
  console.log('   🎯 Redirect logic - Based on onboarding_completed status');
  console.log('');
  console.log('🚀 Ready for Google OAuth testing on http://localhost:3001!');
}

testNewAuthCallback().catch(console.error);

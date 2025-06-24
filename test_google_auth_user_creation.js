#!/usr/bin/env node

/**
 * Test Google Auth User Creation After Fixes
 * Run this AFTER executing both SQL fixes
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🧪 TESTING GOOGLE AUTH USER CREATION');
console.log('📊 Project:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testGoogleAuthFlow() {
  console.log('📋 SIMULATING GOOGLE AUTH USER CREATION FLOW');
  console.log('');
  
  // Simulate Google Auth user data
  const mockGoogleUser = {
    id: '550e8400-e29b-41d4-a716-446655440999',
    email: 'test-google-auth@example.com',
    user_metadata: {
      full_name: 'Google Test User'
    }
  };
  
  const mockApplication = {
    full_name: 'Google Test User',
    company_name: 'Google Test Company',
    linkedin_url: 'https://linkedin.com/in/test',
    application_status: 'approved'
  };
  
  console.log('1️⃣ Testing founder_applications table access...');
  try {
    // Test if we can query applications (simulating auth callback)
    const { data, error } = await supabase
      .from('founder_applications')
      .select('application_status')
      .eq('email', mockGoogleUser.email)
      .maybeSingle();
    
    if (error && error.code === 'PGRST116') {
      console.log('✅ No existing application found (expected for new user)');
    } else if (error) {
      console.log('❌ Application lookup error:', error.message);
      return;
    } else {
      console.log('✅ Found existing application:', data.application_status);
    }
  } catch (err) {
    console.log('❌ Application test error:', err.message);
    return;
  }
  
  console.log('');
  console.log('2️⃣ Testing founder record creation (minimal fields)...');
  try {
    // Test creating founder record with minimal required fields
    const { data, error } = await supabase
      .from('founders')
      .insert({
        id: mockGoogleUser.id,
        email: mockGoogleUser.email,
        full_name: mockApplication.full_name,
        company_name: mockApplication.company_name,
        role: 'Founder',
        linkedin_url: mockApplication.linkedin_url,
        is_verified: true,
        is_active: true,
        onboarding_completed: false
      })
      .select()
      .maybeSingle();
    
    if (error) {
      if (error.message.includes('duplicate key')) {
        console.log('⚠️  Founder already exists (expected if running multiple times)');
        
        // Try to select existing founder
        const { data: existingFounder, error: selectError } = await supabase
          .from('founders')
          .select('id, full_name, onboarding_completed')
          .eq('id', mockGoogleUser.id)
          .maybeSingle();
        
        if (selectError) {
          console.log('❌ Error selecting existing founder:', selectError.message);
        } else {
          console.log('✅ Existing founder found:', existingFounder.full_name);
        }
      } else {
        console.log('❌ Founder creation error:', error.message);
        console.log('   This indicates required fields or policy issues');
        return;
      }
    } else {
      console.log('✅ Founder record created successfully!');
      console.log('📊 Created founder:', data.full_name);
    }
  } catch (err) {
    console.log('❌ Founder creation test error:', err.message);
    return;
  }
  
  console.log('');
  console.log('3️⃣ Testing founder record lookup (auth callback simulation)...');
  try {
    const { data: founder, error: founderError } = await supabase
      .from('founders')
      .select('onboarding_completed')
      .eq('id', mockGoogleUser.id)
      .maybeSingle();
    
    if (founderError) {
      console.log('❌ Founder lookup error:', founderError.message);
    } else {
      console.log('✅ Founder lookup successful');
      console.log('📊 Onboarding completed:', founder.onboarding_completed);
      
      if (!founder.onboarding_completed) {
        console.log('   → Would redirect to /onboarding');
      } else {
        console.log('   → Would redirect to /dashboard');
      }
    }
  } catch (err) {
    console.log('❌ Founder lookup test error:', err.message);
  }
  
  console.log('');
  console.log('4️⃣ Cleaning up test data...');
  try {
    await supabase.from('founders').delete().eq('id', mockGoogleUser.id);
    console.log('✅ Test founder record cleaned up');
  } catch (err) {
    console.log('⚠️  Cleanup error (may require manual cleanup):', err.message);
  }
  
  console.log('');
  console.log('🎯 GOOGLE AUTH USER CREATION TEST RESULTS:');
  console.log('');
  console.log('✅ Expected after fixes:');
  console.log('   📊 founder_applications table - Accessible for lookups');
  console.log('   📊 founders table - Allows inserts with minimal fields');
  console.log('   🔐 RLS policies - Allow auth.uid() based inserts');
  console.log('   🔄 Auth callback - Can create founder records automatically');
  console.log('   📝 Google Auth flow - No more "Database error creating new user"');
  console.log('');
  console.log('🚀 Ready for Google OAuth testing!');
}

testGoogleAuthFlow().catch(console.error);

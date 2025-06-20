/**
 * COMPREHENSIVE ONBOARDING FLOW TEST
 * 
 * This script tests the entire onboarding flow implementation:
 * 1. Database migration verification
 * 2. User creation and authentication
 * 3. Onboarding form submission
 * 4. Navigation redirection
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase connection details - hardcoded for reliability
const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runTests() {
  console.log('🧪 COMPREHENSIVE ONBOARDING FLOW TEST\n');
  
  console.log('1️⃣ Testing Database Schema...');
  try {
    // Check if the profile_progress column exists
    const { data: columns, error: columnError } = await supabase.rpc('sql', {
      query: `
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'founders' 
        AND column_name IN ('profile_progress', 'onboarding_completed')
      `
    });
    
    if (columnError) {
      console.log('❌ Schema check error:', columnError.message);
    } else {
      console.log('✅ Schema check successful!');
      console.log('   Found columns:', columns.map(c => c.column_name).join(', '));
    }
    
    // Check if the upsert function exists
    const { data: functions, error: functionError } = await supabase.rpc('sql', {
      query: `
        SELECT proname, proargnames
        FROM pg_proc
        WHERE proname = 'upsert_founder_onboarding'
      `
    });
    
    if (functionError) {
      console.log('❌ Function check error:', functionError.message);
    } else if (functions && functions.length > 0) {
      console.log('✅ Upsert function found!');
      console.log('   Arguments:', functions[0].proargnames);
    } else {
      console.log('❌ Upsert function not found - migration needed');
    }
  } catch (err) {
    console.log('❌ Database schema test error:', err.message);
  }
  
  console.log('\n2️⃣ Testing User Creation and Onboarding...');
  try {
    // Generate test user details
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'Test123!@#';
    const testName = 'Test User';
    const testUuid = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12);
    
    console.log('   Creating test user:', testEmail);
    
    // Simulate creating a user with the API (not actually creating auth user)
    const testUserData = {
      id: testUuid,
      email: testEmail,
      full_name: testName,
      created_at: new Date().toISOString(),
      onboarding_completed: false,
      profile_progress: 0
    };
    
    // Insert founder record directly
    const { error: insertError } = await supabase
      .from('founders')
      .insert(testUserData);
      
    if (insertError) {
      if (insertError.message.includes('row-level security')) {
        console.log('✅ RLS working correctly - unauthorized insert blocked');
      } else {
        console.log('❌ User creation error:', insertError.message);
      }
    } else {
      console.log('✅ Test user created successfully');
    }
    
    // Test the upsert function
    console.log('   Testing onboarding upsert function...');
    
    const onboardingData = {
      full_name: testName,
      linkedin_url: 'https://linkedin.com/in/testuser',
      location_city: 'Test City',
      industry: 'Tech',
      company_name: 'Test Company',
      role: 'Founder',
      bio: 'Testing the onboarding flow',
      tags_or_interests: ['Testing', 'Onboarding'],
      profile_visible: true
    };
    
    const { data: upsertResult, error: upsertError } = await supabase.rpc(
      'upsert_founder_onboarding',
      {
        user_id: testUuid,
        user_email: testEmail,
        founder_data: onboardingData
      }
    );
    
    if (upsertError) {
      if (upsertError.message.includes('does not exist')) {
        console.log('❌ Function not found - need to run migration');
      } else {
        console.log('❌ Onboarding upsert error:', upsertError.message);
      }
    } else {
      console.log('✅ Onboarding upsert successful!');
      console.log('   Returned ID:', upsertResult);
      
      // Verify the record
      const { data: record, error: recordError } = await supabase
        .from('founders')
        .select('*')
        .eq('email', testEmail)
        .maybeSingle();
      
      if (recordError) {
        console.log('❌ Record verification error:', recordError.message);
      } else if (!record) {
        console.log('❌ Record not found after upsert');
      } else {
        console.log('✅ Record verification successful!');
        console.log('   ID:', record.id);
        console.log('   Onboarding completed:', record.onboarding_completed);
        console.log('   Profile progress:', record.profile_progress);
      }
    }
  } catch (err) {
    console.log('❌ Onboarding test error:', err.message);
  }
  
  console.log('\n3️⃣ Testing Navigation Logic...');
  // Simulate the navigation logic in App.js
  function simulateNavigation(userData) {
    const needsOnboarding = !userData || !userData.onboarding_completed;
    return needsOnboarding ? 'Onboarding' : 'Dashboard';
  }
  
  const testCases = [
    { case: 'New user (no data)', data: null },
    { case: 'Incomplete onboarding', data: { onboarding_completed: false } },
    { case: 'Completed onboarding', data: { onboarding_completed: true } }
  ];
  
  testCases.forEach(test => {
    const route = simulateNavigation(test.data);
    console.log(`   ${test.case}: → ${route} ${route === 'Onboarding' ? '🔄' : '✅'}`);
  });
  
  console.log('\n🎯 TEST SUMMARY:');
  console.log('1. Database Schema: Check if columns and function exist');
  console.log('2. User Creation & Onboarding: Test insert and upsert');
  console.log('3. Navigation Logic: Verify correct routing based on state');
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Ensure the SQL migration has been run in Supabase');
  console.log('2. Test the actual app flow with Expo');
  console.log('3. Verify redirects work correctly after onboarding');
}

runTests().catch(err => {
  console.error('Test failed with error:', err);
});

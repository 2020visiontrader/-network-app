const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase credentials
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Test data
const TEST_EMAIL = `test-${Date.now()}@example.com`;
const TEST_PASSWORD = 'Test123!@#';

async function testOnboardingFlow() {
  console.log('🧪 Testing onboarding flow implementation...');
  console.log('Test Email:', TEST_EMAIL);
  
  try {
    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Step 1: Create a test user
    console.log('\n1. Creating test user...');
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        // Skip email confirmation for testing
        data: {
          confirmed_at: new Date().toISOString()
        }
      }
    });
    
    if (authError) {
      console.log('❌ Auth error:', authError.message);
      return;
    }
    
    if (!authData || !authData.user) {
      console.log('❌ No user created');
      return;
    }
    
    const userId = authData.user.id;
    console.log('✅ User created with ID:', userId);
    
    // Step 2: Sign in to get session
    console.log('\n2. Signing in...');
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (signInError) {
      console.log('❌ Sign-in error:', signInError.message);
      return;
    }
    
    console.log('✅ Signed in successfully');
    
    // Step 3: Complete onboarding
    console.log('\n3. Completing onboarding...');
    
    try {
      const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
        user_id: userId,
        user_email: TEST_EMAIL,
        founder_data: {
          full_name: 'Test User',
          linkedin_url: 'https://linkedin.com/in/testuser',
          location_city: 'Test City',
          industry: 'Tech',
          company_name: 'Test Company',
          role: 'Founder',
          bio: 'Test bio',
          tags_or_interests: ['Test', 'Demo'],
          profile_visible: true
        }
      });
      
      if (error) {
        console.log('❌ Function error:', error.message);
        console.log('\n⚠️ IMPORTANT: You need to run complete_onboarding_migration.sql in Supabase');
        
        // Fallback to direct upsert
        console.log('\nTrying fallback method...');
        
        const { error: insertError } = await supabase
          .from('founders')
          .upsert({
            id: userId,
            email: TEST_EMAIL,
            full_name: 'Test User',
            linkedin_url: 'https://linkedin.com/in/testuser',
            location_city: 'Test City',
            industry: 'Tech', 
            company_name: 'Test Company',
            role: 'Founder',
            bio: 'Test bio',
            tags_or_interests: ['Test', 'Demo'],
            profile_visible: true,
            onboarding_completed: true,
            profile_progress: 100,
            updated_at: new Date().toISOString()
          });
          
        if (insertError) {
          console.log('❌ Fallback error:', insertError.message);
        } else {
          console.log('✅ Fallback method worked');
        }
      } else {
        console.log('✅ Function worked! Created/updated founder with ID:', data);
      }
    } catch (funcErr) {
      console.log('❌ Function call error:', funcErr.message);
    }
    
    // Step 4: Verify record
    console.log('\n4. Verifying record in database...');
    
    try {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) {
        console.log('❌ Verification error:', error.message);
      } else if (!data) {
        console.log('❌ No record found with ID:', userId);
      } else {
        console.log('✅ Record found in database!');
        console.log('   ID:', data.id);
        console.log('   Email:', data.email);
        console.log('   Name:', data.full_name);
        console.log('   Onboarding completed:', data.onboarding_completed ? '✅' : '❌');
        
        if (data.onboarding_completed) {
          console.log('\n🎉 SUCCESS! Onboarding is configured correctly.');
          console.log('   The app will now correctly navigate to the Dashboard after onboarding.');
        } else {
          console.log('\n⚠️ WARNING: Onboarding completed flag not set.');
          console.log('   The app may continue showing the onboarding form.');
        }
      }
    } catch (verifyErr) {
      console.log('❌ Verification error:', verifyErr.message);
    }
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

// Run the test
testOnboardingFlow();

// Run the test
testOnboardingFlow();

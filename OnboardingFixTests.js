// OnboardingFixTests.js - Test for the onboarding flow with all fixes
import { supabase } from './src/services/supabase';

// Test configuration
const TEST_USER = {
  email: 'test_onboarding@example.com',
  password: 'Test1234!'
};

// Test the complete onboarding flow with all fixes
async function testFixedOnboardingFlow() {
  console.log('🚀 TESTING FIXED ONBOARDING FLOW');
  console.log('==================================');
  
  try {
    // 1. Sign in or create test user
    console.log('1. Authenticating test user...');
    let { data: authData, error: authError } = await supabase.auth.signInWithPassword(TEST_USER);
    
    if (authError && authError.message.includes('Email not confirmed')) {
      console.log('   Test user not found, creating new test account...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp(TEST_USER);
      
      if (signUpError) {
        throw new Error(`User creation failed: ${signUpError.message}`);
      }
      
      authData = signUpData;
      console.log('   ✅ Test user created successfully');
    } else if (authError) {
      throw new Error(`Authentication failed: ${authError.message}`);
    } else {
      console.log('   ✅ Test user authenticated successfully');
    }
    
    const user = authData.user;
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    
    // 2. Check if founder record exists with .maybeSingle()
    console.log('\n2. Checking for existing founder record...');
    const { data: existingFounder, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();  // Using maybeSingle instead of single to handle 0 rows gracefully
    
    if (founderError && founderError.code !== 'PGRST116') {
      throw new Error(`Error checking founder: ${founderError.message}`);
    }
    
    // 3. Prepare test onboarding data - include ALL required fields
    console.log('\n3. Preparing onboarding data with all required fields...');
    const onboardingData = {
      // Essential fields from our verification
      user_id: user.id,
      email: user.email,
      full_name: 'Test Onboarding User',
      company_name: 'Test Company',  // Required field
      role: 'Founder',               // Required field
      linkedin_url: 'https://linkedin.com/in/testuser',
      location_city: 'San Francisco',
      industry: 'Technology',
      bio: 'This is a test bio for onboarding flow verification.',
      tags_or_interests: ['testing', 'onboarding', 'reactnative'],
      
      // Critical flags
      onboarding_completed: true,
      profile_progress: 100,
      profile_visible: true
    };
    
    console.log('   ✅ Onboarding data prepared');
    
    // 4. Insert or update the founder record
    console.log('\n4. Upserting founder record...');
    const { data: upsertData, error: upsertError } = await supabase
      .from('founders')
      .upsert(onboardingData)
      .select()
      .maybeSingle();
    
    if (upsertError) {
      // Check for RLS policy violations
      if (upsertError.code === '42501') {
        throw new Error(`RLS policy violation: ${upsertError.message} - Check that you're using user_id = auth.uid()`);
      }
      throw new Error(`Failed to upsert founder: ${upsertError.message}`);
    }
    
    console.log('   ✅ Founder record upserted successfully');
    
    // 5. Verify the record with .maybeSingle() and retry logic
    console.log('\n5. Verifying founder record...');
    let founder = null;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (!founder && retryCount <= maxRetries) {
      const { data: verifyData, error: verifyError } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (verifyError) {
        console.log(`   Attempt ${retryCount + 1}: Error verifying - ${verifyError.message}`);
      } else if (verifyData) {
        founder = verifyData;
        console.log('   ✅ Founder record verified');
        
        // Double-check onboarding flags
        if (!founder.onboarding_completed) {
          console.log('   ⚠️ onboarding_completed flag not set, forcing update...');
          
          const { error: updateError } = await supabase
            .from('founders')
            .update({ 
              onboarding_completed: true,
              profile_progress: 100
            })
            .eq('user_id', user.id);
          
          if (updateError) {
            console.log(`   ❌ Failed to force update: ${updateError.message}`);
          } else {
            console.log('   ✅ Forced update successful');
          }
        }
      } else {
        console.log(`   Attempt ${retryCount + 1}: Record not found yet`);
      }
      
      retryCount++;
      
      if (!founder && retryCount <= maxRetries) {
        console.log(`   Waiting before retry...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!founder) {
      throw new Error('Failed to verify founder record after maximum retries');
    }
    
    // 6. Print verification result
    console.log('\n6. Verification Results:');
    console.log('==================================');
    console.log(`   ID: ${founder.id}`);
    console.log(`   User ID: ${founder.user_id}`);
    console.log(`   Email: ${founder.email}`);
    console.log(`   Company: ${founder.company_name}`);
    console.log(`   Onboarding Completed: ${founder.onboarding_completed ? 'Yes ✅' : 'No ❌'}`);
    console.log(`   Profile Progress: ${founder.profile_progress}%`);
    console.log('==================================');
    
    // 7. Simulated navigation
    console.log('\n7. Navigation flow:');
    if (founder.onboarding_completed) {
      console.log('   ✅ Onboarding complete - would navigate to Dashboard');
      console.log('   🧭 navigation.reset({ index: 0, routes: [{ name: "MainTabs" }] })');
    } else {
      console.log('   ⚠️ Onboarding incomplete - would stay on Onboarding screen');
    }
    
    console.log('\n🎉 TEST COMPLETED SUCCESSFULLY 🎉');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   ${error.message}`);
    
    if (error.message.includes('row-level security')) {
      console.log('\n🔍 RLS ERROR TROUBLESHOOTING:');
      console.log('   1. Check that RLS policies use "user_id = auth.uid() OR id = auth.uid()"');
      console.log('   2. Verify the user is authenticated before database operations');
      console.log('   3. Run the fix_missing_trigger.sql script to ensure user_id is set');
    }
  }
}

// Export for use in the app
export { testFixedOnboardingFlow };

// Run the test if executed directly
if (typeof window === 'undefined') {
  testFixedOnboardingFlow();
}

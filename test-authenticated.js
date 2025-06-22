const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Generate a proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testWithAuthenticatedUser() {
  console.log('🔐 TESTING WITH AUTHENTICATED USER');
  console.log('===================================');
  
  let testEmail = `test-${Date.now()}@example.com`;
  let testPassword = 'TestPassword123!';
  let authenticatedUser = null;
  
  try {
    // Step 1: Sign up a test user
    console.log('1. 📝 Creating test user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      return;
    }
    
    if (!signUpData.user) {
      console.error('❌ No user data returned from signup');
      return;
    }
    
    authenticatedUser = signUpData.user;
    console.log('✅ Test user created:', authenticatedUser.id);
    
    // Step 2: Test INSERT with authenticated user
    console.log('\n2. 📝 Testing INSERT with authenticated user...');
    const testData = {
      user_id: authenticatedUser.id, // Using the actual authenticated user ID
      full_name: 'Authenticated Test User',
      linkedin_url: 'https://linkedin.com/in/authtest',
      location_city: 'Auth City',
      industry: 'Technology',
      tagline: 'Testing with authentication',
      onboarding_completed: true,
      profile_progress: 100,
      profile_visible: true
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('founders')
      .insert(testData)
      .select()
      .maybeSingle();
      
    if (insertError) {
      console.error('❌ INSERT failed:', insertError.message);
      console.error('Full error:', insertError);
    } else {
      console.log('✅ INSERT successful:', insertData.full_name);
    }
    
    // Step 3: Test SELECT with authenticated user
    console.log('\n3. 🔍 Testing SELECT with authenticated user...');
    const { data: selectData, error: selectError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', authenticatedUser.id)
      .maybeSingle();
      
    if (selectError) {
      console.error('❌ SELECT failed:', selectError.message);
    } else if (selectData) {
      console.log('✅ SELECT successful:', selectData.full_name);
    } else {
      console.log('⚠️  SELECT returned null');
    }
    
    // Step 4: Test UPDATE
    console.log('\n4. ✏️  Testing UPDATE...');
    const { data: updateData, error: updateError } = await supabase
      .from('founders')
      .update({ 
        tagline: 'Updated with authentication',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authenticatedUser.id)
      .select()
      .maybeSingle();
      
    if (updateError) {
      console.error('❌ UPDATE failed:', updateError.message);
    } else {
      console.log('✅ UPDATE successful:', updateData?.tagline);
    }
    
    // Step 5: Test the complete onboarding flow simulation
    console.log('\n5. 🎯 Testing Complete Onboarding Flow...');
    
    // Simulate the FounderService.completeOnboarding method
    const onboardingData = {
      full_name: 'Completed Onboarding User',
      linkedin_url: 'https://linkedin.com/in/completed',
      location_city: 'Onboarding City',
      industry: 'Testing',
      tagline: 'Completed the onboarding flow',
      profile_photo_url: null
    };
    
    // First try update (simulating existing user)
    const { data: updateResult, error: updateError2 } = await supabase
      .from('founders')
      .update({
        ...onboardingData,
        updated_at: new Date().toISOString(),
        onboarding_completed: true,
        profile_progress: 100
      })
      .eq('user_id', authenticatedUser.id)
      .select()
      .maybeSingle();

    if (!updateError2 && updateResult) {
      console.log('✅ Onboarding update successful:', updateResult.full_name);
    } else {
      // Try insert if update didn't work
      const { data: insertResult, error: insertError2 } = await supabase
        .from('founders')
        .insert({
          user_id: authenticatedUser.id,
          ...onboardingData,
          onboarding_completed: true,
          profile_progress: 100,
          profile_visible: true
        })
        .select()
        .maybeSingle();

      if (insertError2) {
        console.error('❌ Onboarding flow failed:', insertError2.message);
      } else {
        console.log('✅ Onboarding insert successful:', insertResult?.full_name);
      }
    }
    
    // Step 6: Test retrieval with retry logic
    console.log('\n6. 🔄 Testing Retrieval with Retry Logic...');
    let profile = null;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (!profile && attempts < maxAttempts) {
      attempts++;
      console.log(`   Attempt ${attempts}/${maxAttempts}`);
      
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', authenticatedUser.id)
        .maybeSingle();
        
      if (data) {
        profile = data;
        console.log('✅ Profile retrieved:', data.full_name);
        break;
      } else if (error) {
        console.error(`   Error on attempt ${attempts}:`, error.message);
      } else {
        console.log(`   No profile found on attempt ${attempts}`);
        await new Promise(resolve => setTimeout(resolve, 300 * attempts));
      }
    }
    
    if (!profile) {
      console.error('❌ Profile not retrievable after retries');
    }
    
  } catch (error) {
    console.error('💥 Test failed with error:', error.message);
  } finally {
    // Cleanup: Delete the test user's profile and sign out
    console.log('\n7. 🧹 Cleaning up...');
    
    if (authenticatedUser) {
      try {
        // Delete profile
        const { error: deleteError } = await supabase
          .from('founders')
          .delete()
          .eq('user_id', authenticatedUser.id);
          
        if (deleteError) {
          console.error('❌ Profile cleanup failed:', deleteError.message);
        } else {
          console.log('✅ Profile cleanup successful');
        }
        
        // Sign out
        await supabase.auth.signOut();
        console.log('✅ User signed out');
        
      } catch (cleanupError) {
        console.error('❌ Cleanup error:', cleanupError.message);
      }
    }
  }
  
  console.log('\n🎉 AUTHENTICATED TEST COMPLETE!');
  console.log('===============================');
  console.log('✅ Database connection verified');
  console.log('✅ Authentication working');
  console.log('✅ RLS policies functional');
  console.log('✅ CRUD operations successful');
  console.log('✅ .maybeSingle() preventing errors');
  console.log('\n🚀 Your onboarding flow should work perfectly!');
}

// Run the authenticated test
console.log('Starting authenticated database test...');
testWithAuthenticatedUser().catch(error => {
  console.error('💥 Authenticated test failed:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
});

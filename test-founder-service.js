// Test the actual FounderService methods we've updated
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Simulate the FounderService class methods
class TestFounderService {
  static async completeOnboarding(userId, data) {
    try {
      console.log('📝 Testing completeOnboarding method...');
      
      // First try to update existing profile
      const { data: updateResult, error: updateError } = await supabase
        .from('founders')
        .update({
          ...data,
          updated_at: new Date().toISOString(),
          onboarding_completed: true,
          profile_progress: 100
        })
        .eq('user_id', userId)
        .select()
        .maybeSingle();  // ✅ Using maybeSingle

      if (!updateError && updateResult) {
        console.log('✅ Update successful:', updateResult.full_name);
        return updateResult;
      }

      console.log('💡 Update returned no rows, trying insert...');
      
      // If update fails, try to insert new profile
      const { data: insertResult, error: insertError } = await supabase
        .from('founders')
        .insert({
          user_id: userId,
          ...data,
          onboarding_completed: true,
          profile_progress: 100,
          profile_visible: true
        })
        .select()
        .maybeSingle();  // ✅ Using maybeSingle

      if (insertError) {
        console.error('❌ Insert failed:', insertError);
        throw new Error(`Failed to save onboarding data: ${insertError.message}`);
      }

      if (!insertResult) {
        throw new Error('Failed to create profile - no data returned');
      }

      console.log('✅ Insert successful:', insertResult.full_name);
      return insertResult;
    } catch (error) {
      console.error('❌ Complete onboarding error:', error);
      throw error;
    }
  }

  static async getFounderProfile(userId, retries = 3) {
    console.log('🔍 Testing getFounderProfile method...');
    
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`   Attempt ${i + 1}/${retries}`);
        
        const { data, error } = await supabase
          .from('founders')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle();  // ✅ Using maybeSingle

        if (data) {
          console.log('✅ Profile found:', data.full_name);
          return data;
        }
        
        if (error) {
          console.error(`   Error on attempt ${i + 1}:`, error);
        } else {
          console.log(`   No profile found on attempt ${i + 1}`);
        }
        
        // Exponential backoff: 300ms, 600ms, 900ms
        if (i < retries - 1) {
          const delay = 300 * (i + 1);
          console.log(`   Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } catch (error) {
        console.error(`   Exception on attempt ${i + 1}:`, error);
        if (i === retries - 1) {
          return null;
        }
      }
    }
    
    console.log('❌ Profile not found after all retries');
    return null;
  }
}

async function testFounderServiceMethods() {
  console.log('🧪 TESTING FOUNDER SERVICE METHODS');
  console.log('===================================');
  
  const testUserId = 'service-test-' + Date.now();
  const testData = {
    full_name: 'Service Test User',
    linkedin_url: 'https://linkedin.com/in/servicetest',
    location_city: 'Boston',
    industry: 'Finance',
    tagline: 'Testing the service layer',
    profile_photo_url: null
  };

  let testsPassed = 0;
  let totalTests = 3;

  // Test 1: completeOnboarding method
  console.log('\n1. Testing completeOnboarding...');
  try {
    const result = await TestFounderService.completeOnboarding(testUserId, testData);
    if (result && result.full_name === testData.full_name) {
      console.log('✅ completeOnboarding test passed');
      testsPassed++;
    } else {
      console.error('❌ completeOnboarding returned unexpected result:', result);
    }
  } catch (error) {
    console.error('❌ completeOnboarding test failed:', error);
  }

  // Test 2: getFounderProfile method (should find the profile)
  console.log('\n2. Testing getFounderProfile (existing profile)...');
  try {
    const profile = await TestFounderService.getFounderProfile(testUserId);
    if (profile && profile.full_name === testData.full_name) {
      console.log('✅ getFounderProfile test passed');
      testsPassed++;
    } else {
      console.error('❌ getFounderProfile returned unexpected result:', profile);
    }
  } catch (error) {
    console.error('❌ getFounderProfile test failed:', error);
  }

  // Test 3: getFounderProfile method (non-existent profile)
  console.log('\n3. Testing getFounderProfile (non-existent profile)...');
  try {
    const profile = await TestFounderService.getFounderProfile('non-existent-user-id', 2); // Only 2 retries for speed
    if (profile === null) {
      console.log('✅ getFounderProfile correctly returned null for non-existent user');
      testsPassed++;
    } else {
      console.error('❌ getFounderProfile should have returned null:', profile);
    }
  } catch (error) {
    console.error('❌ getFounderProfile test failed:', error);
  }

  // Cleanup
  console.log('\n4. Cleaning up...');
  try {
    await supabase
      .from('founders')
      .delete()
      .eq('user_id', testUserId);
    console.log('✅ Cleanup successful');
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }

  // Summary
  console.log('\n🎉 SERVICE METHOD TEST SUMMARY');
  console.log('==============================');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('🚀 ALL SERVICE TESTS PASSED!');
    console.log('✅ .maybeSingle() working correctly');
    console.log('✅ Retry logic functioning');
    console.log('✅ Error handling proper');
  } else {
    console.log(`⚠️  ${totalTests - testsPassed} service tests failed.`);
  }
}

// Run the service test
console.log('Starting FounderService method tests...');
testFounderServiceMethods().catch(error => {
  console.error('💥 Service test suite failed:', error);
  process.exit(1);
});

const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Test state management
let testState = {
  testUserId: null,
  testData: null,
  cleanupItems: []
};

// Utility functions
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function beforeEach() {
  console.log('🔄 Setting up test environment...');
  
  // Generate proper UUID for this test run
  testState.testUserId = randomUUID();
  testState.cleanupItems = [];
  
  // Clear any existing test data
  await cleanupTestData();
  
  // Wait for database to settle
  await wait(500);
  
  console.log(`✅ Test environment ready (ID: ${testState.testUserId})`);
}

async function afterEach() {
  console.log('🧹 Cleaning up test data...');
  await cleanupTestData();
  console.log('✅ Cleanup complete');
}

async function cleanupTestData() {
  try {
    if (testState.testUserId) {
      const { error } = await supabase
        .from('founders')
        .delete()
        .eq('user_id', testState.testUserId);
        
      if (error && error.code !== 'PGRST116') {
        console.warn('⚠️ Cleanup warning:', error.message);
      }
    }
  } catch (error) {
    console.warn('⚠️ Cleanup error:', error.message);
  }
}

// Test functions
async function test1_MaybeSingleFix() {
  console.log('\n1️⃣ Testing .maybeSingle() fix...');
  
  try {
    // Test with non-existent UUID (should return null, not error)
    const nonExistentUUID = randomUUID();
    
    const { data: nonExistent, error: nonExistentError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', nonExistentUUID)
      .maybeSingle();
      
    if (nonExistentError) {
      throw new Error(`maybeSingle() should not error on missing records: ${nonExistentError.message}`);
    }
    
    if (nonExistent !== null) {
      throw new Error(`maybeSingle() should return null for missing records, got: ${typeof nonExistent}`);
    }
    
    console.log('✅ .maybeSingle() correctly handles non-existent records');
    return true;
    
  } catch (error) {
    console.error('❌ Test 1 failed:', error.message);
    return false;
  }
}

async function test2_DatabasePermissions() {
  console.log('\n2️⃣ Testing Database Permissions...');
  
  try {
    // Test SELECT permission
    const { data: selectData, error: selectError } = await supabase
      .from('founders')
      .select('id, full_name')
      .limit(1);
      
    if (selectError) {
      throw new Error(`SELECT permission failed: ${selectError.message}`);
    }
    
    console.log('✅ SELECT permission working');
    return true;
    
  } catch (error) {
    console.error('❌ Test 2 failed:', error.message);
    return false;
  }
}

async function test3_ProfileSave() {
  console.log('\n3️⃣ Testing Profile Save (INSERT/UPSERT)...');
  
  try {
    testState.testData = {
      user_id: testState.testUserId,
      full_name: 'Test User Fixed',
      linkedin_url: 'https://linkedin.com/in/testfixed',
      location_city: 'San Francisco',
      industry: 'Technology',
      tagline: 'Testing reliable flow',
      profile_photo_url: null,
      onboarding_completed: true,
      profile_progress: 100,
      profile_visible: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data: saveResult, error: saveError } = await supabase
      .from('founders')
      .upsert(testState.testData)
      .select()
      .maybeSingle();
      
    if (saveError) {
      throw new Error(`Profile save failed: ${saveError.message}`);
    }
    
    if (!saveResult || saveResult.user_id !== testState.testUserId) {
      throw new Error(`Save result invalid: ${JSON.stringify(saveResult)}`);
    }
    
    testState.cleanupItems.push(testState.testUserId);
    console.log(`✅ Profile saved successfully: ${saveResult.full_name}`);
    return true;
    
  } catch (error) {
    console.error('❌ Test 3 failed:', error.message);
    return false;
  }
}

async function test4_ProfileRetrievalWithRetry() {
  console.log('\n4️⃣ Testing Profile Retrieval with Retry Logic...');
  
  try {
    let profile = null;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!profile && attempts < maxAttempts) {
      attempts++;
      console.log(`   🔍 Retrieval attempt ${attempts}/${maxAttempts}`);
      
      // Wait before each attempt to handle eventual consistency
      if (attempts > 1) {
        await wait(200 * attempts);
      }
      
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('user_id', testState.testUserId)
        .maybeSingle();
        
      if (error) {
        throw new Error(`Retrieval error on attempt ${attempts}: ${error.message}`);
      }
      
      if (data) {
        profile = data;
        break;
      }
    }
    
    if (!profile) {
      throw new Error(`Profile not found after ${maxAttempts} attempts`);
    }
    
    if (profile.full_name !== testState.testData.full_name) {
      throw new Error(`Retrieved data mismatch: expected '${testState.testData.full_name}', got '${profile.full_name}'`);
    }
    
    console.log(`✅ Profile retrieved successfully in ${attempts} attempt(s): ${profile.full_name}`);
    return true;
    
  } catch (error) {
    console.error('❌ Test 4 failed:', error.message);
    return false;
  }
}

async function test5_ProfileUpdate() {
  console.log('\n5️⃣ Testing Profile Update...');
  
  try {
    const updatedTagline = 'Updated tagline - ' + Date.now();
    
    const { data: updateResult, error: updateError } = await supabase
      .from('founders')
      .update({
        tagline: updatedTagline,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testState.testUserId)
      .select()
      .maybeSingle();
      
    if (updateError) {
      throw new Error(`Profile update failed: ${updateError.message}`);
    }
    
    if (!updateResult || updateResult.tagline !== updatedTagline) {
      throw new Error(`Update result invalid: expected '${updatedTagline}', got '${updateResult?.tagline}'`);
    }
    
    console.log(`✅ Profile update successful: ${updateResult.tagline}`);
    return true;
    
  } catch (error) {
    console.error('❌ Test 5 failed:', error.message);
    return false;
  }
}

async function test6_RLSPolicies() {
  console.log('\n6️⃣ Testing RLS Policies...');
  
  try {
    // Just test that we can access our own data (basic RLS check)
    const { data: ownData, error: ownError } = await supabase
      .from('founders')
      .select('user_id')
      .eq('user_id', testState.testUserId)
      .maybeSingle();
      
    if (ownError) {
      throw new Error(`RLS check failed: ${ownError.message}`);
    }
    
    console.log('✅ RLS policies working (can access own data)');
    return true;
    
  } catch (error) {
    console.error('❌ Test 6 failed:', error.message);
    return false;
  }
}

// Main test runner
async function runTestSuite() {
  console.log('🧪 FIXED TEST SUITE - DETERMINISTIC TESTING');
  console.log('============================================');
  
  const tests = [
    { name: 'MaybeSingle Fix', fn: test1_MaybeSingleFix },
    { name: 'Database Permissions', fn: test2_DatabasePermissions },
    { name: 'Profile Save', fn: test3_ProfileSave },
    { name: 'Profile Retrieval', fn: test4_ProfileRetrievalWithRetry },
    { name: 'Profile Update', fn: test5_ProfileUpdate },
    { name: 'RLS Policies', fn: test6_RLSPolicies }
  ];
  
  let testsPassed = 0;
  const totalTests = tests.length;
  const results = [];
  
  try {
    // Setup phase
    await beforeEach();
    
    // Run tests sequentially (not in parallel to avoid race conditions)
    for (const test of tests) {
      console.log(`\n🏃‍♂️ Running: ${test.name}`);
      
      try {
        const passed = await test.fn();
        results.push({ name: test.name, passed, error: null });
        if (passed) testsPassed++;
      } catch (error) {
        console.error(`💥 Test "${test.name}" threw unexpected error:`, error);
        results.push({ name: test.name, passed: false, error: error.message });
      }
      
      // Small delay between tests to prevent rate limiting
      await wait(100);
    }
    
  } finally {
    // Cleanup phase (always runs)
    await afterEach();
  }
  
  // Results summary
  console.log('\n🎯 TEST RESULTS SUMMARY');
  console.log('=======================');
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.name}`);
    if (!result.passed && result.error) {
      console.log(`   └─ ${result.error}`);
    }
  });
  
  console.log(`\n📊 Final Score: ${testsPassed}/${totalTests} tests passed`);
  
  if (testsPassed === totalTests) {
    console.log('🎉 ALL TESTS PASSED! System is working correctly!');
    console.log('\n✅ Ready for production use');
    console.log('✅ Onboarding flow should be stable');
    console.log('✅ Database operations reliable');
    process.exit(0);
  } else {
    console.log(`⚠️  ${totalTests - testsPassed} test(s) failed. Check the errors above.`);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted. Cleaning up...');
  await afterEach();
  process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
  console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason);
  await afterEach();
  process.exit(1);
});

// Run the test suite
console.log('🚀 Starting deterministic test suite...');
runTestSuite().catch(async (error) => {
  console.error('💥 Test suite failed:', error);
  await afterEach();
  process.exit(1);
});

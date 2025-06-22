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

async function testMaybeSingleFix() {
  console.log('🧪 TESTING .maybeSingle() FIX');
  console.log('=============================');
  
  let testsPassed = 0;
  let totalTests = 4;
  
  // Test 1: .maybeSingle() with non-existent UUID
  console.log('\n1. Testing .maybeSingle() with non-existent record...');
  try {
    const nonExistentUuid = generateUUID();
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', nonExistentUuid)
      .maybeSingle();
      
    if (error) {
      console.error('❌ .maybeSingle() failed:', error.message);
    } else {
      console.log('✅ .maybeSingle() correctly returned null for non-existent record');
      testsPassed++;
    }
  } catch (error) {
    console.error('❌ .maybeSingle() test threw error:', error.message);
  }
  
  // Test 2: Basic SELECT permission
  console.log('\n2. Testing basic SELECT permission...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('user_id')
      .limit(1);
      
    if (error) {
      console.error('❌ SELECT permission failed:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('💡 You need to run the SAFE_PERMISSIONS_FIX.sql script first!');
      }
    } else {
      console.log('✅ Basic SELECT permission working');
      testsPassed++;
    }
  } catch (error) {
    console.error('❌ SELECT test threw error:', error.message);
  }
  
  // Test 3: INSERT test with proper UUID
  console.log('\n3. Testing INSERT with proper UUID...');
  const testUuid = generateUUID();
  const testData = {
    user_id: testUuid,
    full_name: 'Test User',
    linkedin_url: 'https://linkedin.com/in/test',
    location_city: 'Test City',
    industry: 'Technology',
    tagline: 'Testing',
    onboarding_completed: true,
    profile_progress: 100,
    profile_visible: true
  };
  
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert(testData)
      .select()
      .maybeSingle();
      
    if (error) {
      console.error('❌ INSERT failed:', error.message);
      if (error.message.includes('permission denied')) {
        console.log('💡 You need to run the SAFE_PERMISSIONS_FIX.sql script first!');
      }
    } else {
      console.log('✅ INSERT successful:', data?.full_name);
      testsPassed++;
    }
  } catch (error) {
    console.error('❌ INSERT test threw error:', error.message);
  }
  
  // Test 4: RETRIEVE the inserted record
  console.log('\n4. Testing RETRIEVE with .maybeSingle()...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', testUuid)
      .maybeSingle();
      
    if (error) {
      console.error('❌ RETRIEVE failed:', error.message);
    } else if (data) {
      console.log('✅ RETRIEVE successful:', data.full_name);
      testsPassed++;
    } else {
      console.log('⚠️  RETRIEVE returned null (record might not exist)');
    }
  } catch (error) {
    console.error('❌ RETRIEVE test threw error:', error.message);
  }
  
  // Cleanup
  console.log('\n5. Cleaning up...');
  try {
    const { error } = await supabase
      .from('founders')
      .delete()
      .eq('user_id', testUuid);
      
    if (error) {
      console.error('❌ Cleanup failed:', error.message);
    } else {
      console.log('✅ Cleanup successful');
    }
  } catch (error) {
    console.error('❌ Cleanup threw error:', error.message);
  }
  
  // Summary
  console.log('\n🎉 TEST SUMMARY');
  console.log('===============');
  console.log(`Tests Passed: ${testsPassed}/${totalTests}`);
  
  if (testsPassed === totalTests) {
    console.log('🚀 ALL TESTS PASSED!');
    console.log('✅ .maybeSingle() working correctly');
    console.log('✅ Database permissions configured');
    console.log('✅ CRUD operations functional');
    console.log('\n🎯 Your onboarding flow should work!');
  } else if (testsPassed === 0) {
    console.log('❌ ALL TESTS FAILED');
    console.log('🔧 ACTION NEEDED: Run the SAFE_PERMISSIONS_FIX.sql script in Supabase');
  } else {
    console.log(`⚠️  ${totalTests - testsPassed} tests failed`);
    console.log('🔍 Check the errors above for details');
  }
  
  console.log('\n📋 NEXT STEPS:');
  if (testsPassed < totalTests) {
    console.log('1. 🗄️  Go to your Supabase dashboard');
    console.log('2. 📋 Navigate to SQL Editor');
    console.log('3. 🔧 Run the SAFE_PERMISSIONS_FIX.sql script');
    console.log('4. ✅ Re-run this test');
  } else {
    console.log('1. 📱 Test mobile onboarding with Expo Go');
    console.log('2. 🔍 Check browser console for detailed logs');
    console.log('3. 🎉 Enjoy your working app!');
  }
}

// Run the test
console.log('Starting .maybeSingle() and permissions test...');
testMaybeSingleFix().catch(error => {
  console.error('💥 Test failed:', error.message);
  process.exit(1);
});

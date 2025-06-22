const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function testColumns() {
  console.log('🔍 Testing the specific columns that were causing errors...\n');
  
  try {
    console.log('✅ Test 1: onboarding_completed column');
    const { data, error } = await supabase
      .from('founders')
      .select('id, email, onboarding_completed')
      .limit(1);
    
    if (error) {
      console.log('❌ onboarding_completed test failed:', error.message);
      return false;
    } else {
      console.log('✅ onboarding_completed column works!');
    }

    console.log('✅ Test 2: full_name column');
    const { data: data2, error: error2 } = await supabase
      .from('founders')
      .select('id, email, full_name')
      .limit(1);
    
    if (error2) {
      console.log('❌ full_name test failed:', error2.message);
      return false;
    } else {
      console.log('✅ full_name column works!');
    }

    console.log('✅ Test 3: Comprehensive column test');
    const { data: data3, error: error3 } = await supabase
      .from('founders')
      .select('id, email, onboarding_completed, full_name, profile_progress, onboarding_step')
      .limit(1);
    
    if (error3) {
      console.log('❌ Comprehensive test failed:', error3.message);
      return false;
    } else {
      console.log('✅ All columns accessible!');
      console.log('📊 Sample data structure:', data3[0] || 'No records found');
    }

    console.log('\n🎉 SUCCESS: All database column errors have been fixed!');
    console.log('✅ The app should now work without "Column Does Not Exist" errors');
    return true;

  } catch (err) {
    console.log('❌ Test failed:', err.message);
    return false;
  }
}

testColumns().then(success => {
  process.exit(success ? 0 : 1);
});

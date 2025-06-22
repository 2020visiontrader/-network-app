// Simple test without imports to check if database columns exist
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testColumns() {
  console.log('🔍 Testing database columns...');
  
  // Test 1: Try to select the missing columns directly
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('onboarding_completed, full_name, profile_progress')
      .limit(1);
    
    if (error) {
      console.log('❌ Column test failed:', error.message);
      console.log('   Error code:', error.code);
    } else {
      console.log('✅ Columns exist and can be queried:', data);
    }
  } catch (err) {
    console.log('❌ Query failed:', err.message);
  }
  
  // Test 2: Get table structure
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .limit(1);
    
    if (data && data.length > 0) {
      console.log('✅ Available columns:', Object.keys(data[0]));
    } else if (error) {
      console.log('❌ Structure test failed:', error.message);
    } else {
      console.log('ℹ️  Table exists but is empty');
    }
  } catch (err) {
    console.log('❌ Structure test failed:', err.message);
  }
}

// Run the test
testColumns().then(() => {
  console.log('🏁 Test completed');
  process.exit(0);
}).catch(err => {
  console.log('❌ Test failed:', err);
  process.exit(1);
});

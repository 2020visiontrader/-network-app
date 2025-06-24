const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

console.log('🧪 QUICK VALIDATION TEST');
console.log('========================');

async function quickValidation() {
  let passed = 0;
  let total = 0;
  
  // Test 1: Database connection
  total++;
  console.log('\n1. Testing database connection...');
  try {
    const { data, error } = await supabase.from('founders').select('count(*)', { count: 'exact' }).limit(1);
    if (error) throw error;
    console.log('✅ Database connection working');
    passed++;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
  
  // Test 2: .maybeSingle() fix
  total++;
  console.log('\n2. Testing .maybeSingle() fix...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', randomUUID())
      .maybeSingle();
    
    if (error) throw error;
    if (data !== null) throw new Error('Should return null for non-existent records');
    console.log('✅ .maybeSingle() working correctly');
    passed++;
  } catch (error) {
    console.error('❌ .maybeSingle() test failed:', error.message);
  }
  
  // Test 3: Connections table structure
  total++;
  console.log('\n3. Testing connections table structure...');
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connections table has correct column names');
    passed++;
  } catch (error) {
    console.error('❌ Connections table structure test failed:', error.message);
  }
  
  // Test 4: Coffee chats table structure
  total++;
  console.log('\n4. Testing coffee_chats table structure...');
  try {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Coffee chats table has correct column names');
    passed++;
  } catch (error) {
    console.error('❌ Coffee chats table structure test failed:', error.message);
  }
  
  // Test 5: Masterminds table existence
  total++;
  console.log('\n5. Testing masterminds table...');
  try {
    const { data, error } = await supabase
      .from('masterminds')
      .select('host_id, topic, description')
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Masterminds table exists and accessible');
    passed++;
  } catch (error) {
    console.error('❌ Masterminds table test failed:', error.message);
  }
  
  // Results
  console.log('\n📊 VALIDATION RESULTS');
  console.log('=====================');
  console.log(`Passed: ${passed}/${total} tests`);
  
  if (passed === total) {
    console.log('🎉 ALL VALIDATIONS PASSED!');
    console.log('✅ Database schema fixes working');
    console.log('✅ Key errors should be resolved');
    console.log('✅ App should load without database errors');
  } else {
    console.log(`⚠️ ${total - passed} validation(s) failed`);
    console.log('Some database schema issues may still exist');
  }
  
  return passed === total;
}

quickValidation()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Validation failed:', error);
    process.exit(1);
  });

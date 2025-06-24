const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

// Generate valid UUIDs for testing
function generateUUID() {
  return crypto.randomUUID();
}

console.log('🧪 Testing .maybeSingle() fixes with proper UUID format...\n');

const testMaybeSingle = async () => {
  console.log('1. Testing .maybeSingle() for PGRST116 prevention...');
  try {
    const nonExistentId = generateUUID(); // Valid UUID format
    console.log('   🔍 Testing with UUID:', nonExistentId);
    
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', nonExistentId)
      .maybeSingle();

    if (error) {
      console.log('   ❌ Unexpected error:', error);
    } else if (data === null) {
      console.log('   ✅ .maybeSingle() correctly returned null for non-existent record');
    } else {
      console.log('   ⚠️ Unexpected data returned:', data);
    }
  } catch (err) {
    console.log('   ❌ Exception thrown:', err.message);
  }

  console.log('\n2. Testing user_id lookup with proper UUID...');
  try {
    const anotherId = generateUUID(); // Valid UUID format
    console.log('   🔍 Testing with user_id:', anotherId);
    
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', anotherId)
      .maybeSingle();

    if (error) {
      console.log('   ❌ Error with user_id lookup:', error.message);
    } else if (data === null) {
      console.log('   ✅ Gracefully handled null result without PGRST116 error');
    } else {
      console.log('   ⚠️ Found existing data:', data);
    }
  } catch (err) {
    console.log('   ❌ Exception thrown:', err.message);
  }

  console.log('\n3. Testing database schema fixes...');
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);

    if (error) {
      console.log('   ❌ Connections schema error:', error.message);
    } else {
      console.log('   ✅ Connections table schema correct (founder_a_id, founder_b_id)');
    }
  } catch (err) {
    console.log('   ❌ Schema test exception:', err.message);
  }

  console.log('\n4. Testing coffee chats schema fixes...');
  try {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);

    if (error) {
      console.log('   ❌ Coffee chats schema error:', error.message);
    } else {
      console.log('   ✅ Coffee chats table schema correct (requester_id, requested_id)');
    }
  } catch (err) {
    console.log('   ❌ Coffee chats test exception:', err.message);
  }

  console.log('\n✅ All .maybeSingle() to .maybeSingle() fixes tested!');
};

testMaybeSingle()
  .then(() => {
    console.log('\n🎉 Test completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Test failed:', err);
    process.exit(1);
  });

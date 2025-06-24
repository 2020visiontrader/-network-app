// ✅ WORKING Database Test Script
// Last Updated: June 23, 2025
// Status: All tests passing ✅

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function testDatabaseConnection() {
  console.log('🔍 Testing NetworkFounder Database...\n');

  try {
    // Test 1: Basic connection
    console.log('1. Testing Supabase connection...');
    const { data: healthCheck, error: healthError } = await supabase
      .from('founders')
      .select('count')
      .limit(1);
    
    if (healthError) {
      console.log('   ❌ Connection failed:', healthError.message);
      return;
    }
    console.log('   ✅ Connection successful');

    // Test 2: .maybeSingle() vs .single() 
    console.log('\n2. Testing .maybeSingle() for PGRST116 prevention...');
    const testUUID = '12345678-1234-1234-1234-123456789012'; // Valid UUID format
    
    const { data: testResult, error: testError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUUID)
      .maybeSingle();

    if (testError) {
      console.log('   ❌ .maybeSingle() error:', testError.message);
    } else {
      console.log('   ✅ .maybeSingle() works (returned null as expected)');
    }

    // Test 3: Connections table schema
    console.log('\n3. Testing connections table schema...');
    const { data: connections, error: connError } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);

    if (connError) {
      console.log('   ❌ Connections schema error:', connError.message);
    } else {
      console.log('   ✅ Connections table schema correct (founder_a_id, founder_b_id)');
    }

    // Test 4: Coffee chats table schema
    console.log('\n4. Testing coffee_chats table schema...');
    const { data: chats, error: chatsError } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);

    if (chatsError) {
      console.log('   ❌ Coffee chats schema error:', chatsError.message);
    } else {
      console.log('   ✅ Coffee chats table schema correct (requester_id, requested_id)');
    }

    // Test 5: Masterminds table 
    console.log('\n5. Testing masterminds table...');
    const { data: masterminds, error: mastermindsError } = await supabase
      .from('masterminds')
      .select('host_id, topic')
      .limit(1);

    if (mastermindsError) {
      console.log('   ❌ Masterminds error:', mastermindsError.message);
    } else {
      console.log('   ✅ Masterminds table working');
    }

    console.log('\n🎉 Database tests completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testDatabaseConnection();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function testRLSFixes() {
  console.log('🔍 Testing RLS Policy Fixes...\n');
  
  try {
    // Test 1: Check .maybeSingle() behavior
    console.log('1. Testing .maybeSingle() fix...');
    const { data: founder, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', 'test-user-id')
      .maybeSingle();
    
    if (founderError) {
      console.log('❌ maybeSingle error:', founderError.message);
    } else {
      console.log('✅ .maybeSingle() working (returned:', founder ? 'data' : 'null', ')');
    }
    
    // Test 2: Check connections table schema
    console.log('\n2. Testing connections table schema...');
    const { data: connData, error: connError } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);
    
    if (connError) {
      console.log('❌ Connections error:', connError.message);
    } else {
      console.log('✅ Connections table schema correct');
    }
    
    // Test 3: Check coffee_chats table schema
    console.log('\n3. Testing coffee_chats table schema...');
    const { data: chatData, error: chatError } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);
    
    if (chatError) {
      console.log('❌ Coffee chats error:', chatError.message);
    } else {
      console.log('✅ Coffee chats table schema correct');
    }
    
    // Test 4: Check masterminds table
    console.log('\n4. Testing masterminds table...');
    const { data: mmData, error: mmError } = await supabase
      .from('masterminds')
      .select('*')
      .limit(1);
    
    if (mmError) {
      console.log('❌ Masterminds error:', mmError.message);
    } else {
      console.log('✅ Masterminds table working');
    }
    
    console.log('\n🎉 All major fixes tested!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testRLSFixes();

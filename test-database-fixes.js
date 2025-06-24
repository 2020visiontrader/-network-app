#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

async function testDatabaseQueries() {
  console.log('🔍 Testing fixed database queries...\n');

  // Test 1: Connections table with correct column names
  console.log('1. Testing connections table...');
  try {
    const { data, error } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);
    
    if (error) {
      console.log('❌ Connections error:', error.message);
    } else {
      console.log('✅ Connections query works!');
      if (data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Connections error:', err.message);
  }

  // Test 2: Coffee chats table with correct column names
  console.log('\n2. Testing coffee_chats table...');
  try {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);
    
    if (error) {
      console.log('❌ Coffee chats error:', error.message);
    } else {
      console.log('✅ Coffee chats query works!');
      if (data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Coffee chats error:', err.message);
  }

  // Test 3: Masterminds table
  console.log('\n3. Testing masterminds table...');
  try {
    const { data, error } = await supabase
      .from('masterminds')
      .select('id, host_id, topic, description')
      .limit(1);
    
    if (error) {
      console.log('❌ Masterminds error:', error.message);
    } else {
      console.log('✅ Masterminds query works!');
      if (data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Masterminds error:', err.message);
  }

  // Test 4: Founders table
  console.log('\n4. Testing founders table...');
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('id, full_name, email')
      .limit(1);
    
    if (error) {
      console.log('❌ Founders error:', error.message);
    } else {
      console.log('✅ Founders query works!');
      if (data.length > 0) {
        console.log('   Sample columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.log('❌ Founders error:', err.message);
  }

  console.log('\n🎯 Database query test completed!');
}

testDatabaseQueries().catch(console.error);

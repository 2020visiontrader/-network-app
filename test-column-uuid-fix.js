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

async function checkColumnExists() {
  console.log('🔍 Checking if profile_visible column exists in founders table...');
  
  try {
    // Try to select the profile_visible column
    const { data, error } = await supabase
      .from('founders')
      .select('profile_visible')
      .limit(1);
      
    if (error) {
      console.log('❌ Error querying profile_visible column:', error.message);
      return false;
    } else {
      console.log('✅ profile_visible column exists and is accessible');
      return true;
    }
  } catch (err) {
    console.log('❌ Exception thrown when querying profile_visible:', err.message);
    return false;
  }
}

async function runTests() {
  // Check if profile_visible column exists
  const isVisibleExists = await checkColumnExists();
  
  if (isVisibleExists) {
    console.log('\n✅ The "profile_visible" column is properly set up in the founders table');
  } else {
    console.log('\n❌ The "profile_visible" column might be missing or there are schema cache issues');
  }
  
  console.log('\n🧪 Testing UUID validation...');
  
  try {
    // Test with a proper UUID
    const validUUID = generateUUID();
    console.log(`Testing with valid UUID: ${validUUID}`);
    
    const { data: validData, error: validError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', validUUID)
      .maybeSingle();
      
    if (validError) {
      console.log('❌ Error with valid UUID:', validError.message);
    } else {
      console.log('✅ Valid UUID format works correctly');
    }
    
    // Attempt with an invalid UUID to verify error handling
    console.log('\nTesting with invalid UUID: "test-concurrent-1-1750659173503"');
    
    try {
      const { data: invalidData, error: invalidError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', 'test-concurrent-1-1750659173503')
        .maybeSingle();
        
      if (invalidError) {
        console.log('✅ Properly detected invalid UUID format:', invalidError.message);
      } else {
        console.log('⚠️ No error with invalid UUID format - unexpected behavior');
      }
    } catch (err) {
      console.log('✅ Exception thrown with invalid UUID as expected:', err.message);
    }
    
  } catch (err) {
    console.log('❌ Test execution error:', err.message);
  }
}

runTests()
  .then(() => {
    console.log('\n🎉 Tests completed!');
  })
  .catch(err => {
    console.error('💥 Fatal error:', err);
  });

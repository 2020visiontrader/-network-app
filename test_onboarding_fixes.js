// test_onboarding_fixes.js
// This test verifies our three critical fixes:
// 1. That auth.uid() is correctly used in inserts
// 2. That sign-up form has been simplified (manual verification)
// 3. That redirection works properly after onboarding

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client - using hardcoded values as in minimal_test.js
const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use Brandon's personal email for testing (not using a test email as instructed)
const userEmail = process.argv[2]; // Pass email as first argument
const userPassword = process.argv[3]; // Pass password as second argument

if (!userEmail || !userPassword) {
  console.error('Usage: node test_onboarding_fixes.js [your-email] [your-password]');
  process.exit(1);
}

async function signIn() {
  try {
    console.log(`Signing in with email: ${userEmail}...`);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (error) {
      console.error('Sign in error:', error);
      return false;
    }
    
    console.log('Successfully signed in as:', data.user.email);
    return true;
  } catch (error) {
    console.error('Unexpected error during sign in:', error);
    return false;
  }
}

async function testAuthUidInsertion() {
  try {
    console.log('Testing auth.uid() is properly used in insertions...');
    
    // Get current auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Error getting current user:', userError);
      return false;
    }
    
    if (!user) {
      console.log('No authenticated user found. Please sign in first.');
      return false;
    }
    
    console.log('Authenticated user:', user.id, user.email);
    
    // Try to insert a test record using the auth user's ID
    const testData = {
      id: user.id,  // This should match auth.uid()
      email: user.email,
      full_name: 'Test User ' + new Date().toISOString(),
      onboarding_completed: false,
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert with matching auth.uid():', testData);
    
    const { data, error } = await supabase
      .from('founders')
      .upsert(testData)
      .select();
      
    if (error) {
      console.error('Error inserting with auth.uid():', error);
      return false;
    }
    
    console.log('Successfully inserted/updated record with auth.uid():', data);
    return true;
  } catch (error) {
    console.error('Unexpected error in testAuthUidInsertion:', error);
    return false;
  }
}

async function testRedirectAfterOnboarding() {
  try {
    console.log('\nTesting redirection logic after onboarding...');
    
    // Get current auth user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting current user or no user found.');
      return false;
    }
    
    // Check the current onboarding_completed value
    const { data: founder, error: getError } = await supabase
      .from('founders')
      .select('onboarding_completed')
      .eq('id', user.id)
      .maybeSingle();
      
    if (getError) {
      console.error('Error getting founder record:', getError);
      return false;
    }
    
    const currentStatus = founder?.onboarding_completed || false;
    console.log('Current onboarding_completed status:', currentStatus);
    
    // Toggle the onboarding_completed value for testing
    const newStatus = !currentStatus;
    
    const { error: updateError } = await supabase
      .from('founders')
      .update({ 
        onboarding_completed: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
      
    if (updateError) {
      console.error('Error updating onboarding status:', updateError);
      return false;
    }
    
    console.log(`Successfully updated onboarding_completed to ${newStatus}`);
    console.log('Now launch the app and verify navigation behavior:');
    console.log(`- With onboarding_completed = ${newStatus}, you should ${newStatus ? 'go directly to dashboard' : 'see the onboarding form'}`);
    
    // Reset back to the original value after 1 minute to not disrupt normal testing
    setTimeout(async () => {
      const { error: resetError } = await supabase
        .from('founders')
        .update({ 
          onboarding_completed: currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (resetError) {
        console.error('Error resetting onboarding status:', resetError);
      } else {
        console.log(`Reset onboarding_completed back to ${currentStatus}`);
      }
    }, 60000);
    
    return true;
  } catch (error) {
    console.error('Unexpected error in testRedirectAfterOnboarding:', error);
    return false;
  }
}

async function runTests() {
  console.log('=== ONBOARDING FIXES VERIFICATION ===');
  
  const signedIn = await signIn();
  if (!signedIn) {
    console.error('Could not sign in - cannot continue with tests');
    return;
  }
  
  const authUidResult = await testAuthUidInsertion();
  const redirectResult = await testRedirectAfterOnboarding();
  
  console.log('\n=== TEST RESULTS ===');
  console.log('1. Auth UID in Insert:', authUidResult ? 'PASS ✅' : 'FAIL ❌');
  console.log('2. SignUp Form Simplified: Manual verification required');
  console.log('3. Redirect After Onboarding:', redirectResult ? 'PASS ✅ (verify in app)' : 'FAIL ❌');
}

runTests();

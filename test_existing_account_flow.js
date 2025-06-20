// test_existing_account_flow.js
// Tests the Auth → Dashboard flow with an existing account
// This script only tests if an existing account's onboarding status is correctly checked

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Use user's personal email for testing
const userEmail = process.argv[2]; // Pass email as first argument
const userPassword = process.argv[3]; // Pass password as second argument

if (!userEmail || !userPassword) {
  console.error('Usage: node test_existing_account_flow.js [your-email] [your-password]');
  process.exit(1);
}

async function testExistingAccountFlow() {
  console.log('🧪 TESTING EXISTING ACCOUNT NAVIGATION FLOW\n');
  
  try {
    // Step 1: Get the auth session using the current browser session
    console.log('1. Checking if an existing session is available');
    
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Error getting session:', sessionError);
    }
    
    // If no session exists, try to sign in
    if (!sessionData?.session?.user) {
      console.log('No active session found, attempting to sign in');
      
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: userPassword
      });
      
      if (signInError) {
        console.error('❌ Sign in error:', signInError);
        console.log('\nTROUBLESHOOTING STEPS:');
        console.log('1. Verify you\'re using the correct email and password');
        console.log('2. Confirm your Supabase instance is running properly');
        console.log('3. Try creating a new user in the Supabase dashboard');
        return false;
      }
      
      console.log('✅ Successfully signed in:', signInData.user.email);
      
      // Step 2: Check if the user has an onboarding record
      console.log('\n2. Checking onboarding status');
      
      const { data: founderData, error: founderError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', signInData.user.id)
        .maybeSingle();
      
      if (founderError) {
        console.error('❌ Error checking founder record:', founderError);
        return false;
      }
      
      if (!founderData) {
        console.log('📝 No founder record found - this user needs to complete onboarding');
        console.log('Based on the app logic, this user should be directed to the Onboarding screen');
      } else {
        console.log('📋 Found existing founder record:', {
          id: founderData.id,
          email: founderData.email,
          onboarding_completed: founderData.onboarding_completed
        });
        
        if (founderData.onboarding_completed) {
          console.log('✅ Onboarding is marked as COMPLETED');
          console.log('Based on the app logic, this user should be directed to the Dashboard');
        } else {
          console.log('❗ Onboarding is marked as NOT COMPLETED');
          console.log('Based on the app logic, this user should be directed to the Onboarding screen');
          
          // Optional: Update onboarding status
          console.log('\nWould you like to mark onboarding as completed? (Only for testing purposes)');
          console.log('Run this SQL in Supabase dashboard:');
          console.log(`UPDATE founders SET onboarding_completed = true, profile_progress = 100 WHERE id = '${founderData.id}';`);
        }
      }
      
      return true;
    } else {
      // Session exists
      const user = sessionData.session.user;
      console.log('✅ Found existing session for user:', user.email);
      
      // Step 2: Check if the user has an onboarding record
      console.log('\n2. Checking onboarding status');
      
      const { data: founderData, error: founderError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      if (founderError) {
        console.error('❌ Error checking founder record:', founderError);
        return false;
      }
      
      if (!founderData) {
        console.log('📝 No founder record found - this user needs to complete onboarding');
        console.log('Based on the app logic, this user should be directed to the Onboarding screen');
      } else {
        console.log('📋 Found existing founder record:', {
          id: founderData.id,
          email: founderData.email,
          onboarding_completed: founderData.onboarding_completed
        });
        
        if (founderData.onboarding_completed) {
          console.log('✅ Onboarding is marked as COMPLETED');
          console.log('Based on the app logic, this user should be directed to the Dashboard');
        } else {
          console.log('❗ Onboarding is marked as NOT COMPLETED');
          console.log('Based on the app logic, this user should be directed to the Onboarding screen');
          
          // Optional: Update onboarding status
          console.log('\nWould you like to mark onboarding as completed? (Only for testing purposes)');
          console.log('Run this SQL in Supabase dashboard:');
          console.log(`UPDATE founders SET onboarding_completed = true, profile_progress = 100 WHERE id = '${founderData.id}';`);
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    return false;
  }
}

// Run the test
testExistingAccountFlow();

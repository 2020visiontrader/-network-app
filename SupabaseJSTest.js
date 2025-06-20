// SupabaseJSTest.js - Direct test of Supabase JS client operations
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (replace with your actual URLs and keys)
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test credentials
const TEST_EMAIL = 'test_supabase@example.com';
const TEST_PASSWORD = 'Test1234!';

// Sample onboarding data
const createSampleOnboardingData = (userId, userEmail) => ({
  user_id: userId,
  email: userEmail,
  full_name: 'Test Supabase User',
  company_name: 'Test Company',
  role: 'Founder',
  industry: 'Technology',
  bio: 'This is a test bio for Supabase JS testing.',
  tags_or_interests: ['testing', 'supabase', 'react-native'],
  linkedin_url: 'https://linkedin.com/in/testuser',
  location_city: 'San Francisco',
  profile_visible: true,
  onboarding_completed: true,
  profile_progress: 100
});

// Test the exact Supabase JS operations for auth and onboarding
async function testSupabaseJSOperations() {
  console.log('🧪 TESTING SUPABASE JS OPERATIONS');
  console.log('=====================================');
  
  try {
    // Step 1: Sign in the test user
    console.log('\n1. Authenticating user...');
    
    // Sign out any existing user first
    await supabase.auth.signOut();
    console.log('   Previous user signed out');
    
    // Sign in with test credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    // Handle auth errors or create test user if needed
    if (signInError) {
      console.log(`   Sign in failed: ${signInError.message}`);
      
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('   Creating test user...');
        
        // Use signUp with email confirmation disabled for testing
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
          options: {
            emailRedirectTo: 'http://localhost:3000/auth/callback',
            // For testing only - in production you'd want email confirmation
            data: {
              full_name: 'Test User',
              company_name: 'Test Company',
              role: 'Founder'
            }
          }
        });
        
        if (signUpError) {
          throw new Error(`Failed to create test user: ${signUpError.message}`);
        }
        
        console.log('   ✅ Test user created successfully');
        
        // Use the newly created user
        if (!signUpData.user) {
          throw new Error('User creation succeeded but no user data returned');
        }
        
        var user = signUpData.user;
      } else {
        throw signInError;
      }
    } else {
      console.log('   ✅ User signed in successfully');
      var user = signInData.user;
    }
    
    console.log(`   User ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    
    // Step 2: Check if founder record exists using .maybeSingle()
    console.log('\n2. Checking for existing founder record...');
    
    const { data: existingFounder, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(); // Using maybeSingle() instead of single()
    
    if (founderError) {
      console.log(`   ❌ Error checking founder: ${founderError.message}`);
      
      if (founderError.code === '42501') {
        throw new Error('RLS policy violation - check that policies allow user_id = auth.uid()');
      }
    } else if (existingFounder) {
      console.log('   ✅ Existing founder record found');
      console.log(`   Onboarding completed: ${existingFounder.onboarding_completed ? 'Yes' : 'No'}`);
      
      // Determine navigation based on onboarding status
      if (existingFounder.onboarding_completed) {
        console.log('   Would navigate to: Dashboard');
      } else {
        console.log('   Would navigate to: Onboarding');
      }
    } else {
      console.log('   ℹ️ No founder record found - would redirect to onboarding');
    }
    
    // Step 3: Perform upsert operation for onboarding
    console.log('\n3. Testing onboarding data upsert...');
    
    // Generate sample onboarding data
    const onboardingData = createSampleOnboardingData(user.id, user.email);
    console.log('   Prepared onboarding data with all required fields');
    
    // Perform the upsert operation
    const { data: upsertData, error: upsertError } = await supabase
      .from('founders')
      .upsert(onboardingData)
      .select()
      .maybeSingle();
    
    if (upsertError) {
      console.log(`   ❌ Upsert failed: ${upsertError.message}`);
      
      if (upsertError.code === '42501') {
        throw new Error('RLS policy violation - check that policies allow user_id = auth.uid() for INSERT/UPDATE');
      } else if (upsertError.code === '23502') {
        throw new Error('Not-null constraint violation - missing required field');
      } else {
        throw upsertError;
      }
    } else {
      console.log('   ✅ Upsert operation successful');
    }
    
    // Step 4: Verify the upserted record
    console.log('\n4. Verifying upserted record...');
    
    const { data: verifyData, error: verifyError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (verifyError) {
      console.log(`   ❌ Verification failed: ${verifyError.message}`);
      throw verifyError;
    }
    
    if (!verifyData) {
      throw new Error('Record not found after upsert');
    }
    
    console.log('   ✅ Record verified successfully');
    console.log(`   ID: ${verifyData.id}`);
    console.log(`   User ID: ${verifyData.user_id}`);
    console.log(`   Onboarding completed: ${verifyData.onboarding_completed ? 'Yes' : 'No'}`);
    
    // Final check to simulate app navigation
    if (verifyData.onboarding_completed) {
      console.log('\n✅ Onboarding complete - would navigate to Dashboard');
    } else {
      console.log('\n⚠️ Onboarding incomplete - would stay on Onboarding screen');
    }
    
    console.log('\n🎉 SUPABASE JS OPERATIONS TEST SUCCESSFUL 🎉');
    
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error(`   ${error.message}`);
    
    // Provide helpful troubleshooting tips based on error message
    if (error.message.includes('RLS policy')) {
      console.log('\n🔍 RLS POLICY TROUBLESHOOTING:');
      console.log('   - Ensure user is signed in before database operations');
      console.log('   - Check that RLS policies use both id and user_id: (id = auth.uid() OR user_id = auth.uid())');
      console.log('   - Run fix_missing_trigger.sql in Supabase dashboard');
    } else if (error.message.includes('Not-null constraint')) {
      console.log('\n🔍 DATABASE SCHEMA TROUBLESHOOTING:');
      console.log('   - Run check_required_fields.sql to identify all required fields');
      console.log('   - Ensure onboarding form collects all required fields');
      console.log('   - Update onboarding data with all required NOT NULL fields');
    }
  }
}

// Export the test function
module.exports = { testSupabaseJSOperations };

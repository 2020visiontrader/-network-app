const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOnboardingRedirect() {
  console.log('🔍 CHECKING ONBOARDING REDIRECT LOGIC...\n');

  try {
    // Test with the user from the logs
    const email = 'hellonetworkapp@gmail.com';
    
    console.log('1. Fetching user data for:', email);
    
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error('❌ Error fetching user:', userError);
      return;
    }

    console.log('2. User data found:');
    console.log('   - Full Name:', userData.full_name);
    console.log('   - Onboarding Complete:', userData.onboarding_complete);
    console.log('   - Last Updated:', userData.updated_at);
    console.log('   - User ID:', userData.id);
    
    console.log('\n3. Checking navigation logic:');
    console.log('   - userData exists:', !!userData);
    console.log('   - onboarding_complete:', userData.onboarding_complete);
    console.log('   - Should redirect to main app:', userData.onboarding_complete === true);
    
    if (userData.onboarding_complete === true) {
      console.log('✅ Navigation should redirect to main app');
      console.log('✅ Onboarding redirect logic is working correctly');
    } else {
      console.log('❌ Navigation should stay on onboarding screen');
      console.log('❌ Issue: onboarding_complete is not true');
    }
    
    console.log('\n4. Simulating refresh of user data...');
    
    // Simulate what happens when refreshUserData is called
    const { data: refreshedData, error: refreshError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', userData.id)
      .maybeSingle();
      
    if (refreshError) {
      console.error('❌ Error refreshing user data:', refreshError);
      return;
    }
    
    console.log('   - Refreshed onboarding_complete:', refreshedData.onboarding_complete);
    console.log('   - Data consistency:', 
      userData.onboarding_complete === refreshedData.onboarding_complete ? '✅ Consistent' : '❌ Inconsistent'
    );
    
    console.log('\n🎯 DIAGNOSIS:');
    if (refreshedData.onboarding_complete === true) {
      console.log('✅ Database has onboarding_complete: true');
      console.log('✅ The issue is likely in the React state update timing');
      console.log('💡 SOLUTION: The refreshUserData call needs time to update React state');
      console.log('💡 RECOMMENDATION: Add a small delay or use a callback after refreshUserData');
    } else {
      console.log('❌ Database has onboarding_complete: false');
      console.log('❌ The profile update is not setting onboarding_complete properly');
      console.log('💡 RECOMMENDATION: Check the profile update logic in OnboardingScreen');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkOnboardingRedirect();

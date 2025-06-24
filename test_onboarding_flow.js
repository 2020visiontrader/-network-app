const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Use user's personal email for testing
const userEmail = process.argv[2]; // Pass email as first argument
const userPassword = process.argv[3]; // Pass password as second argument

if (!userEmail || !userPassword) {
  console.error('Usage: node test_onboarding_flow.js [your-email] [your-password]');
  process.exit(1);
}

async function testCompleteAuthToOnboardingFlow() {
  console.log('🧪 TESTING COMPLETE AUTH → ONBOARDING → DASHBOARD FLOW\n');
  
  try {
    // Step 1: Sign in with the provided credentials
    console.log(`1. Signing in with email: ${userEmail}`);
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password: userPassword
    });
    
    if (signInError) {
      console.error('❌ Sign in error:', signInError);
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
      console.log('📝 No founder record found - user needs to complete onboarding');
      
      // Step 3a: Create onboarding record (simulating onboarding form submission)
      console.log('\n3. Creating onboarding record');
      
      const onboardingData = {
        id: signInData.user.id,
        email: userEmail,
        full_name: 'Test User',
        linkedin_url: 'https://linkedin.com/in/testuser',
        location_city: 'San Francisco',
        industry: 'Technology',
        company_name: 'Test Company',
        role: 'Founder',
        bio: 'This is a test user profile created for flow testing.',
        tags_or_interests: ['Testing', 'Technology', 'Startups'],
        profile_visible: true,
        onboarding_completed: true,
        profile_progress: 100,
        updated_at: new Date().toISOString()
      };
      
      try {
        // Try using the database function first
        const { data: funcData, error: funcError } = await supabase.rpc('upsert_founder_onboarding', {
          user_id: signInData.user.id,
          user_email: userEmail,
          founder_data: {
            full_name: onboardingData.full_name,
            linkedin_url: onboardingData.linkedin_url,
            location_city: onboardingData.location_city,
            industry: onboardingData.industry,
            company_name: onboardingData.company_name,
            role: onboardingData.role,
            bio: onboardingData.bio,
            tags_or_interests: onboardingData.tags_or_interests,
            profile_visible: onboardingData.profile_visible
          }
        });
        
        if (funcError) {
          console.log('ℹ️ Function failed, using direct insert:', funcError.message);
          
          // Fall back to direct insert
          const { data: insertData, error: insertError } = await supabase
            .from('founders')
            .upsert(onboardingData)
            .select();
            
          if (insertError) {
            console.error('❌ Error creating onboarding record:', insertError);
            return false;
          }
          
          console.log('✅ Successfully created onboarding record via direct insert');
        } else {
          console.log('✅ Successfully created onboarding record via function');
        }
      } catch (error) {
        console.error('❌ Onboarding creation error:', error);
        return false;
      }
    } else {
      console.log('📋 Found existing founder record:', {
        id: founderData.id,
        email: founderData.email,
        onboarding_completed: founderData.onboarding_completed
      });
      
      // Step 3b: Update onboarding status if needed
      if (!founderData.onboarding_completed) {
        console.log('\n3. Updating onboarding status to completed');
        
        const { error: updateError } = await supabase
          .from('founders')
          .update({ 
            onboarding_completed: true,
            profile_progress: 100,
            updated_at: new Date().toISOString()
          })
          .eq('id', founderData.id);
          
        if (updateError) {
          console.error('❌ Error updating onboarding status:', updateError);
          return false;
        }
        
        console.log('✅ Successfully updated onboarding status to completed');
      } else {
        console.log('✅ Onboarding already completed, skipping update');
      }

    console.log('✅ Onboarding upsert successful:', upsertedData?.full_name);

    // Test fetching the data back
    console.log('\n2. Testing data retrieval...');
    const { data: fetchedData, error: fetchError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUserData.id)
      .maybeSingle();

    if (fetchError) {
      console.error('❌ Fetch failed:', fetchError);
      return;
    }

    console.log('✅ Data fetch successful:');
    console.log('   - Name:', fetchedData.full_name);
    console.log('   - Onboarding Complete:', fetchedData.onboarding_complete);

    // Clean up
    console.log('\n3. Cleaning up test data...');
    await supabase.from('founders').delete().eq('id', testUserData.id);
    
    console.log('\n🎉 ONBOARDING FLOW TEST PASSED!');
    console.log('✅ The upsert operation should work in the app');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testOnboardingFlow();

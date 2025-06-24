// test_auth_flow_after_fix.js
// Run this script to test the auth flow after applying the database fixes

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a unique test email
const testEmail = `test-${Date.now()}@example.com`;
const testPassword = 'TestPassword123!';

async function testAuthFlow() {
  console.log('======================================');
  console.log('TESTING COMPLETE AUTH FLOW AFTER FIX');
  console.log('======================================\n');
  console.log(`Using test email: ${testEmail}`);

  try {
    // 1. Sign up a new user
    console.log('\n1️⃣ Creating a new test user...');
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      return;
    }
    
    console.log('✅ User created successfully');
    console.log(`User ID: ${signUpData.user.id}`);
    
    // 2. Verify user was created in auth.users
    const userId = signUpData.user.id;
    
    // 3. Check if handle_new_user trigger created a founders record
    console.log('\n2️⃣ Checking if founders record was created automatically...');
    
    // Small delay to allow trigger to execute
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const { data: founderData, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', userId);
      
    if (founderError) {
      console.error('❌ Error checking founders table:', founderError.message);
      return;
    }
    
    if (!founderData || founderData.length === 0) {
      console.error('❌ No founders record was created by trigger');
      
      // Try direct query with admin key if available
      if (process.env.SUPABASE_SERVICE_KEY) {
        console.log('Checking with admin key...');
        const adminSupabase = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_KEY);
        
        const { data: adminFounderData, error: adminFounderError } = await adminSupabase
          .from('founders')
          .select('*')
          .eq('user_id', userId);
          
        if (adminFounderError) {
          console.error('❌ Admin query error:', adminFounderError.message);
        } else if (adminFounderData && adminFounderData.length > 0) {
          console.log('✅ Founders record exists but not accessible due to RLS policies');
          console.log(adminFounderData[0]);
        } else {
          console.error('❌ Confirmed: No founders record was created');
        }
      }
    } else {
      console.log('✅ Founders record was created automatically');
      console.log('Founders record:', founderData[0]);
    }
    
    // 4. Test the upsert_founder_onboarding function
    console.log('\n3️⃣ Testing upsert_founder_onboarding function...');
    
    // Create test onboarding data
    const onboardingData = {
      full_name: 'Test User',
      company_name: 'Test Company',
      role: 'Founder',
      linkedin_url: 'https://linkedin.com/in/testuser',
      location_city: 'San Francisco',
      industry: 'Technology',
      bio: 'This is a test user for validating database fixes.',
      tags_or_interests: ['startup', 'technology', 'testing']
    };
    
    // Call the function
    const { data: upsertData, error: upsertError } = await supabase.rpc(
      'upsert_founder_onboarding',
      {
        user_id: userId,
        user_email: testEmail,
        founder_data: onboardingData
      }
    );
    
    if (upsertError) {
      console.error('❌ Error calling upsert_founder_onboarding:', upsertError.message);
    } else {
      console.log('✅ upsert_founder_onboarding succeeded');
      console.log('Result:', upsertData);
    }
    
    // 5. Check the updated founder record
    console.log('\n4️⃣ Verifying founder record after onboarding...');
    
    const { data: updatedFounder, error: updatedError } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (updatedError) {
      console.error('❌ Error fetching updated record:', updatedError.message);
    } else if (updatedFounder) {
      console.log('✅ Founder record updated successfully');
      console.log('Updated record:');
      console.log({
        id: updatedFounder.id,
        user_id: updatedFounder.user_id,
        email: updatedFounder.email,
        full_name: updatedFounder.full_name,
        company_name: updatedFounder.company_name,
        onboarding_completed: updatedFounder.onboarding_completed
      });
      
      // Verify key fields were set correctly
      if (updatedFounder.user_id === userId) {
        console.log('✅ user_id is set correctly');
      } else {
        console.error('❌ user_id mismatch:', updatedFounder.user_id, 'vs', userId);
      }
      
      if (updatedFounder.onboarding_completed) {
        console.log('✅ onboarding_completed flag is set');
      } else {
        console.warn('⚠️ onboarding_completed flag is not set');
      }
    } else {
      console.error('❌ Founder record not found after update');
    }
    
    // 6. Test full auth flow (sign out and sign back in)
    console.log('\n5️⃣ Testing full auth cycle (sign out and sign in)...');
    
    // Sign out
    await supabase.auth.signOut();
    console.log('Signed out successfully');
    
    // Sign back in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful');
      
      // Verify we can still access the founder record
      const { data: finalCheck, error: finalError } = await supabase
        .from('founders')
        .select('id, user_id, email, full_name')
        .eq('user_id', signInData.user.id)
        .maybeSingle();
        
      if (finalError) {
        console.error('❌ Final check failed:', finalError.message);
      } else if (finalCheck) {
        console.log('✅ Full auth cycle successful!');
        console.log('Founder record accessible after re-auth:', finalCheck);
      } else {
        console.error('❌ Founder record not found after re-auth');
      }
    }
    
    console.log('\n✅ Auth flow testing complete!');
    
  } catch (error) {
    console.error('❌ Test script error:', error);
  }
}

testAuthFlow()
  .catch(err => console.error('Script error:', err))
  .finally(() => process.exit());

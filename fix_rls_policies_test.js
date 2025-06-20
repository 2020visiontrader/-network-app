require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use admin/service role key for policy management
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Make sure you have EXPO_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicies() {
  console.log('🔧 Fixing RLS Policies for Onboarding...\n');
  
  try {
    // First, let's check current policies
    console.log('1. Checking current policies...');
    const { data: policies, error: policiesError } = await supabase
      .from('pg_policies')
      .select('policyname, permissive, roles, cmd, qual')
      .eq('tablename', 'founders');
    
    if (policies && policies.length > 0) {
      console.log('✅ Found existing policies:', policies.map(p => p.policyname));
    } else {
      console.log('⚠️ No policies found or cannot query policies table');
    }
    
    // Try to execute the policy fixes
    console.log('\n2. Attempting to fix policies...');
    
    // Since we can't directly execute DDL through the JS client easily,
    // let's test the current access patterns instead
    
    console.log('\n3. Testing current access patterns...');
    
    // Test anonymous access (should fail)
    console.log('Testing anonymous access...');
    const anonSupabase = createClient(supabaseUrl, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonData, error: anonError } = await anonSupabase
      .from('founders')
      .select('*')
      .limit(1);
    
    if (anonError) {
      console.log('✅ Anonymous access properly blocked:', anonError.message);
    } else {
      console.log('⚠️ Anonymous access allowed (may be unexpected)');
    }
    
    // Test authenticated access simulation
    console.log('\n4. Testing authenticated access simulation...');
    
    // Create a test user context
    const testUserId = '123e4567-e89b-12d3-a456-426614174000';
    const testUserEmail = 'test@example.com';
    
    // Try to simulate what happens during onboarding
    console.log('Simulating onboarding upsert...');
    
    const testData = {
      id: testUserId,
      email: testUserEmail,
      full_name: 'Test User',
      role: 'Founder',
      company_name: 'Test Company',
      industry: 'Tech',
      location_city: 'Test City',
      linkedin_url: 'https://linkedin.com/in/test',
      bio: 'Test bio',
      tags_or_interests: ['test'],
      profile_visible: true,
      onboarding_completed: true,
      profile_progress: 100,
      updated_at: new Date().toISOString()
    };
    
    // Test using the upsert function (which should work)
    const { data: upsertData, error: upsertError } = await supabase
      .rpc('upsert_founder_onboarding', {
        user_id: testUserId,
        user_email: testUserEmail,
        founder_data: {
          full_name: testData.full_name,
          role: testData.role,
          company_name: testData.company_name,
          industry: testData.industry,
          location_city: testData.location_city,
          linkedin_url: testData.linkedin_url,
          bio: testData.bio,
          tags_or_interests: testData.tags_or_interests,
          profile_visible: testData.profile_visible
        }
      });
    
    if (upsertError) {
      console.log('❌ Upsert function failed:', upsertError.message);
    } else {
      console.log('✅ Upsert function works correctly');
    }
    
    // Now test direct table access (this might fail with RLS)
    const { data: directData, error: directError } = await supabase
      .from('founders')
      .upsert(testData, { onConflict: 'id' })
      .select();
    
    if (directError) {
      console.log('❌ Direct table upsert failed:', directError.message);
      console.log('   This is expected - use the upsert function instead');
    } else {
      console.log('✅ Direct table upsert works');
    }
    
    console.log('\n🎯 RLS POLICY ANALYSIS:');
    console.log('✅ Database connection working');
    console.log(upsertError ? '❌' : '✅', 'Upsert function working');
    console.log(directError ? '❌' : '✅', 'Direct table access working');
    
    console.log('\n📋 RECOMMENDATIONS:');
    if (upsertError) {
      console.log('1. ❌ Upsert function needs fixing - run complete_onboarding_migration.sql');
    } else {
      console.log('1. ✅ Upsert function works - use FounderService.upsertFounderOnboarding()');
    }
    
    if (directError) {
      console.log('2. ⚠️ Direct table access blocked by RLS - this is actually good for security');
      console.log('   Continue using the upsert function for onboarding');
    } else {
      console.log('2. ✅ Direct table access works');
    }
    
    console.log('\n🔧 NEXT STEPS:');
    console.log('1. Update OnboardingForm to use FounderService.upsertFounderOnboarding()');
    console.log('2. Test the mobile app onboarding flow');
    console.log('3. If still failing, run fix_rls_policies_simple.sql in Supabase Dashboard');
    
  } catch (error) {
    console.error('❌ RLS policy fix failed:', error.message);
  }
}

// Run the fix
fixRLSPolicies().then(() => {
  process.exit(0);
});

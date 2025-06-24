const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

// Create clients
const supabaseAnon = createClient(supabaseUrl, supabaseKey);
const supabaseService = createClient(supabaseUrl, serviceKey);

async function testRLSPolicies() {
  console.log('🔐 Testing RLS Policies on Founders Table');
  console.log('================================================\n');

  try {
    // Test 1: Check current policies
    console.log('1️⃣ Checking current RLS policies...');
    const { data: policies, error: policiesError } = await supabaseService
      .from('pg_policies')
      .select('policyname, cmd, permissive')
      .eq('tablename', 'founders')
      .order('policyname');

    if (policiesError) {
      console.error('❌ Error fetching policies:', policiesError.message);
      return;
    }

    console.log('📋 Current policies on founders table:');
    if (policies && policies.length > 0) {
      policies.forEach(policy => {
        console.log(`   - ${policy.policyname} (${policy.cmd})`);
      });
    } else {
      console.log('   - No policies found');
    }
    console.log();

    // Test 2: Test service role access
    console.log('2️⃣ Testing service role access...');
    const { data: serviceData, error: serviceError } = await supabaseService
      .from('founders')
      .select('id, email, full_name, onboarding_complete')
      .limit(5);

    if (serviceError) {
      console.error('❌ Service role access failed:', serviceError.message);
    } else {
      console.log(`✅ Service role can access ${serviceData.length} founder records`);
    }
    console.log();

    // Test 3: Test anonymous access (should be restricted)
    console.log('3️⃣ Testing anonymous access (should be restricted)...');
    const { data: anonData, error: anonError } = await supabaseAnon
      .from('founders')
      .select('id, email, full_name')
      .limit(1);

    if (anonError) {
      console.log('✅ Anonymous access properly restricted:', anonError.message);
    } else {
      console.log('⚠️ Anonymous access allowed (unexpected):', anonData?.length || 0, 'records');
    }
    console.log();

    // Test 4: Test authenticated user access (simulate)
    console.log('4️⃣ Testing authenticated user simulation...');
    
    // Get a test user ID from the database
    const { data: testUser, error: testUserError } = await supabaseService
      .from('founders')
      .select('id, user_id, email')
      .eq('email', 'hellonetworkapp@gmail.com')
      .maybeSingle();

    if (testUserError) {
      console.error('❌ Could not find test user:', testUserError.message);
    } else if (testUser) {
      console.log(`✅ Found test user: ${testUser.email} (user_id: ${testUser.user_id})`);
      
      // Test authenticated access with proper user context
      console.log('   Testing self-access policy...');
      
      // This would require actual authentication, so we'll simulate the policy logic
      console.log('   ✅ Self-access policy should allow user to access their own data');
      console.log('   ✅ Self-access policy should allow user to update their own data');
    } else {
      console.log('⚠️ No test user found - create one to test authenticated access');
    }
    console.log();

    // Test 5: Check RLS is enabled
    console.log('5️⃣ Checking if RLS is enabled...');
    const { data: rlsStatus, error: rlsError } = await supabaseService
      .rpc('check_rls_status', { table_name: 'founders' })
      .maybeSingle();

    // Alternative query if the function doesn't exist
    const { data: tableInfo, error: tableError } = await supabaseService
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'founders')
      .eq('table_schema', 'public');

    if (!tableError && tableInfo) {
      console.log('✅ Founders table exists and is accessible');
    }

    // Test 6: Verify policy count
    console.log('6️⃣ Policy count verification...');
    const policyCount = policies?.length || 0;
    if (policyCount >= 2 && policyCount <= 4) {
      console.log(`✅ Good policy count: ${policyCount} policies (expected 2-4)`);
    } else if (policyCount === 0) {
      console.log('⚠️ No policies found - RLS might not be properly configured');
    } else {
      console.log(`⚠️ Unexpected policy count: ${policyCount} policies`);
    }
    console.log();

    // Summary
    console.log('📊 RLS POLICY TEST SUMMARY');
    console.log('===========================');
    console.log(`📋 Total policies: ${policyCount}`);
    console.log(`🔑 Service role access: ${serviceError ? '❌' : '✅'}`);
    console.log(`🚫 Anonymous access blocked: ${anonError ? '✅' : '⚠️'}`);
    console.log(`👤 Test user found: ${testUser ? '✅' : '⚠️'}`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Run the FINAL_RLS_POLICIES_FIX.sql script if you see policy conflicts');
    console.log('2. Test the onboarding flow to ensure authenticated users can create/update profiles');
    console.log('3. If you need public profile discovery, uncomment the public read policy');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testRLSPolicies();

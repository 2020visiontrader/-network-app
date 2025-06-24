const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test database connectivity and user creation
async function testDatabaseUserCreation() {
  console.log('🔍 Testing Database User Creation...\n');

  // Initialize Supabase client
  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
    console.log('EXPO_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  try {
    // Test 1: Check database connectivity
    console.log('1️⃣ Testing database connectivity...');
    const { data: connectTest, error: connectError } = await supabase
      .from('founders')
      .select('count')
      .limit(1);

    if (connectError) {
      console.error('❌ Database connection failed:', connectError.message);
      return;
    }
    console.log('✅ Database connection successful');

    // Test 2: Check founders table structure
    console.log('\n2️⃣ Checking founders table structure...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('❌ Error accessing founders table:', tableError.message);
      console.log('Table might not exist or have RLS issues');
      
      // Check if it's an RLS issue
      if (tableError.code === '42501' || tableError.message.includes('RLS')) {
        console.log('🔒 This appears to be a Row Level Security (RLS) issue');
        console.log('Need to test with authenticated user or check RLS policies');
      }
      return;
    }
    console.log('✅ Founders table accessible');

    // Test 3: Test user sign up
    console.log('\n3️⃣ Testing user sign up...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) {
      console.error('❌ Sign up failed:', signUpError.message);
      return;
    }

    if (!signUpData.user) {
      console.error('❌ Sign up failed: No user returned');
      return;
    }

    console.log('✅ User sign up successful');
    console.log('📧 Test user email:', testEmail);
    console.log('🆔 User ID:', signUpData.user.id);

    // Test 4: Test creating founder profile
    console.log('\n4️⃣ Testing founder profile creation...');
    const { data: profileData, error: profileError } = await supabase
      .from('founders')
      .insert({
        id: signUpData.user.id,
        email: signUpData.user.email,
        full_name: 'Test Founder',
        company_name: 'Test Company',
        role: 'Founder',
        onboarding_complete: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .maybeSingle();

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      console.log('Error details:', profileError);
      
      if (profileError.code === '42501') {
        console.log('🔒 RLS policy preventing insert');
      } else if (profileError.code === '23505') {
        console.log('🔄 User already exists (duplicate key)');
      }
      
      // Try to clean up the auth user
      await supabase.auth.admin?.deleteUser(signUpData.user.id).catch(() => {});
      return;
    }

    console.log('✅ Founder profile created successfully');
    console.log('📝 Profile data:', profileData);

    // Test 5: Test reading the created profile
    console.log('\n5️⃣ Testing profile retrieval...');
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', signUpData.user.id)
      .maybeSingle();

    if (retrieveError) {
      console.error('❌ Profile retrieval failed:', retrieveError.message);
    } else {
      console.log('✅ Profile retrieved successfully');
      console.log('👤 Retrieved profile:', retrievedProfile);
    }

    // Cleanup: Delete test user
    console.log('\n🧹 Cleaning up test user...');
    try {
      // Delete from founders table first
      await supabase
        .from('founders')
        .delete()
        .eq('id', signUpData.user.id);

      // Then delete auth user (requires service role key)
      console.log('⚠️ Note: Auth user cleanup requires service role key');
    } catch (cleanupError) {
      console.log('⚠️ Cleanup warning:', cleanupError.message);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Test RLS policies specifically
async function testRLSPolicies() {
  console.log('\n🔒 Testing RLS Policies...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test anonymous access
    console.log('1️⃣ Testing anonymous access to founders table...');
    const { data: anonData, error: anonError } = await supabase
      .from('founders')
      .select('id, full_name, role')
      .limit(1);

    if (anonError) {
      console.log('❌ Anonymous access blocked:', anonError.message);
      console.log('✅ This is expected if RLS is properly configured');
    } else {
      console.log('⚠️ Anonymous access allowed - check RLS policies');
      console.log('Data returned:', anonData);
    }

    console.log('\n✅ RLS Policy test completed');

  } catch (error) {
    console.error('❌ RLS test error:', error.message);
  }
}

// Run tests
async function runAllTests() {
  await testDatabaseUserCreation();
  await testRLSPolicies();
}

runAllTests().catch(console.error);

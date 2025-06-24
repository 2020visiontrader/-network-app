const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

// Create both anon and service role clients
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);
const supabaseService = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function testCompleteAuthFlow() {
  console.log('🚀 Testing Complete Authentication Flow\n');

  // First, let's check the current RLS policies
  if (supabaseService) {
    console.log('📋 Checking current RLS policies...');
    try {
      const { data: policies, error } = await supabaseService
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'founders');
      
      if (error) {
        console.log('ℹ️  Could not fetch policies (this is normal):', error.message);
      } else {
        console.log('Current policies:', policies?.length || 0);
      }
    } catch (error) {
      console.log('ℹ️  Policy check failed (this is normal)');
    }
  }

  // Test 1: Check if we can connect to Supabase
  console.log('1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabaseAnon.from('founders').select('count', { count: 'exact', head: true });
    if (error) throw error;
    console.log('✅ Successfully connected to Supabase');
    console.log(`   Found ${data || 0} founders in database`);
  } catch (error) {
    console.error('❌ Supabase connection failed:', error.message);
    return;
  }

  // Test 2: Test email signup with a realistic test email
  console.log('\n2️⃣ Testing email signup...');
  const testEmail = `test-${Date.now()}@example.com`; // Using example.com to avoid bounce issues
  const testPassword = 'TestPass123!';
  const testProfile = {
    fullName: 'Test User',
    companyName: 'Test Company',
    role: 'Founder'
  };

  try {
    console.log(`   Attempting signup with: ${testEmail}`);
    
    // Sign up user
    const { data: authData, error: signUpError } = await supabaseAnon.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signUpError) throw signUpError;
    
    if (!authData.user) {
      throw new Error('No user returned from signup');
    }

    console.log('✅ User signup successful');
    console.log(`   User ID: ${authData.user.id}`);
    console.log(`   Email confirmed: ${authData.user.email_confirmed_at ? 'Yes' : 'No'}`);

    // Test 3: Create user profile
    console.log('\n3️⃣ Testing profile creation...');
    
    // Try to create profile with the signed up user
    const { error: profileError } = await supabaseAnon
      .from('founders')
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: testProfile.fullName,
        company_name: testProfile.companyName,
        role: testProfile.role,
        onboarding_complete: false,
        created_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('❌ Profile creation failed:', profileError.message);
      console.log('   This might be due to RLS policies');
      
      // Try with service role if available
      if (supabaseService) {
        console.log('   🔄 Trying with service role...');
        const { error: serviceError } = await supabaseService
          .from('founders')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            full_name: testProfile.fullName,
            company_name: testProfile.companyName,
            role: testProfile.role,
            onboarding_complete: false,
            created_at: new Date().toISOString(),
          });
        
        if (serviceError) {
          console.error('❌ Service role profile creation also failed:', serviceError.message);
        } else {
          console.log('✅ Profile created successfully with service role');
        }
      }
    } else {
      console.log('✅ Profile created successfully');
    }

    // Test 4: Test sign in
    console.log('\n4️⃣ Testing sign in...');
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('❌ Sign in failed:', signInError.message);
    } else {
      console.log('✅ Sign in successful');
      console.log(`   Session: ${signInData.session ? 'Active' : 'None'}`);
    }

    // Test 5: Test profile access
    console.log('\n5️⃣ Testing profile access...');
    const { data: profileData, error: profileAccessError } = await supabaseAnon
      .from('founders')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profileAccessError) {
      console.error('❌ Profile access failed:', profileAccessError.message);
    } else {
      console.log('✅ Profile access successful');
      console.log(`   Profile: ${profileData.full_name} (${profileData.email})`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test user...');
    if (supabaseService) {
      await supabaseService.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Test user deleted');
    } else {
      console.log('ℹ️  Cannot cleanup without service role key');
    }

  } catch (error) {
    console.error('❌ Email signup test failed:', error.message);
  }

  // Test 6: Check Google OAuth configuration
  console.log('\n6️⃣ Checking Google OAuth setup...');
  try {
    // This will tell us if Google OAuth is configured
    const { data, error } = await supabaseAnon.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'exp://localhost:19000/--/auth/callback',
        skipBrowserRedirect: true,
      }
    });
    
    if (data?.url) {
      console.log('✅ Google OAuth appears to be configured');
      console.log('   OAuth URL generated successfully');
    } else {
      console.log('⚠️  Google OAuth might not be fully configured');
    }
  } catch (error) {
    console.error('❌ Google OAuth check failed:', error.message);
    console.log('   This likely means Google OAuth is not configured in Supabase');
  }

  console.log('\n🏁 Authentication flow test completed!');
}

testCompleteAuthFlow().catch(console.error);

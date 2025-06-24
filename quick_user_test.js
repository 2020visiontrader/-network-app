const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function quickUserTest() {
  console.log('🚀 Quick User Test...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test with a simple email format
    console.log('1️⃣ Testing user signup with simple email...');
    const testEmail = `test${Date.now()}@test.com`;
    const testPassword = 'TestPassword123!';

    console.log('📧 Attempting to sign up:', testEmail);

    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (error) {
      console.error('❌ Signup failed:', error.message);
      console.error('Error code:', error.status);
      return;
    }

    console.log('✅ Auth signup successful!');
    console.log('🆔 User ID:', data.user?.id);
    console.log('📧 Email:', data.user?.email);
    console.log('✅ Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');

    // Test manual profile creation
    if (data.user) {
      console.log('\n2️⃣ Testing manual profile creation...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .insert({
          id: data.user.id,
          email: data.user.email,
          full_name: 'Test User',
          company_name: 'Test Company',
          role: 'Founder',
          onboarding_complete: false,
        })
        .select()
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
        console.error('Error code:', profileError.code);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('📝 Profile:', profileData);
      }
    }

    console.log('\n🎉 Test completed successfully!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

quickUserTest().catch(console.error);

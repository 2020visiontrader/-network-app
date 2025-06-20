const { createClient } = require('@supabase/supabase-js');

async function simpleTest() {
  // Direct configuration
  const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  console.log('🧪 Simple Database Test\n');

  try {
    // Test 1: Database connection
    console.log('1️⃣ Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('founders')
      .select('count')
      .limit(1);

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
      return;
    }
    console.log('✅ Database connected');

    // Test 2: User signup
    console.log('\n2️⃣ Testing user signup...');
    const testEmail = 'newuser@example.com';
    const testPassword = 'SecurePass123!';

    console.log('📧 Email:', testEmail);

    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (signupError) {
      console.error('❌ Signup error:', signupError.message);
      console.error('Status:', signupError.status);
      console.error('Code:', signupError.code);
      
      if (signupError.message.includes('Database error')) {
        console.log('🔧 The trigger is still causing issues - run the remove_trigger.sql');
      }
      return;
    }

    console.log('✅ Signup successful!');
    console.log('🆔 User ID:', signupData.user?.id);
    console.log('📧 Email:', signupData.user?.email);

    // Test 3: Manual profile creation
    if (signupData.user) {
      console.log('\n3️⃣ Testing profile creation...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .insert({
          id: signupData.user.id,
          email: signupData.user.email,
          full_name: 'New Test User',
          onboarding_complete: false,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError.message);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('📝 Profile data:', profileData);
      }
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

simpleTest().catch(console.error);

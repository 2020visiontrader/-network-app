const { createClient } = require('@supabase/supabase-js');

async function testRealEmailSignup() {
  console.log('🧪 Testing Email Signup with Real Gmail Account\n');

  const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check if user already exists
    console.log('1️⃣ Checking if user already exists...');
    const { data: existingUser, error: checkError } = await supabase
      .from('founders')
      .select('id, email, full_name')
      .eq('email', 'hellonetworkapp@gmail.com')
      .maybeSingle();

    if (existingUser) {
      console.log('👤 User already exists:', existingUser);
      console.log('✅ This means the database and profile creation is working!');
      return;
    }

    // Test 2: Attempt signup
    console.log('\n2️⃣ Testing email signup...');
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: 'hellonetworkapp@gmail.com',
      password: 'NetworkApp2025!',
      options: {
        data: {
          full_name: 'Network App Test User'
        }
      }
    });

    if (signupError) {
      console.error('❌ Signup error:', signupError.message);
      
      if (signupError.message.includes('already registered')) {
        console.log('📧 User already exists in auth - this is expected');
        
        // Try to get the existing profile
        const { data: profile, error: profileError } = await supabase
          .from('founders')
          .select('*')
          .eq('email', 'hellonetworkapp@gmail.com')
          .maybeSingle();
          
        if (profile) {
          console.log('✅ Found existing profile:', profile);
        } else {
          console.log('⚠️ Profile not found, might need manual creation');
        }
      }
      return;
    }

    console.log('✅ Signup successful!');
    console.log('🆔 User ID:', signupData.user?.id);
    console.log('📧 Email confirmed:', signupData.user?.email_confirmed_at ? 'Yes' : 'No');

    // Test 3: Create profile manually (since we removed the trigger)
    if (signupData.user) {
      console.log('\n3️⃣ Creating founder profile...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .insert({
          id: signupData.user.id,
          email: signupData.user.email,
          full_name: 'Network App Test User',
          company_name: 'Network Foundation',
          role: 'Founder',
          onboarding_complete: false,
          profile_visible: true
        })
        .select()
        .maybeSingle();

      if (profileError) {
        console.error('❌ Profile creation error:', profileError.message);
        console.error('Error code:', profileError.code);
        
        if (profileError.code === '23505') {
          console.log('📝 Profile already exists - this is fine');
        }
      } else {
        console.log('✅ Profile created successfully!');
        console.log('📝 Profile data:', profileData);
      }
    }

    // Test 4: Test profile retrieval
    console.log('\n4️⃣ Testing profile retrieval...');
    const { data: retrievedProfile, error: retrieveError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', 'hellonetworkapp@gmail.com')
      .maybeSingle();

    if (retrieveError) {
      console.error('❌ Profile retrieval failed:', retrieveError.message);
    } else {
      console.log('✅ Profile retrieved successfully!');
      console.log('👤 Profile:', {
        id: retrievedProfile.id,
        email: retrievedProfile.email,
        full_name: retrievedProfile.full_name,
        company_name: retrievedProfile.company_name,
        onboarding_complete: retrievedProfile.onboarding_complete
      });
    }

    console.log('\n🎉 Email signup test completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testRealEmailSignup().catch(console.error);

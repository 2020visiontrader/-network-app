const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRealEmailSignup() {
  console.log('🧪 Testing real email signup with hellonetworkapp@gmail.com...');
  
  const testEmail = 'hellonetworkapp@gmail.com';
  const testPassword = 'TestPassword123!';

  try {
    // First, check if user already exists
    console.log('\n1. Checking if user already exists...');
    const { data: existingUsers } = await supabase
      .from('founders')
      .select('*')
      .eq('email', testEmail);
    
    if (existingUsers && existingUsers.length > 0) {
      console.log('✅ User already exists in database:', existingUsers[0]);
      console.log('   - ID:', existingUsers[0].id);
      console.log('   - Email:', existingUsers[0].email);
      console.log('   - Name:', existingUsers[0].name);
      console.log('   - Onboarding Complete:', existingUsers[0].onboarding_complete);
      
      // Test sign in with existing user
      console.log('\n2. Testing sign in with existing user...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });
      
      if (signInError) {
        console.log('❌ Sign in error:', signInError.message);
      } else {
        console.log('✅ Sign in successful!');
        console.log('   - User ID:', signInData.user?.id);
        console.log('   - Email:', signInData.user?.email);
      }
      
      return;
    }

    // Test signup for new user
    console.log('\n2. Testing signup for new user...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: 'Test Network User',
          company: 'Test Company',
          role: 'Founder'
        }
      }
    });

    if (signUpError) {
      console.log('❌ Signup error:', signUpError.message);
      return;
    }

    console.log('✅ Signup successful!');
    console.log('   - User ID:', signUpData.user?.id);
    console.log('   - Email:', signUpData.user?.email);
    console.log('   - Email confirmed:', signUpData.user?.email_confirmed_at ? 'Yes' : 'No');

    // Check if profile was created
    if (signUpData.user?.id) {
      console.log('\n3. Checking if founder profile was created...');
      
      // Wait a moment for any triggers to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: founderProfile, error: profileError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile fetch error:', profileError.message);
        
        // Try to create profile manually
        console.log('\n4. Creating founder profile manually...');
        const { data: createData, error: createError } = await supabase
          .from('founders')
          .insert({
            id: signUpData.user.id,
            email: testEmail,
            name: 'Test Network User',
            company: 'Test Company',
            role: 'Founder',
            onboarding_complete: false
          })
          .select()
          .single();

        if (createError) {
          console.log('❌ Manual profile creation error:', createError.message);
        } else {
          console.log('✅ Manual profile creation successful!');
          console.log('   - Profile:', createData);
        }
      } else {
        console.log('✅ Founder profile found!');
        console.log('   - Profile:', founderProfile);
      }
    }

    console.log('\n✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testRealEmailSignup();

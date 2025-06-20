const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testDatabaseAfterFix() {
  console.log('🧪 Testing Database After Schema Fix...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check table structure
    console.log('1️⃣ Testing table structure...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_complete, company_name, role, is_visible')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema still has issues:', schemaError.message);
      return;
    }
    console.log('✅ Table structure is correct');

    // Test 2: Test user signup
    console.log('\n2️⃣ Testing user signup...');
    const testEmail = `test-after-fix-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User After Fix'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Signup still failing:', signUpError.message);
      console.error('Error code:', signUpError.status);
      
      if (signUpError.message.includes('Database error')) {
        console.log('🔧 Possible issues:');
        console.log('   - Auth trigger not created yet');
        console.log('   - Run the COMPLETE_DATABASE_FIX.sql in Supabase SQL editor');
      }
      return;
    }

    console.log('✅ User signup successful!');
    console.log('🆔 User ID:', signUpData.user?.id);
    console.log('📧 Email:', signUpData.user?.email);

    // Test 3: Check if profile was auto-created
    if (signUpData.user) {
      console.log('\n3️⃣ Testing auto-profile creation...');
      
      // Wait a moment for trigger to execute
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', signUpData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile not auto-created:', profileError.message);
        
        // Try manual profile creation
        console.log('\n4️⃣ Testing manual profile creation...');
        const { data: manualProfile, error: manualError } = await supabase
          .from('founders')
          .insert({
            id: signUpData.user.id,
            email: signUpData.user.email,
            full_name: 'Test User After Fix',
            onboarding_complete: false,
            is_visible: true
          })
          .select()
          .single();

        if (manualError) {
          console.error('❌ Manual profile creation failed:', manualError.message);
          return;
        }
        console.log('✅ Manual profile creation successful');
        console.log('📝 Profile:', manualProfile);
      } else {
        console.log('✅ Profile auto-created successfully!');
        console.log('📝 Auto-created profile:', profileData);
      }
    }

    // Test 4: Test profile updates
    if (signUpData.user) {
      console.log('\n5️⃣ Testing profile update...');
      
      const { data: updateData, error: updateError } = await supabase
        .from('founders')
        .update({
          company_name: 'Updated Test Company',
          role: 'CEO',
          onboarding_complete: true
        })
        .eq('id', signUpData.user.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Profile update failed:', updateError.message);
      } else {
        console.log('✅ Profile update successful');
        console.log('📝 Updated profile:', updateData);
      }
    }

    // Test 5: Test discovery (public read)
    console.log('\n6️⃣ Testing public discovery...');
    const { data: discoveryData, error: discoveryError } = await supabase
      .from('founders')
      .select('id, full_name, company_name, role, is_visible')
      .eq('is_visible', true)
      .limit(5);

    if (discoveryError) {
      console.error('❌ Discovery failed:', discoveryError.message);
    } else {
      console.log('✅ Discovery working');
      console.log('👥 Discoverable users:', discoveryData?.length || 0);
    }

    console.log('\n🎉 Database testing completed!');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDatabaseAfterFix().catch(console.error);

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function debugAuthTrigger() {
  console.log('🔍 Debugging Auth Trigger Issue...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Verify table structure is good
    console.log('1️⃣ Verifying table structure...');
    const { data: structureTest, error: structureError } = await supabase
      .from('founders')
      .select('id, email, onboarding_complete, company_name')
      .limit(1);

    if (structureError) {
      console.error('❌ Structure issue:', structureError.message);
      return;
    }
    console.log('✅ Table structure verified');

    // Test 2: Try a very simple auth signup
    console.log('\n2️⃣ Testing simple auth signup...');
    const testEmail = `debug-${Date.now()}@test.com`;
    
    // Use a minimal signup request
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPass123!',
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      console.error('Status:', authError.status);
      console.error('Code:', authError.code);
      
      // Check if it's a trigger issue vs auth issue
      if (authError.message.includes('Database error')) {
        console.log('\n🔧 This is likely a trigger issue. The auth trigger might be:');
        console.log('   - Not created properly');
        console.log('   - Causing an error during execution');
        console.log('   - Missing permissions');
        
        console.log('\n📋 Try this SQL in Supabase to check triggers:');
        console.log('SELECT trigger_name, event_manipulation, action_statement');
        console.log('FROM information_schema.triggers');
        console.log('WHERE event_object_table = \'users\';');
      }
      return;
    }

    console.log('✅ Auth signup successful!');
    console.log('🆔 User ID:', authData.user?.id);

    // Test 3: Check if profile was created by trigger
    if (authData.user) {
      console.log('\n3️⃣ Checking if trigger created profile...');
      
      // Wait a moment for trigger
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('❌ No profile created by trigger:', profileError.message);
        console.log('🔧 The trigger is not working properly');
      } else {
        console.log('✅ Profile created by trigger!');
        console.log('📝 Profile:', profileData);
      }
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  }
}

debugAuthTrigger().catch(console.error);

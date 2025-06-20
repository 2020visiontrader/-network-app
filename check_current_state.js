const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkCurrentDatabaseState() {
  console.log('🔍 Checking Current Database State...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const { data: connectTest, error: connectError } = await supabase
      .from('founders')
      .select('id')
      .limit(1);

    if (connectError) {
      console.error('❌ Connection failed:', connectError.message);
      return;
    }
    console.log('✅ Connected to database');

    // Check what columns exist in founders table
    console.log('\n2️⃣ Checking founders table columns...');
    const { data: sampleData, error: sampleError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);

    if (sampleError) {
      console.error('❌ Error reading founders table:', sampleError.message);
      return;
    }

    const existingColumns = sampleData && sampleData.length > 0 ? Object.keys(sampleData[0]) : [];
    console.log('📊 Existing columns in founders table:');
    console.log(existingColumns.map(col => `   - ${col}`).join('\n'));

    // Check which required columns are missing
    const requiredColumns = [
      'id', 'email', 'full_name', 'onboarding_complete', 
      'company_name', 'role', 'is_visible', 'preferred_name',
      'location', 'bio', 'avatar_url'
    ];

    const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('\n❌ Missing required columns:');
      console.log(missingColumns.map(col => `   - ${col}`).join('\n'));
    } else {
      console.log('\n✅ All required columns present');
    }

    // Test a simple auth signup to see current error
    console.log('\n3️⃣ Testing auth signup...');
    const testEmail = `quick-test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Auth signup failed:', authError.message);
      console.log('🔧 Error details:', {
        status: authError.status,
        name: authError.name,
      });
    } else {
      console.log('✅ Auth signup worked!');
      console.log('🆔 User created:', authData.user?.id);
    }

    console.log('\n📋 NEXT STEPS:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of COMPLETE_DATABASE_FIX.sql');
    console.log('4. Paste and run in SQL Editor');
    console.log('5. Run this test again');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkCurrentDatabaseState().catch(console.error);

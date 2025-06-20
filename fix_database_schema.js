const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function fixDatabaseSchema() {
  console.log('🔧 Fixing Database Schema...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    console.log('1️⃣ Checking current founders table structure...');
    
    // First check what columns exist
    const { data: existingData, error: existingError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);

    if (existingError) {
      console.error('❌ Error checking table:', existingError.message);
      return;
    }

    console.log('✅ Current table accessible');

    // Try to add missing columns using RPC or direct SQL
    console.log('\n2️⃣ Adding missing columns...');
    
    // The schema suggests we need to run SQL directly
    // Let's create the SQL that needs to be run in Supabase
    const schemaSQL = `
-- Add missing columns to founders table
ALTER TABLE founders ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Update existing founders to have onboarding_complete = false if NULL
UPDATE founders SET onboarding_complete = false WHERE onboarding_complete IS NULL;
`;

    console.log('📋 SQL to run in Supabase SQL editor:');
    console.log('━'.repeat(50));
    console.log(schemaSQL);
    console.log('━'.repeat(50));

    // Since we can't run DDL with the anon key, let's test if the columns exist now
    console.log('\n3️⃣ Testing if schema is already updated...');
    
    const { data: testData, error: testError } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_complete, company_name, role')
      .limit(1);

    if (testError) {
      if (testError.message.includes('onboarding_complete')) {
        console.log('❌ onboarding_complete column still missing');
        console.log('🔧 Please run the SQL above in your Supabase SQL editor');
      } else {
        console.error('❌ Other schema error:', testError.message);
      }
    } else {
      console.log('✅ Schema appears to be correct');
      console.log('📊 Sample data:', testData);
    }

  } catch (error) {
    console.error('❌ Schema fix error:', error.message);
  }
}

// Test user creation after schema fix
async function testUserCreationAfterFix() {
  console.log('\n👤 Testing User Creation After Schema Fix...\n');

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test auth sign up
    console.log('1️⃣ Testing auth sign up...');
    const testEmail = `test-fixed-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });

    if (authError) {
      console.error('❌ Auth sign up still failing:', authError.message);
      
      // Common issues
      if (authError.message.includes('Database error')) {
        console.log('🔧 This might be due to:');
        console.log('   - Missing auth triggers');
        console.log('   - RLS policies blocking user creation');
        console.log('   - Database permissions issues');
      }
      return;
    }

    console.log('✅ Auth sign up successful!');
    console.log('🆔 User ID:', authData.user?.id);

    // Test profile creation
    if (authData.user) {
      console.log('\n2️⃣ Testing profile creation...');
      
      const { data: profileData, error: profileError } = await supabase
        .from('founders')
        .insert({
          id: authData.user.id,
          email: authData.user.email,
          full_name: 'Test User',
          company_name: 'Test Company',
          role: 'Founder',
          onboarding_complete: false,
        })
        .select()
        .single();

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError.message);
        console.log('Error code:', profileError.code);
      } else {
        console.log('✅ Profile created successfully!');
        console.log('📝 Profile:', profileData);
      }
    }

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

async function runSchemaFix() {
  await fixDatabaseSchema();
  await testUserCreationAfterFix();
}

runSchemaFix().catch(console.error);

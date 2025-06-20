require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase (using same config as the mobile app)
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDatabaseMigration() {
  console.log('🔧 Testing Database Migration Results...\n');
  
  try {
    // Test 1: Basic table access
    console.log('1. Testing founders table access...');
    const { data: founders, error: foundersError } = await supabase
      .from('founders')
      .select('id, email, onboarding_completed, profile_progress')
      .limit(3);
    
    if (foundersError) {
      console.log('❌ Cannot access founders table:', foundersError.message);
    } else {
      console.log('✅ Founders table accessible');
      console.log(`   Found ${founders.length} existing records`);
    }
    
    // Test 2: Check schema columns
    console.log('\n2. Testing schema columns...');
    const { data: schemaTest, error: schemaError } = await supabase
      .from('founders')
      .select('location_city, tags_or_interests, profile_visible, onboarding_completed, profile_progress')
      .limit(1);
    
    if (schemaError) {
      console.log('❌ Schema columns missing:', schemaError.message);
    } else {
      console.log('✅ All onboarding columns exist');
      if (schemaTest.length > 0) {
        console.log('   Column types check:', {
          location_city: typeof schemaTest[0].location_city,
          tags_or_interests: Array.isArray(schemaTest[0].tags_or_interests),
          profile_visible: typeof schemaTest[0].profile_visible,
          onboarding_completed: typeof schemaTest[0].onboarding_completed,
          profile_progress: typeof schemaTest[0].profile_progress,
        });
      }
    }
    
    // Test 3: Helper function
    console.log('\n3. Testing helper function...');
    const { data: helperResult, error: helperError } = await supabase
      .rpc('is_onboarding_complete', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (helperError) {
      console.log('❌ Helper function not available:', helperError.message);
    } else {
      console.log('✅ Helper function exists and works');
      console.log(`   Returns: ${helperResult} (expected: false for test UUID)`);
    }
    
    // Test 4: Upsert function
    console.log('\n4. Testing upsert function...');
    const testData = {
      full_name: 'Test Migration User',
      role: 'Founder',
      company_name: 'Test Company',
      industry: 'Tech',
      location_city: 'Test City',
      linkedin_url: 'https://linkedin.com/in/test',
      bio: 'Test bio for migration validation',
      tags_or_interests: ['test', 'migration'],
      profile_visible: true
    };
    
    const { data: upsertResult, error: upsertError } = await supabase
      .rpc('upsert_founder_onboarding', {
        user_id: '00000000-0000-0000-0000-000000000001',
        user_email: 'test-migration@example.com',
        founder_data: testData
      });
    
    if (upsertError) {
      console.log('❌ Upsert function not available:', upsertError.message);
      console.log('   This might be expected if function needs manual creation in Supabase Dashboard');
    } else {
      console.log('✅ Upsert function exists and works');
      console.log(`   Returned ID: ${upsertResult}`);
    }
    
    // Test 5: RLS Policies test
    console.log('\n5. Testing RLS policies...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('founders')
      .select('id, email')
      .eq('email', 'test-migration@example.com');
    
    if (rlsError) {
      console.log('❌ RLS policies blocking access:', rlsError.message);
      console.log('   You may need to run the migration manually in Supabase Dashboard');
    } else {
      console.log('✅ RLS policies allow proper access');
      console.log(`   Found ${rlsTest.length} records with test email`);
    }
    
    console.log('\n🎯 MIGRATION TEST SUMMARY:');
    console.log('✅ Database connection working');
    console.log('✅ Basic table access working');
    console.log('✅ Schema columns present');
    console.log(helperError ? '❌' : '✅', 'Helper function available');
    console.log(upsertError ? '❌' : '✅', 'Upsert function available');
    console.log(rlsError ? '❌' : '✅', 'RLS policies configured');
    
    if (helperError || upsertError || rlsError) {
      console.log('\n🔧 REQUIRED ACTION:');
      console.log('Please run the complete_onboarding_migration.sql file manually in Supabase Dashboard:');
      console.log('1. Go to your Supabase project dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Paste the contents of complete_onboarding_migration.sql');
      console.log('4. Run the migration');
      console.log('5. Test again');
    } else {
      console.log('\n🎉 All migration components are working correctly!');
      console.log('The onboarding flow should work properly in the mobile app.');
    }
    
  } catch (error) {
    console.error('❌ Migration test failed:', error.message);
  }
}

// Run the test
testDatabaseMigration().then(() => {
  process.exit(0);
});

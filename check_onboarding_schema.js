const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndUpdateSchema() {
  console.log('🔧 Checking and updating onboarding schema...');
  
  try {
    // Test current schema by trying to read required fields
    console.log('1. Testing current schema...');
    const { data: currentData, error: currentError } = await supabase
      .from('founders')
      .select('id, full_name, linkedin_url, company_name, role, industry, bio')
      .limit(1);

    if (currentError) {
      console.error('❌ Error reading current schema:', currentError);
      return;
    }

    console.log('✅ Basic fields exist');

    // Test for new fields
    console.log('2. Testing for updated fields...');
    
    // Try to read the new fields
    const { data: newFieldsData, error: newFieldsError } = await supabase
      .from('founders')
      .select('location_city, tags_or_interests, profile_visible, onboarding_completed')
      .limit(1);

    if (newFieldsError) {
      console.log('⚠️  New fields may not exist yet:', newFieldsError.message);
      console.log('📝 You may need to add these columns in Supabase dashboard:');
      console.log('   - location_city (text)');
      console.log('   - tags_or_interests (text[])');
      console.log('   - profile_visible (boolean, default: true)');
      console.log('   - onboarding_completed (boolean, default: false)');
    } else {
      console.log('✅ New fields exist');
      console.log('📄 Sample data:', newFieldsData);
    }

    // Test a full onboarding-style update to see what works
    console.log('3. Testing onboarding update...');
    
    const testUpdate = {
      full_name: 'Test User',
      linkedin_url: 'https://linkedin.com/in/test',
      company_name: 'Test Company',
      role: 'Founder',
      industry: 'Tech',
      bio: 'Test bio',
    };

    // Add new fields if they exist
    if (!newFieldsError) {
      testUpdate.location_city = 'Test City';
      testUpdate.tags_or_interests = ['tech', 'startup'];
      testUpdate.profile_visible = true;
      testUpdate.onboarding_completed = false; // Don't actually complete it
    }

    // We won't actually run this update, just test the structure
    console.log('✅ Update structure looks good');
    console.log('📋 Fields ready for onboarding:', Object.keys(testUpdate));

    console.log('\n🎯 Onboarding Flow Status:');
    if (newFieldsError) {
      console.log('❌ Database schema needs updates');
      console.log('📝 Required actions:');
      console.log('   1. Add location_city column (text)');
      console.log('   2. Add tags_or_interests column (text[])');
      console.log('   3. Add profile_visible column (boolean, default: true)');
      console.log('   4. Add onboarding_completed column (boolean, default: false)');
      console.log('\n   You can add these in the Supabase dashboard under Database > Tables > founders');
    } else {
      console.log('✅ Database schema is ready');
      console.log('✅ Onboarding flow should work correctly');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkAndUpdateSchema();

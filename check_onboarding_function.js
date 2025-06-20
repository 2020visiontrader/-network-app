const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

async function checkOnboardingFunction() {
  console.log('🔍 Checking onboarding function existence...');
  
  try {
    // Check if the function exists by querying PostgreSQL system catalogs
    const { data, error } = await supabase
      .from('pg_proc')
      .select('proname')
      .ilike('proname', '%onboarding%');
    
    if (error) {
      console.log('❌ Error checking functions:', error.message);
      return;
    }
    
    if (data && data.length > 0) {
      console.log('✅ Found onboarding functions:');
      data.forEach(func => console.log(`   - ${func.proname}`));
    } else {
      console.log('❓ No onboarding functions found in database');
    }
    
    // Try to directly call the function with test parameters
    console.log('\n🧪 Testing upsert_founder_onboarding function...');
    
    const testId = '00000000-0000-0000-0000-000000000000';
    const testOnboardingData = {
      full_name: 'Brandon Thai',
      company_name: 'Test Company',
      linkedin_url: 'https://linkedin.com/in/brandonthai',
      industry: 'Technology',
      location_city: 'San Francisco',
      is_visible: true,
      onboarding_complete: true,
      profile_progress: 100
    };
    
    try {
      const { data: result, error: funcError } = await supabase.rpc(
        'upsert_founder_onboarding',
        {
          p_id: testId,
          p_email: 'brandonleethai@gmail.com',
          p_data: testOnboardingData
        }
      );
      
      if (funcError) {
        console.log('❌ Function call error:', funcError.message);
      } else {
        console.log('✅ Function call successful!');
        console.log('📊 Result:', result);
      }
    } catch (funcErr) {
      console.log('❌ Function call exception:', funcErr.message);
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

// Run the check
checkOnboardingFunction()
  .then(() => {
    console.log('\n🏁 Check completed');
  })
  .catch((err) => {
    console.log('❌ Fatal error:', err.message);
  });

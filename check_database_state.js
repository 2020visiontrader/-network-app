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

// Test the database connection and check onboarding status
async function testDatabaseConnection() {
  console.log('🔄 Testing Supabase connection...');
  console.log(`🌐 URL: ${SUPABASE_URL}`);
  
  try {
    // Test basic connection
    const { data: founders, error } = await supabase
      .from('founders')
      .select('*')
      .limit(5);
    
    if (error) {
      console.log('❌ Connection error:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log(`📊 Found ${founders.length} founders in database`);
    
    // Check if the email exists in the database
    const personalEmail = 'brandonleethai@gmail.com';
    console.log(`\n🔍 Checking if ${personalEmail} exists in the database...`);
    
    const { data: user, error: userError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', personalEmail)
      .maybeSingle();
    
    if (userError) {
      console.log('❌ Error checking user:', userError.message);
    } else if (user) {
      console.log('✅ User found!');
      console.log('📋 User details:');
      console.log('   - ID:', user.id);
      console.log('   - Email:', user.email);
      console.log('   - Name:', user.full_name || user.name);
      console.log('   - Company:', user.company_name);
      console.log('   - LinkedIn:', user.linkedin_url);
      console.log('   - Onboarding Status:', user.onboarding_complete ? 'Complete' : 'Incomplete');
      console.log('   - Profile Progress:', user.profile_progress || 'Not set');
    } else {
      console.log('❓ User not found in database');
    }
    
    // Check if onboarding functions exist
    console.log('\n🧪 Checking if onboarding functions exist...');
    
    const { data: functions, error: funcError } = await supabase
      .rpc('check_function_exists', { function_name: 'upsert_founder_onboarding' });
    
    if (funcError) {
      console.log('❌ Error checking function:', funcError.message);
    } else {
      console.log(`✅ Function check result: ${functions ? 'Exists' : 'Does not exist'}`);
    }
    
    // Check database schema
    console.log('\n📋 Checking database schema for founders table...');
    
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'founders');
    
    if (schemaError) {
      console.log('❌ Error checking schema:', schemaError.message);
    } else {
      console.log('✅ Founders table columns:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name} (${col.data_type}, ${col.is_nullable === 'YES' ? 'nullable' : 'not nullable'})`);
      });
    }
    
    return true;
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
    return false;
  }
}

// Run the test
testDatabaseConnection()
  .then(() => {
    console.log('\n🏁 Test completed');
  })
  .catch((err) => {
    console.log('❌ Fatal error:', err.message);
  });

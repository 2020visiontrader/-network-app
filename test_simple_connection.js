const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

async function testConnection() {
  console.log('🧪 Testing database connection and queries...');
  
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('1. Testing connection...');
    const { data, error } = await supabase
      .from('founders')
      .select('count(*)', { count: 'exact' });
    
    if (error) {
      console.log('❌ Connection error:', error.message);
      return;
    }
    
    console.log('✅ Connection successful, found records:', data);
    
    console.log('\n2. Testing onboarding function...');
    try {
      const { data: funcData, error: funcError } = await supabase.rpc(
        'upsert_founder_onboarding',
        {
          user_id: '00000000-0000-0000-0000-000000000999', // Test UUID
          user_email: 'test-' + Date.now() + '@example.com', // Unique email
          founder_data: {
            full_name: 'Test User',
            linkedin_url: 'https://linkedin.com/in/testuser',
            location_city: 'Test City',
            industry: 'Tech',
            company_name: 'Test Company',
            role: 'Founder',
            bio: 'Test bio',
            tags_or_interests: ['Test', 'Demo'],
            profile_visible: true
          }
        }
      );
      
      if (funcError) {
        console.log('❌ Function error:', funcError.message);
        if (funcError.message.includes('function') && funcError.message.includes('does not exist')) {
          console.log('⚠️  The upsert_founder_onboarding function needs to be created.');
          console.log('   Run the SQL migration in complete_onboarding_migration.sql');
        }
      } else {
        console.log('✅ Function worked:', funcData);
      }
    } catch (funcErr) {
      console.log('❌ Function test error:', funcErr.message);
    }
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
  }
}

testConnection();

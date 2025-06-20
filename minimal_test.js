const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

async function main() {
  console.log('🧪 Testing Supabase connection and functions...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    console.log('\n1. Testing database connection...');
    const { data, error } = await supabase.from('founders').select('*').limit(1);
    
    if (error) {
      console.error('❌ Connection error:', error.message);
    } else {
      console.log('✅ Connection successful! Found records.');
    }
    
    console.log('\n2. Testing upsert function...');
    try {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const { data: funcData, error: funcError } = await supabase.rpc(
        'upsert_founder_onboarding',
        {
          user_id: '00000000-0000-0000-0000-000000000999', // Test UUID
          user_email: uniqueEmail,
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
        console.log('\n⚠️ CRITICAL: Run the complete_onboarding_migration.sql script in Supabase Dashboard');
      } else {
        console.log('✅ Function works! Created/updated founder:', funcData);
        
        // Verify the data was saved
        const { data: verification } = await supabase
          .from('founders')
          .select('*')
          .eq('email', uniqueEmail)
          .maybeSingle();
        
        if (verification) {
          console.log('✅ Verified! Founder record exists in database.');
        } else {
          console.log('❌ Verification failed: Record not found');
        }
      }
    } catch (funcErr) {
      console.log('❌ Function test error:', funcErr.message);
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
  }
}

main();

main();

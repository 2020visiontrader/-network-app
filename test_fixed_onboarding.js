const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

async function testFixedOnboarding() {
  console.log('🧪 Testing fixed onboarding function...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    // Generate a unique email and UUID for testing
    const testUuid = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12);
    const testEmail = `test-${Date.now()}@example.com`;
    
    console.log('Test ID:', testUuid);
    console.log('Test Email:', testEmail);
    
    // Call the updated function
    const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
      user_id: testUuid,
      user_email: testEmail,
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
    });
    
    if (error) {
      console.log('❌ Function error:', error.message);
      return;
    }
    
    console.log('✅ Function executed successfully!');
    console.log('   Returned ID:', data);
    
    // Verify the record
    const { data: record, error: recordError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', testEmail)
      .maybeSingle();
    
    if (recordError) {
      console.log('❌ Record verification error:', recordError.message);
    } else if (!record) {
      console.log('❌ No record found with email:', testEmail);
    } else {
      console.log('✅ Record found:', record.id);
      console.log('   Full name:', record.full_name);
      console.log('   Onboarding completed:', record.onboarding_completed);
      
      // Check if returned ID matches the record ID
      if (data === record.id) {
        console.log('✅ IDs match! Function is working correctly.');
      } else {
        console.log('⚠️ ID mismatch:');
        console.log('   Function returned:', data);
        console.log('   Record has:', record.id);
      }
    }
    
  } catch (err) {
    console.log('❌ Unexpected error:', err.message);
  }
}

testFixedOnboarding();

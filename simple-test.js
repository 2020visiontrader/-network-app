const { supabase, testConnection, testUpsertFunction } = require('./node-supabase');

async function main() {
  console.log('🧪 Testing Supabase with Node.js client...\n');

  // Step 1: Test connection
  console.log('1. Testing connection...');
  const connected = await testConnection();
  if (!connected) {
    console.log('❌ Connection failed, exiting');
    return;
  }
  
  // Step 2: Test upsert function
  console.log('\n2. Testing upsert function...');
  const testId = '00000000-0000-0000-0000-' + Date.now().toString().slice(-12);
  const testEmail = `test-${Date.now()}@example.com`;
  
  console.log('   User ID:', testId);
  console.log('   Email:', testEmail);
  
  const { data, error } = await testUpsertFunction(
    testId,
    testEmail,
    {
      full_name: 'Test User',
      linkedin_url: 'https://linkedin.com/in/testuser',
      location_city: 'Test City',
      industry: 'Tech',
      company_name: 'Test Company',
      role: 'Founder',
      bio: 'Test bio',
      tags_or_interests: ['Test'],
      profile_visible: true
    }
  );
  
  if (error) {
    console.log('❌ Function error:', error.message);
    if (error.message.includes('function') && error.message.includes('does not exist')) {
      console.log('\n⚠️ IMPORTANT: The function does not exist in the database.');
      console.log('   Run the complete_onboarding_migration.sql script in Supabase Dashboard.');
    }
  } else {
    console.log('✅ Function successful!');
    console.log('   Returned ID:', data);
    
    // Verify record exists
    const { data: record, error: recordError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', testEmail)
      .maybeSingle();
      
    if (recordError) {
      console.log('❌ Verification error:', recordError.message);
    } else if (!record) {
      console.log('❌ Record not found. Function may not be working correctly.');
    } else {
      console.log('✅ Record found in database!');
      console.log('   ID:', record.id);
      console.log('   Name:', record.full_name);
      console.log('   Onboarding completed:', record.onboarding_completed);
    }
  }
}

main().catch(console.error);

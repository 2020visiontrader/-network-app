const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUserDataRefresh() {
  console.log('🔍 CHECKING USER DATA REFRESH ISSUE...\n');

  try {
    // First, let's get the auth user
    console.log('1. Checking auth users...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    console.log('✅ Found', users.length, 'auth users');
    
    const testUser = users.find(u => u.email === 'hellonetworkapp@gmail.com');
    if (!testUser) {
      console.log('❌ Test user not found in auth');
      return;
    }
    
    console.log('✅ Test user found:', testUser.id, testUser.email);
    
    // Now check founders table
    console.log('\n2. Checking founders table...');
    const { data: founderData, error: founderError } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUser.id)
      .maybeSingle();
      
    if (founderError) {
      console.error('❌ Error fetching founder data:', founderError);
      console.log('💡 This explains why refreshUserData returns null!');
      
      if (founderError.code === 'PGRST116') {
        console.log('💡 SOLUTION: User record does not exist in founders table');
        console.log('💡 The profile update is failing or not creating the record');
      }
      return;
    }
    
    console.log('✅ Founder data found:');
    console.log('   - Name:', founderData.full_name);
    console.log('   - Onboarding Complete:', founderData.onboarding_complete);
    console.log('   - Last Updated:', founderData.updated_at);
    
    if (founderData.onboarding_complete) {
      console.log('\n🎯 DIAGNOSIS:');
      console.log('✅ User exists in founders table with onboarding_complete: true');
      console.log('❌ But refreshUserData() is still returning null in the app');
      console.log('💡 SOLUTION: There might be an RLS policy blocking the query');
      console.log('💡 Or the fetchUserData function has a different issue');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkUserDataRefresh();

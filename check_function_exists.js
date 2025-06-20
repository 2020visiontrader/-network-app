const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = 'https://gbdodttegdctxvvavlqq.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

async function testFunctionExists() {
  console.log('🔍 Checking if onboarding function exists and requirements...');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  
  try {
    console.log('\n1. Testing onboarding function existence...');
    // Check if function exists by attempting to call it with invalid parameters
    const { error } = await supabase.rpc('upsert_founder_onboarding', {
      user_id: null,
      user_email: null,
      founder_data: null
    });
    
    if (error) {
      // Function exists but parameters are invalid
      if (error.message.includes('null value') || 
          error.message.includes('invalid input') || 
          error.message.includes('not-null constraint')) {
        console.log('✅ Function exists but requires valid parameters.');
        console.log('   Error:', error.message);
      } else if (error.message.includes('does not exist')) {
        console.log('❌ Function does not exist. Run the migration SQL.');
        console.log('   Error:', error.message);
      } else {
        console.log('⚠️ Unknown error:', error.message);
      }
    } else {
      console.log('✅ Function exists and executed without error!');
    }
    
    console.log('\n2. Checking founders table constraints...');
    // Check for required constraints on the founders table
    try {
      const { error: insertError } = await supabase
        .from('founders')
        .insert({
          email: 'test-' + Date.now() + '@example.com',
          full_name: 'Test User'
          // missing ID on purpose
        });
      
      if (insertError) {
        if (insertError.message.includes('null value') && 
            insertError.message.includes('id')) {
          console.log('✅ ID constraint working properly - ID is required');
          console.log('   Error:', insertError.message);
        } else if (insertError.message.includes('row-level security')) {
          console.log('✅ RLS policy working - requires authentication');
          console.log('   Error:', insertError.message);
        } else {
          console.log('⚠️ Other insert error:', insertError.message);
        }
      } else {
        console.log('⚠️ Unexpected success - table accepted row without ID');
      }
    } catch (insertErr) {
      console.log('❌ Insert check error:', insertErr.message);
    }
    
    console.log('\n3. Checking RLS policies...');
    // This will likely fail due to RLS, which is expected
    const { error: rlsError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);
    
    if (rlsError) {
      if (rlsError.message.includes('row-level security')) {
        console.log('✅ RLS policies active - requires authentication');
        console.log('   Error:', rlsError.message);
      } else {
        console.log('⚠️ Other select error:', rlsError.message);
      }
    } else {
      console.log('⚠️ RLS might be disabled - able to query without auth');
    }
    
  } catch (err) {
    console.log('❌ Error checking function:', err.message);
  }
}

testFunctionExists();

testFunctionExists();

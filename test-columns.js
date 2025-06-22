// Quick database test to check if columns exist
import { supabase } from './src/services/supabase.ts';

async function testColumns() {
  console.log('🔍 Testing database columns...');
  
  // Test 1: Try to select the missing columns directly
  try {
    const { data, error } = await supabase
      .from('founders')
      .select('onboarding_completed, full_name, profile_progress')
      .limit(1);
    
    if (error) {
      console.log('❌ Column test failed:', error.message);
    } else {
      console.log('✅ Columns exist and can be queried:', data);
    }
  } catch (err) {
    console.log('❌ Query failed:', err);
  }
  
  // Test 2: Try to insert a test record
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert({
        user_id: 'test-123',
        email: 'test@example.com',
        onboarding_completed: false,
        full_name: 'Test User',
        profile_progress: 0
      })
      .select();
    
    if (error) {
      console.log('❌ Insert test failed:', error.message);
    } else {
      console.log('✅ Insert test successful:', data);
      
      // Clean up test record
      await supabase.from('founders').delete().eq('user_id', 'test-123');
    }
  } catch (err) {
    console.log('❌ Insert failed:', err);
  }
}

// Run the test
testColumns();

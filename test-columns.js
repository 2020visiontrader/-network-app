import { v4 as uuidv4 } from 'uuid';
// Quick database test to check if columns exist
import { supabase } from './src/services/supabase.ts';

async function testColumns() {
  console.log('🔍 Testing database columns...');
  
  // Cleanup before testing to avoid pollution
  await cleanupTestData();
  
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
  const testUserId = uuidv4();
  try {
    const { data, error } = await supabase
      .from('founders')
      .insert({
        user_id: testUserId,
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
      await supabase.from('founders').delete().eq('user_id', testUserId);
    }
  } catch (err) {
    console.log('❌ Insert failed:', err);
  }
  
  // Final cleanup
  await cleanupTestData();
}

// Clean up test data to prevent pollution
async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');
  try {
    const { error } = await supabase
      .from('founders')
      .delete()
      .neq('id', ''); // Delete all test rows
      
    if (error) {
      console.log('⚠️ Cleanup warning:', error.message);
    } else {
      console.log('✅ Cleanup successful');
    }
  } catch (err) {
    console.log('⚠️ Cleanup error:', err);
  }
}

// Run the test
testColumns();

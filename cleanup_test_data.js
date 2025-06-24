// Cleanup stale test data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service role key provided:', !!supabaseKey);

// Create Supabase admin client
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestData() {
  console.log('🧹 Running cleanup of test data...');

  try {
    // Find test users and their founder profiles
    const { data: testUsers, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('Error listing users:', usersError);
      return;
    }
    
    // Find test users by email pattern
    const testUserIds = testUsers.users
      .filter(user => user.email && user.email.includes('test-user'))
      .map(user => user.id);
    
    if (testUserIds.length > 0) {
      console.log(`Found ${testUserIds.length} test users to clean up`);
      
      // First find and delete any founder profiles for these users
      const { data: founders, error: foundersError } = await supabase
        .from('founders')
        .select('id, user_id')
        .in('user_id', testUserIds);
      
      if (foundersError) {
        console.error('Error finding founder profiles:', foundersError);
      } else if (founders && founders.length > 0) {
        console.log(`Found ${founders.length} founder profiles to delete`);
        
        // Get founder IDs
        const founderIds = founders.map(f => f.id);
        
        // Delete any connections involving these founders
        const { error: connectionsError } = await supabase
          .from('connections')
          .delete()
          .or(`founder_a_id.in.(${founderIds.join(',')}),founder_b_id.in.(${founderIds.join(',')})`);
        
        if (connectionsError) {
          console.error('Error deleting connections:', connectionsError);
        } else {
          console.log('Deleted any connections involving test founders');
        }
        
        // Delete founder profiles
        const { error: deleteFoundersError } = await supabase
          .from('founders')
          .delete()
          .in('id', founderIds);
        
        if (deleteFoundersError) {
          console.error('Error deleting founder profiles:', deleteFoundersError);
        } else {
          console.log(`Deleted ${founders.length} founder profiles`);
        }
      } else {
        console.log('No founder profiles found for test users');
      }
      
      // Delete test users
      for (const userId of testUserIds) {
        const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteUserError) {
          console.error(`Error deleting user ${userId}:`, deleteUserError);
        }
      }
      console.log(`Deleted ${testUserIds.length} test users`);
    } else {
      console.log('No test users found to clean up');
    }
    
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('Unexpected error during cleanup:', error);
  }
}

cleanupTestData();

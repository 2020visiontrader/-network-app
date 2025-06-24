// Cleanup script for testing
// This script removes any stale test data from the database

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('API Key provided:', !!supabaseServiceKey);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create admin client
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

// List all test users
async function listTestUsers() {
  console.log('📋 Listing test users...');
  
  try {
    const { data: users, error } = await adminClient.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Error listing users:', error);
      return;
    }
    
    const testUsers = users.users.filter(user => 
      user.email && (user.email.includes('test-user') || user.email.includes('@example.com'))
    );
    
    console.log(`Found ${testUsers.length} test users:`);
    testUsers.forEach(user => {
      console.log(`- ${user.email} (${user.id})`);
    });
    
    return testUsers;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// List founders associated with test users
async function listFounderProfiles() {
  console.log('\n📋 Listing founder profiles...');
  
  try {
    const { data: founders, error } = await adminClient
      .from('founders')
      .select('*')
      .like('email', '%@example.com%');
    
    if (error) {
      console.error('❌ Error fetching founders:', error);
      return;
    }
    
    console.log(`Found ${founders.length} test founder profiles:`);
    founders.forEach(founder => {
      console.log(`- ${founder.email || 'No email'} (user_id: ${founder.user_id}, id: ${founder.id})`);
    });
    
    return founders;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// List connections associated with test founders
async function listConnections(founderIds) {
  if (!founderIds || !founderIds.length) {
    console.log('\n⚠️ No founder IDs provided to check connections');
    return;
  }
  
  console.log('\n📋 Listing connections for test founders...');
  
  try {
    const { data: connections, error } = await adminClient
      .from('connections')
      .select('*')
      .in('founder_a_id', founderIds)
      .or(`founder_b_id.in.(${founderIds.join(',')})`);
    
    if (error) {
      console.error('❌ Error fetching connections:', error);
      return;
    }
    
    console.log(`Found ${connections.length} connections for test founders:`);
    connections.forEach(connection => {
      console.log(`- Connection ID: ${connection.id}, Status: ${connection.status}`);
      console.log(`  Founder A: ${connection.founder_a_id}, Founder B: ${connection.founder_b_id}`);
    });
    
    return connections;
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Clean up test data
async function cleanupTestData(testUsers, testFounders) {
  console.log('\n🧹 Cleaning up test data...');
  
  // Get founder IDs
  const founderIds = testFounders ? testFounders.map(f => f.id) : [];
  
  // Clean up connections first
  if (founderIds.length > 0) {
    console.log(`Deleting connections for ${founderIds.length} test founders...`);
    const { error: connectionsError } = await adminClient
      .from('connections')
      .delete()
      .in('founder_a_id', founderIds)
      .or(`founder_b_id.in.(${founderIds.join(',')})`);
    
    if (connectionsError) {
      console.error('❌ Error deleting connections:', connectionsError);
    } else {
      console.log('✅ Deleted test connections');
    }
  }
  
  // Clean up founders
  if (testFounders && testFounders.length > 0) {
    console.log(`Deleting ${testFounders.length} test founder profiles...`);
    
    for (const founder of testFounders) {
      const { error } = await adminClient
        .from('founders')
        .delete()
        .eq('id', founder.id);
      
      if (error) {
        console.error(`❌ Error deleting founder ${founder.id}:`, error);
      } else {
        console.log(`✅ Deleted founder ${founder.id}`);
      }
    }
  }
  
  // Clean up users
  if (testUsers && testUsers.length > 0) {
    console.log(`Deleting ${testUsers.length} test users...`);
    
    for (const user of testUsers) {
      const { error } = await adminClient.auth.admin.deleteUser(user.id);
      
      if (error) {
        console.error(`❌ Error deleting user ${user.email}:`, error);
      } else {
        console.log(`✅ Deleted user ${user.email}`);
      }
    }
  }
}

// Main function
async function main() {
  console.log('🚀 Starting cleanup process...\n');
  
  // List all test entities
  const testUsers = await listTestUsers();
  const testFounders = await listFounderProfiles();
  
  if (testFounders && testFounders.length > 0) {
    const founderIds = testFounders.map(f => f.id);
    await listConnections(founderIds);
  }
  
  // Ask for confirmation
  console.log('\n⚠️ WARNING: This will delete all test data listed above!');
  console.log('Press Ctrl+C now to cancel, or wait 5 seconds to continue...');
  
  // Wait for 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  // Proceed with cleanup
  await cleanupTestData(testUsers, testFounders);
  
  console.log('\n✅ Cleanup completed!');
}

// Run the main function
main();

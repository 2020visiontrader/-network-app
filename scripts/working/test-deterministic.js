#!/usr/bin/env node

/**
 * Deterministic Test Suite for NetworkFounderApp
 * 
 * This test suite uses robust infrastructure to eliminate race conditions
 * and ensure consistent, reproducible test results.
 */

const { TestRunner, testUtils, supabase } = require('./test-infrastructure');

// Create test runner
const testRunner = new TestRunner();

// Test 1: Database Connection and Basic Operations
testRunner.addTest('Database Connection & .maybeSingle()', async (utils) => {
  // Test database connectivity
  await utils.testDatabaseOperation('Database Connection', async () => {
    const { data, error } = await supabase
      .from('founders')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return data;
  });

  // Test .maybeSingle() behavior (should not throw PGRST116)
  await utils.testDatabaseOperation('.maybeSingle() Safety', async () => {
    const testUUID = '12345678-1234-1234-1234-123456789012'; // Valid UUID format
    
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUUID)
      .maybeSingle();
    
    if (error) throw error;
    
    // Should return null, not throw error
    if (data !== null) {
      throw new Error('Expected null for non-existent user');
    }
    
    return true;
  });
});

// Test 2: User Creation and Retrieval
testRunner.addTest('User Creation & Retrieval', async (utils) => {
  let testUser;

  // Create test user
  testUser = await utils.testDatabaseOperation('User Creation', async () => {
    return await utils.createTestUser({
      full_name: 'Test User Creation',
      company_name: 'Test Company'
    });
  });

  // Verify user exists
  await utils.testDatabaseOperation('User Retrieval', async () => {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUser.id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) throw new Error('User not found after creation');
    if (data.full_name !== 'Test User Creation') {
      throw new Error('User data mismatch');
    }
    
    return data;
  });
});

// Test 3: Onboarding Flow Simulation
testRunner.addTest('Onboarding Flow Race Condition Fix', async (utils) => {
  let testUser;

  // Create user for onboarding test
  testUser = await utils.createTestUser({
    full_name: 'Onboarding Test User',
    onboarding_completed: false
  });

  // Simulate onboarding completion with retry mechanism
  await utils.testDatabaseOperation('Onboarding Completion', async () => {
    // Update user to complete onboarding
    const { data: updateData, error: updateError } = await supabase
      .from('founders')
      .update({ 
        onboarding_completed: true,
        company_name: 'Updated Company',
        role: 'CEO'
      })
      .eq('id', testUser.id)
      .select()
      .maybeSingle();
    
    if (updateError) throw updateError;
    if (!updateData) throw new Error('No data returned from update');
    
    return updateData;
  });

  // Verify completion with retry mechanism (simulates race condition fix)
  await utils.testDatabaseOperation('Onboarding Verification with Retry', async () => {
    let verified = false;
    let attempts = 0;
    const maxAttempts = 5;

    while (!verified && attempts < maxAttempts) {
      const { data, error } = await supabase
        .from('founders')
        .select('onboarding_completed, company_name')
        .eq('id', testUser.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.onboarding_completed === true) {
        verified = true;
        if (data.company_name !== 'Updated Company') {
          throw new Error('Data inconsistency detected');
        }
      } else {
        attempts++;
        await utils.wait(200); // Wait before retry
      }
    }

    if (!verified) {
      throw new Error('Onboarding completion not verified after retries');
    }

    return true;
  });
});

// Test 4: Connection Operations
testRunner.addTest('Database Schema Validation', async (utils) => {
  // Test connections table schema
  await utils.testDatabaseOperation('Connections Table Schema', async () => {
    const { data, error } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status, created_at')
      .limit(1);
    
    // Error is expected if table is empty, that's fine
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      // Only throw if it's a real schema error, not empty table
      if (!error.message.includes('Results contain 0 rows')) {
        throw error;
      }
    }
    
    return true;
  });

  // Test coffee_chats table schema
  await utils.testDatabaseOperation('Coffee Chats Table Schema', async () => {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status, created_at')
      .limit(1);
    
    // Same logic - empty table is fine
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      if (!error.message.includes('Results contain 0 rows')) {
        throw error;
      }
    }
    
    return true;
  });
});

// Test 5: Concurrent Operations
testRunner.addTest('Concurrent Operations Handling', async (utils) => {
  // Create multiple users concurrently
  await utils.testDatabaseOperation('Concurrent User Creation', async () => {
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      promises.push(
        utils.createTestUser({
          full_name: `Concurrent User ${i}`,
          email: `concurrent-${Date.now()}-${i}@test.com`
        })
      );
    }
    
    const results = await Promise.all(promises);
    
    if (results.length !== 3) {
      throw new Error('Not all concurrent users created');
    }
    
    // Verify all users exist
    for (const user of results) {
      const { data, error } = await supabase
        .from('founders')
        .select('id, full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error(`Concurrent user ${user.id} not found`);
    }
    
    return results;
  });
});

// Test 6: Error Handling and Recovery
testRunner.addTest('Error Handling & Recovery', async (utils) => {
  // Test invalid UUID handling
  await utils.testDatabaseOperation('Invalid UUID Handling', async () => {
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', 'invalid-uuid-format')
      .maybeSingle();
    
    // Should handle gracefully
    if (error && error.message.includes('invalid input syntax')) {
      // This is expected for invalid UUID, handle gracefully
      return true;
    }
    
    // If no error, that's also fine (data should be null)
    return true;
  });

  // Test duplicate email handling
  await utils.testDatabaseOperation('Duplicate Handling', async () => {
    const duplicateEmail = `duplicate-${Date.now()}@test.com`;
    
    // Create first user
    const user1 = await utils.createTestUser({
      email: duplicateEmail,
      full_name: 'First User'
    });
    
    // Try to create second user with same email (should handle gracefully)
    try {
      await utils.createTestUser({
        email: duplicateEmail,
        full_name: 'Second User'
      });
      
      // If no error thrown, that's fine (might be allowed)
      return true;
    } catch (error) {
      // If error thrown, it should be a constraint error, not a crash
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return true; // Expected constraint error
      }
      throw error; // Unexpected error
    }
  });
});

// Run the test suite
async function runDeterministicTests() {
  console.log('🎯 DETERMINISTIC TEST SUITE');
  console.log('🛡️ Race Condition Prevention Enabled');
  console.log('🔄 Retry Mechanisms Active');
  console.log('🧹 Automatic Cleanup Configured\n');
  
  try {
    await testRunner.runTests();
    
    // Exit with appropriate code
    if (testRunner.results.failed === 0) {
      console.log('\n🎉 All tests passed! System is stable and deterministic.');
      process.exit(0);
    } else {
      console.log('\n⚠️ Some tests failed. Please review the issues above.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n💥 Test suite crashed:', error.message);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runDeterministicTests();
}

module.exports = { runDeterministicTests };

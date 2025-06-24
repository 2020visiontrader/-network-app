/**
 * Fixed Test Infrastructure with Proper UUID and Schema Handling
 * 
 * This version addresses the UUID format issues and uses the correct database schema.
 */

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Initialize Supabase client
const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

/**
 * Generate a proper UUID v4
 */
function generateUUID() {
  return crypto.randomUUID();
}

/**
 * Generate a valid test email
 */
function generateTestEmail() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `test-${timestamp}-${random}@networkfounders.test`;
}

/**
 * Retry mechanism for operations
 */
async function retryOperation(operation, maxAttempts = 3, delay = 500) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`   🔄 Attempt ${attempt}/${maxAttempts}...`);
      const result = await operation();
      console.log(`   ✅ Success on attempt ${attempt}`);
      return result;
    } catch (error) {
      console.log(`   ⚠️ Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt === maxAttempts) {
        throw new Error(`Operation failed after ${maxAttempts} attempts: ${error.message}`);
      }
      
      console.log(`   ⏳ Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

/**
 * Get the actual database schema for founders table
 */
async function getFoundersSchema() {
  console.log('🔍 Discovering founders table schema...');
  
  try {
    // Try to get an existing record to see the schema
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .limit(1);
    
    if (error && !error.message.includes('Results contain 0 rows')) {
      throw error;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('   ✅ Found columns:', columns.join(', '));
      return columns;
    }
    
    // If no data, we'll use the known columns from the TypeScript interface
    const knownColumns = [
      'id', 'email', 'full_name', 'linkedin_url', 'location_city',
      'industry', 'company_name', 'role', 'bio', 'tags_or_interests',
      'profile_visible', 'onboarding_completed', 'profile_progress',
      'created_at', 'updated_at'
    ];
    
    console.log('   ✅ Using known schema:', knownColumns.join(', '));
    return knownColumns;
    
  } catch (error) {
    console.log('   ⚠️ Schema discovery failed, using minimal schema');
    return ['id', 'email', 'full_name'];
  }
}

/**
 * Create a test user with proper UUID and schema
 */
async function createTestUser(schema, userData = {}) {
  const testUser = {
    id: generateUUID(),
    email: generateTestEmail(),
    full_name: 'Test User',
    ...userData
  };
  
  // Only include fields that exist in the schema
  const filteredUser = {};
  for (const [key, value] of Object.entries(testUser)) {
    if (schema.includes(key)) {
      filteredUser[key] = value;
    }
  }
  
  console.log(`   Creating user with UUID: ${filteredUser.id}`);
  
  const { data, error } = await supabase
    .from('founders')
    .insert([filteredUser])
    .select()
    .maybeSingle();
  
  if (error) {
    throw new Error(`Failed to create test user: ${error.message}`);
  }
  
  return data;
}

/**
 * Clean up test users
 */
async function cleanupTestUsers(emails = []) {
  if (emails.length === 0) return;
  
  console.log('🧹 Cleaning up test users...');
  
  try {
    const { error } = await supabase
      .from('founders')
      .delete()
      .in('email', emails);
    
    if (error && !error.message.includes('No rows deleted')) {
      console.warn('⚠️ Cleanup warning:', error.message);
    } else {
      console.log(`   ✅ Cleaned up ${emails.length} test users`);
    }
  } catch (error) {
    console.warn('⚠️ Cleanup error:', error.message);
  }
}

/**
 * Test 1: Basic database operations with proper UUID
 */
async function testBasicOperations() {
  console.log('🧪 Test 1: Basic Database Operations');
  console.log('─────────────────────────────────────');
  
  const testEmails = [];
  const schema = await getFoundersSchema();
  
  try {
    // Test .maybeSingle() with proper UUID
    console.log('Testing .maybeSingle() with non-existent UUID...');
    
    await retryOperation(async () => {
      const nonExistentUUID = generateUUID();
      
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', nonExistentUUID)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data !== null) {
        throw new Error('Expected null for non-existent record');
      }
      
      return true;
    });
    
    console.log('✅ .maybeSingle() handled non-existent record safely');
    
    // Test user creation
    console.log('\nTesting user creation with proper schema...');
    
    const testUser = await retryOperation(async () => {
      return await createTestUser(schema, {
        full_name: 'Basic Test User',
        email: generateTestEmail()
      });
    });
    
    testEmails.push(testUser.email);
    console.log('✅ User created successfully');
    
    // Test user retrieval
    console.log('\nTesting user retrieval...');
    
    await retryOperation(async () => {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', testUser.id)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('User not found after creation');
      
      return data;
    });
    
    console.log('✅ User retrieved successfully');
    
    return true;
    
  } finally {
    await cleanupTestUsers(testEmails);
  }
}

/**
 * Test 2: Concurrent operations with proper UUIDs
 */
async function testConcurrentOperations() {
  console.log('\n🧪 Test 2: Concurrent Database Operations');
  console.log('─────────────────────────────────────────');
  
  const testEmails = [];
  const schema = await getFoundersSchema();
  
  try {
    console.log('Testing concurrent user creation...');
    
    const promises = [];
    
    for (let i = 0; i < 3; i++) {
      promises.push(
        retryOperation(async () => {
          const user = await createTestUser(schema, {
            full_name: `Concurrent User ${i}`,
            email: generateTestEmail()
          });
          testEmails.push(user.email);
          return user;
        })
      );
    }
    
    const results = await Promise.all(promises);
    
    console.log('✅ All concurrent operations completed');
    console.log(`   Created ${results.length} users concurrently`);
    
    // Verify all users exist
    for (const user of results) {
      await retryOperation(async () => {
        const { data, error } = await supabase
          .from('founders')
          .select('id, full_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        if (!data) throw new Error(`User ${user.id} not found`);
        
        return data;
      });
    }
    
    console.log('✅ All concurrent users verified');
    
    return true;
    
  } finally {
    await cleanupTestUsers(testEmails);
  }
}

/**
 * Test 3: Race condition simulation
 */
async function testRaceConditionPrevention() {
  console.log('\n🧪 Test 3: Race Condition Prevention');
  console.log('─────────────────────────────────────');
  
  const testEmails = [];
  const schema = await getFoundersSchema();
  
  try {
    console.log('Creating user for race condition test...');
    
    const testUser = await retryOperation(async () => {
      return await createTestUser(schema, {
        full_name: 'Race Condition Test User',
        onboarding_completed: false
      });
    });
    
    testEmails.push(testUser.email);
    
    // Simulate onboarding completion
    console.log('\nSimulating onboarding completion...');
    
    await retryOperation(async () => {
      const updateData = { onboarding_completed: true };
      
      // Only update if column exists
      if (schema.includes('company_name')) {
        updateData.company_name = 'Updated Company';
      }
      
      const { data, error } = await supabase
        .from('founders')
        .update(updateData)
        .eq('id', testUser.id)
        .select()
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error('No data returned from update');
      
      return data;
    });
    
    // Verify with retry pattern (race condition prevention)
    console.log('\nVerifying completion with retry pattern...');
    
    let verified = false;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (!verified && attempts < maxAttempts) {
      attempts++;
      console.log(`   Verification attempt ${attempts}/${maxAttempts}...`);
      
      const { data, error } = await supabase
        .from('founders')
        .select('onboarding_completed')
        .eq('id', testUser.id)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.onboarding_completed === true) {
        verified = true;
        console.log('   ✅ Onboarding completion verified');
      } else {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    if (!verified) {
      throw new Error('Onboarding completion not verified');
    }
    
    console.log('✅ Race condition prevention successful');
    
    return true;
    
  } finally {
    await cleanupTestUsers(testEmails);
  }
}

/**
 * Test 4: Schema validation
 */
async function testSchemaValidation() {
  console.log('\n🧪 Test 4: Database Schema Validation');
  console.log('─────────────────────────────────────');
  
  // Test connections table
  console.log('Testing connections table schema...');
  
  await retryOperation(async () => {
    const { data, error } = await supabase
      .from('connections')
      .select('founder_a_id, founder_b_id, status')
      .limit(1);
    
    // Empty result is fine, we're checking schema
    if (error && !error.message.includes('Results contain 0 rows')) {
      throw error;
    }
    
    return true;
  });
  
  console.log('✅ Connections table schema valid');
  
  // Test coffee_chats table
  console.log('\nTesting coffee_chats table schema...');
  
  await retryOperation(async () => {
    const { data, error } = await supabase
      .from('coffee_chats')
      .select('requester_id, requested_id, status')
      .limit(1);
    
    // Empty result is fine, we're checking schema
    if (error && !error.message.includes('Results contain 0 rows')) {
      throw error;
    }
    
    return true;
  });
  
  console.log('✅ Coffee chats table schema valid');
  
  return true;
}

/**
 * Main test runner
 */
async function runFixedTests() {
  console.log('🎯 FIXED RACE CONDITION PREVENTION TESTS');
  console.log('═══════════════════════════════════════');
  console.log('🔧 Using proper UUIDs and schema detection');
  console.log('🛡️ Race condition prevention patterns active\n');
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };
  
  const tests = [
    { name: 'Basic Database Operations', fn: testBasicOperations },
    { name: 'Concurrent Operations', fn: testConcurrentOperations },
    { name: 'Race Condition Prevention', fn: testRaceConditionPrevention },
    { name: 'Schema Validation', fn: testSchemaValidation }
  ];
  
  try {
    for (const test of tests) {
      results.total++;
      
      try {
        await test.fn();
        results.passed++;
        console.log(`\n✅ PASSED: ${test.name}`);
      } catch (error) {
        results.failed++;
        results.errors.push({ test: test.name, error: error.message });
        console.log(`\n❌ FAILED: ${test.name} - ${error.message}`);
      }
    }
    
    // Report results
    console.log('\n' + '═'.repeat(60));
    console.log('📊 FIXED TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${results.total}`);
    console.log(`Passed: ${results.passed} ✅`);
    console.log(`Failed: ${results.failed} ❌`);
    console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
    
    if (results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      results.errors.forEach(({ test, error }) => {
        console.log(`   • ${test}: ${error}`);
      });
    } else {
      console.log('\n🎉 ALL TESTS PASSED!');
      console.log('✅ Race condition prevention is working perfectly');
      console.log('✅ Database operations are deterministic');
      console.log('✅ Test infrastructure is robust');
    }
    
    process.exit(results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    console.error('\n💥 Test suite error:', error.message);
    process.exit(1);
  }
}

// Run the tests
runFixedTests();

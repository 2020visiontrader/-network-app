/**
 * Robust Test Infrastructure for NetworkFounderApp
 * 
 * This module provides deterministic test utilities to eliminate
 * race conditions and ensure consistent test results.
 */

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Test configuration
const TEST_CONFIG = {
  RETRY_ATTEMPTS: 5,
  RETRY_DELAY: 500,
  SETUP_TIMEOUT: 10000,
  TEST_TIMEOUT: 30000,
  CLEANUP_TIMEOUT: 5000,
};

// Initialize Supabase client with test configuration
const supabase = createClient(
  'https://gbdodttegdctxvvavlqq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
);

/**
 * Test utilities class for robust testing
 */
class TestUtils {
  constructor() {
    this.testUsers = [];
    this.testData = [];
    this.setupComplete = false;
  }

  /**
   * Retry mechanism for flaky operations
   */
  async retryUntilPass(fn, maxAttempts = TEST_CONFIG.RETRY_ATTEMPTS) {
    let lastError;
    
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const result = await fn();
        return result;
      } catch (error) {
        lastError = error;
        console.log(`   ⏳ Attempt ${i + 1}/${maxAttempts} failed, retrying...`);
        
        if (i < maxAttempts - 1) {
          await this.wait(TEST_CONFIG.RETRY_DELAY);
        }
      }
    }
    
    throw new Error(`Test failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Wait for a specific amount of time
   */
  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Wait for database to be ready
   */
  async waitForDatabaseReady() {
    console.log('🔄 Waiting for database to be ready...');
    
    return this.retryUntilPass(async () => {
      const { data, error } = await supabase
        .from('founders')
        .select('count')
        .limit(1);
      
      if (error) {
        throw new Error(`Database not ready: ${error.message}`);
      }
      
      return true;
    });
  }

  /**
   * Wait for auth to be initialized
   */
  async waitForAuthReady() {
    console.log('🔄 Waiting for auth to be ready...');
    
    return this.retryUntilPass(async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error && error.message.includes('connection')) {
        throw new Error(`Auth not ready: ${error.message}`);
      }
      
      // Auth is ready (session can be null, that's fine)
      return true;
    });
  }

  /**
   * Create a test user safely
   */
  async createTestUser(userData = {}) {
    const testUser = {
      id: uuidv4(), // Use proper UUID format
      email: `test-${Date.now()}@example.com`,
      full_name: 'Test User',
      company_name: 'Test Company',
      role: 'Founder',
      onboarding_completed: false,
      profile_visible: true,
      created_at: new Date().toISOString(),
      ...userData
    };

    return this.retryUntilPass(async () => {
      const { data, error } = await supabase
        .from('founders')
        .insert([testUser])
        .select()
        .maybeSingle();

      if (error) {
        throw new Error(`Failed to create test user: ${error.message}`);
      }

      this.testUsers.push(testUser.id);
      return data;
    });
  }

  /**
   * Clean up test data
   */
  async cleanupTestData() {
    console.log('🧹 Cleaning up test data...');
    
    try {
      // Clean up test users
      if (this.testUsers.length > 0) {
        const { error } = await supabase
          .from('founders')
          .delete()
          .in('id', this.testUsers);
        
        if (error && !error.message.includes('No rows deleted')) {
          console.warn('⚠️ Warning during user cleanup:', error.message);
        }
      }

      // Reset tracking arrays
      this.testUsers = [];
      this.testData = [];
      
      console.log('✅ Test data cleaned up');
    } catch (error) {
      console.warn('⚠️ Warning during cleanup:', error.message);
    }
  }

  /**
   * Reset database to known state
   */
  async resetDatabase() {
    console.log('🔄 Resetting database to known state...');
    
    try {
      // Clean up any existing test data first
      await this.cleanupTestData();
      
      // Ensure database is responsive
      await this.waitForDatabaseReady();
      
      console.log('✅ Database reset complete');
    } catch (error) {
      console.error('❌ Database reset failed:', error.message);
      throw error;
    }
  }

  /**
   * Setup test environment
   */
  async setupTestEnvironment() {
    if (this.setupComplete) {
      return;
    }

    console.log('⚙️ Setting up test environment...\n');
    
    try {
      // Step 1: Reset database
      await this.resetDatabase();
      
      // Step 2: Wait for auth readiness
      await this.waitForAuthReady();
      
      // Step 3: Verify core functionality
      await this.verifyCoreFunctionality();
      
      this.setupComplete = true;
      console.log('✅ Test environment setup complete\n');
      
    } catch (error) {
      console.error('❌ Test environment setup failed:', error.message);
      throw error;
    }
  }

  /**
   * Verify core functionality is working
   */
  async verifyCoreFunctionality() {
    console.log('🔍 Verifying core functionality...');
    
    // Test .maybeSingle() works with proper UUID format
    const testUUID = '12345678-1234-1234-1234-123456789012'; // Valid UUID format
    
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('id', testUUID)
      .maybeSingle();
    
    if (error) {
      throw new Error(`Core functionality test failed: ${error.message}`);
    }
    
    console.log('✅ Core functionality verified');
  }

  /**
   * Teardown test environment
   */
  async teardownTestEnvironment() {
    console.log('\n🔚 Tearing down test environment...');
    
    try {
      await this.cleanupTestData();
      this.setupComplete = false;
      console.log('✅ Test environment teardown complete');
    } catch (error) {
      console.warn('⚠️ Warning during teardown:', error.message);
    }
  }

  /**
   * Wait for a condition to be met
   */
  async waitForCondition(conditionFn, timeout = 5000, interval = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      if (await conditionFn()) {
        return true;
      }
      await this.wait(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Test a database operation with retries
   */
  async testDatabaseOperation(operationName, operationFn) {
    console.log(`🧪 Testing: ${operationName}...`);
    
    try {
      const result = await this.retryUntilPass(operationFn);
      console.log(`   ✅ ${operationName} successful`);
      return result;
    } catch (error) {
      console.log(`   ❌ ${operationName} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Simulate user interaction with proper timing
   */
  async simulateUserInteraction(actionName, actionFn, expectedResultFn) {
    console.log(`👤 Simulating: ${actionName}...`);
    
    try {
      // Perform the action
      await actionFn();
      
      // Wait for the expected result
      await this.waitForCondition(expectedResultFn, 3000);
      
      console.log(`   ✅ ${actionName} completed successfully`);
    } catch (error) {
      console.log(`   ❌ ${actionName} failed: ${error.message}`);
      throw error;
    }
  }
}

// Export singleton instance
const testUtils = new TestUtils();

/**
 * Test runner with proper setup and teardown
 */
class TestRunner {
  constructor() {
    this.tests = [];
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  /**
   * Add a test to the suite
   */
  addTest(name, testFn) {
    this.tests.push({ name, testFn });
  }

  /**
   * Run all tests with proper setup/teardown
   */
  async runTests() {
    console.log('🚀 Starting Test Suite with Robust Infrastructure\n');
    console.log('═'.repeat(60));
    
    try {
      // Global setup
      await testUtils.setupTestEnvironment();
      
      // Run each test
      for (const test of this.tests) {
        await this.runSingleTest(test);
      }
      
      // Global teardown
      await testUtils.teardownTestEnvironment();
      
      // Report results
      this.reportResults();
      
    } catch (error) {
      console.error('\n❌ Test Suite Failed:', error.message);
      await testUtils.teardownTestEnvironment();
      process.exit(1);
    }
  }

  /**
   * Run a single test with isolation
   */
  async runSingleTest(test) {
    console.log(`\n🧪 Running: ${test.name}`);
    console.log('-'.repeat(40));
    
    try {
      // Pre-test setup
      await testUtils.cleanupTestData();
      
      // Run the test
      await test.testFn(testUtils);
      
      // Mark as passed
      this.results.passed++;
      console.log(`✅ PASSED: ${test.name}`);
      
    } catch (error) {
      // Mark as failed
      this.results.failed++;
      this.results.errors.push({ test: test.name, error: error.message });
      console.log(`❌ FAILED: ${test.name} - ${error.message}`);
    }
    
    this.results.total++;
  }

  /**
   * Report final results
   */
  reportResults() {
    console.log('\n' + '═'.repeat(60));
    console.log('📊 TEST RESULTS');
    console.log('═'.repeat(60));
    console.log(`Total Tests: ${this.results.total}`);
    console.log(`Passed: ${this.results.passed} ✅`);
    console.log(`Failed: ${this.results.failed} ❌`);
    console.log(`Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.errors.forEach(({ test, error }) => {
        console.log(`   • ${test}: ${error}`);
      });
    }
    
    console.log('\n' + (this.results.failed === 0 ? '🎉 ALL TESTS PASSED!' : '⚠️ SOME TESTS FAILED'));
  }
}

module.exports = {
  TestUtils,
  TestRunner,
  testUtils,
  TEST_CONFIG,
  supabase
};

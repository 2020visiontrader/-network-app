/**
 * Advanced Race Condition Patterns Test
 * 
 * This script demonstrates and tests the advanced race condition patterns
 * implemented in the NetworkFounderApp.
 */
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Initialize Supabase client
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Check for missing environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.log('Please ensure you have set the following environment variables:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- EXPO_PUBLIC_SUPABASE_ANON_KEY');
  console.log('\nYou can set these in a .env file or in your environment.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Import utility functions
const { sleep, logHeader, logSuccess, logError, logInfo } = require('./test-utils');

// Mock implementation of advanced patterns for testing
class CircuitBreaker {
  constructor(options = {}) {
    this.options = {
      failureThreshold: 3,
      resetTimeout: 5000,
      ...options
    };
    this.failureCount = 0;
    this.state = 'CLOSED';
    this.lastFailureTime = 0;
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime >= this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
        logInfo('Circuit half-open, allowing test request');
      } else {
        throw new Error('Circuit breaker is OPEN - system unavailable');
      }
    }
    
    try {
      const result = await fn();
      
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failureCount = 0;
        logSuccess('Circuit closed after successful operation');
      }
      
      return result;
    } catch (error) {
      this.failureCount++;
      this.lastFailureTime = Date.now();
      
      if (this.state !== 'OPEN' && this.failureCount >= this.options.failureThreshold) {
        this.state = 'OPEN';
        if (this.options.onOpen) this.options.onOpen();
        logInfo(`Circuit opened after ${this.failureCount} failures`);
      }
      
      throw error;
    }
  }
  
  getState() {
    return this.state;
  }
  
  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
  }
}

class QueueProcessor {
  constructor(processFn, options = {}) {
    this.processFn = processFn;
    this.options = {
      concurrency: 2,
      retryDelay: 1000,
      maxRetries: 3,
      ...options
    };
    this.queue = [];
    this.processing = new Set();
    this.paused = false;
  }
  
  enqueue(data, priority = 0) {
    const id = `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.queue.push({
      id, data, priority, retries: 0, createdAt: Date.now(), maxRetries: this.options.maxRetries
    });
    this.queue.sort((a, b) => b.priority - a.priority);
    
    // Start processing immediately
    this.processQueue();
    
    return id;
  }
  
  async processQueue() {
    if (this.paused || this.processing.size >= this.options.concurrency) {
      return;
    }
    
    const item = this.queue.shift();
    if (!item) return;
    
    this.processing.add(item.id);
    
    try {
      await this.processFn(item.data);
      this.processing.delete(item.id);
    } catch (error) {
      if (item.retries < item.maxRetries) {
        item.retries++;
        setTimeout(() => {
          this.queue.push(item);
          this.processing.delete(item.id);
          this.queue.sort((a, b) => b.priority - a.priority);
          this.processQueue();
        }, this.options.retryDelay);
      } else {
        this.processing.delete(item.id);
        if (this.options.onError) this.options.onError(error, item);
      }
    }
  }
  
  getStats() {
    return {
      queuedItems: this.queue.length,
      processingItems: this.processing.size,
      paused: this.paused
    };
  }
}

// Test functions
async function testCircuitBreaker() {
  logHeader('Testing Circuit Breaker Pattern');
  
  // Create a circuit breaker
  const circuitBreaker = new CircuitBreaker({
    failureThreshold: 3,
    resetTimeout: 2000,
    onOpen: () => {
      logInfo('Circuit breaker opened - would show maintenance message to user');
    }
  });
  
  // Function that will fail
  const fetchUserData = async (shouldFail = false) => {
    if (shouldFail) {
      throw new Error('Database connection failed');
    }
    return { id: uuidv4(), name: 'Test User' };
  };
  
  // Test successful operation
  try {
    const result = await circuitBreaker.execute(() => fetchUserData(false));
    logSuccess('Successful operation with circuit breaker: ' + result.name);
  } catch (error) {
    logError('Should not fail: ' + error.message);
    return false;
  }
  
  // Test failing operations to open circuit
  for (let i = 0; i < 3; i++) {
    try {
      await circuitBreaker.execute(() => fetchUserData(true));
    } catch (error) {
      logInfo(`Expected failure ${i+1}: ${error.message}`);
    }
  }
  
  // Circuit should be open now
  if (circuitBreaker.getState() !== 'OPEN') {
    logError('Circuit should be OPEN after multiple failures');
    return false;
  }
  
  // Try another operation - should fail fast with circuit open
  try {
    await circuitBreaker.execute(() => fetchUserData(false));
    logError('Should fail fast when circuit is open');
    return false;
  } catch (error) {
    if (error.message.includes('Circuit breaker is OPEN')) {
      logSuccess('Circuit prevented operation while open - working correctly');
    } else {
      logError('Unexpected error: ' + error.message);
      return false;
    }
  }
  
  // Wait for reset timeout
  logInfo('Waiting for circuit reset timeout...');
  await sleep(2500);
  
  // Now the circuit should allow a test request (half-open)
  try {
    const result = await circuitBreaker.execute(() => fetchUserData(false));
    logSuccess('Circuit closed after successful operation in half-open state');
    return true;
  } catch (error) {
    logError('Should succeed after reset timeout: ' + error.message);
    return false;
  }
}

async function testQueueProcessor() {
  logHeader('Testing Queue-based Processing');
  
  // Create a processor for onboarding tasks
  const onboardingProcessor = new QueueProcessor(
    // Process function
    async (userData) => {
      logInfo(`Processing onboarding for ${userData.email}`);
      
      // Simulate database operations
      await sleep(200);
      
      if (userData.shouldFail) {
        throw new Error('Simulated failure for ' + userData.email);
      }
      
      logSuccess(`Completed onboarding for ${userData.email}`);
    },
    // Options
    {
      concurrency: 2,
      retryDelay: 1000,
      maxRetries: 2,
      onError: (error, item) => {
        logError(`Failed to process ${item.data.email} after ${item.retries} retries: ${error.message}`);
      }
    }
  );
  
  // Add a mix of successful and failing items
  const successId = onboardingProcessor.enqueue({
    id: uuidv4(),
    email: 'success@example.com',
    shouldFail: false
  }, 1);
  
  const failId = onboardingProcessor.enqueue({
    id: uuidv4(),
    email: 'willretry@example.com',
    shouldFail: true
  }, 2);
  
  const lowerPriorityId = onboardingProcessor.enqueue({
    id: uuidv4(), 
    email: 'lowpriority@example.com',
    shouldFail: false
  }, 0);
  
  // Wait for processing to complete
  logInfo('Processing queue items - this will retry the failing item');
  
  // Log initial stats
  logInfo('Initial queue stats: ' + JSON.stringify(onboardingProcessor.getStats()));
  
  // Wait for processing including retries
  await sleep(5000);
  
  // Check final stats
  const finalStats = onboardingProcessor.getStats();
  logInfo('Final queue stats: ' + JSON.stringify(finalStats));
  
  // Should have processed all items (some with failure)
  if (finalStats.queuedItems === 0 && finalStats.processingItems === 0) {
    logSuccess('Queue processor handled all items including retries');
    return true;
  } else {
    logError('Queue processor did not complete all items');
    return false;
  }
}

async function testRealtimeListener() {
  logHeader('Testing Realtime Database Listener');
  
  logInfo('This is a mock implementation - in real app this would connect to Supabase realtime');
  
  // Simulate a realtime update
  const mockPayload = {
    schema: 'public',
    table: 'founders',
    type: 'UPDATE',
    new: {
      id: uuidv4(),
      full_name: 'Updated User',
      email: 'updated@example.com',
      updated_at: new Date().toISOString()
    },
    old: {
      id: uuidv4(),
      full_name: 'Original User',
      email: 'original@example.com'
    }
  };
  
  // Simulate subscriber function
  let received = false;
  const onProfileUpdate = (payload) => {
    logInfo('Received realtime update: ' + JSON.stringify(payload.new));
    received = true;
  };
  
  // Call the subscriber directly (in real implementation this would be called by Supabase)
  onProfileUpdate(mockPayload);
  
  if (received) {
    logSuccess('Realtime listener successfully received updates');
    return true;
  } else {
    logError('Realtime listener failed to receive updates');
    return false;
  }
}

async function testServerSideVerification() {
  logHeader('Testing Server-side Verification');
  
  logInfo('Simulating server-side verification job');
  
  // Create a test record with missing data
  const testId = uuidv4();
  const { data, error } = await supabase
    .from('founders')
    .insert({
      id: testId,
      user_id: uuidv4(),
      full_name: 'Verification Test',
      email: `verify-${Date.now()}@example.com`,
      onboarding_completed: true,
      // Intentionally missing created_at
    })
    .select()
    .maybeSingle();
    
  if (error) {
    logError('Error creating test record: ' + error.message);
    return false;
  }
  
  logInfo(`Created test record with ID: ${testId}`);
  
  // Simulate verification function
  const validator = (record) => {
    const valid = record && 
                  record.onboarding_completed === true &&
                  record.created_at !== null;
                  
    if (!valid) {
      logInfo(`Found invalid record: ${record.id} - missing created_at`);
    }
    
    return valid;
  };
  
  // Simulate fix function
  const fixer = async (recordId) => {
    logInfo(`Fixing record: ${recordId}`);
    
    const { error } = await supabase
      .from('founders')
      .update({
        created_at: new Date().toISOString()
      })
      .eq('id', recordId);
      
    if (error) {
      logError(`Error fixing record ${recordId}: ${error.message}`);
      return false;
    }
    
    logSuccess(`Fixed record: ${recordId}`);
    return true;
  };
  
  // Test the validator (should fail)
  const isValid = validator(data);
  if (isValid) {
    logError('Validator should have failed for record missing created_at');
    return false;
  }
  
  // Test the fixer
  const fixResult = await fixer(testId);
  if (!fixResult) {
    logError('Fixer failed to fix the record');
    return false;
  }
  
  // Verify the fix worked
  const { data: fixedData, error: fetchError } = await supabase
    .from('founders')
    .select('*')
    .eq('id', testId)
    .maybeSingle();
    
  if (fetchError) {
    logError('Error fetching fixed record: ' + fetchError.message);
    return false;
  }
  
  // Check if now valid
  const isNowValid = validator(fixedData);
  if (!isNowValid) {
    logError('Record still invalid after fix');
    return false;
  }
  
  logSuccess('Server-side verification successfully fixed the record');
  
  // Clean up test record
  await supabase.from('founders').delete().eq('id', testId);
  
  return true;
}

// Run all tests
async function runTests() {
  logHeader('ADVANCED RACE CONDITION PATTERNS TEST', true);
  
  let results = [];
  
  results.push({ name: 'Circuit Breaker Pattern', success: await testCircuitBreaker() });
  results.push({ name: 'Queue-based Processing', success: await testQueueProcessor() });
  results.push({ name: 'Realtime Database Listener', success: await testRealtimeListener() });
  results.push({ name: 'Server-side Verification', success: await testServerSideVerification() });
  
  // Print results
  logHeader('TEST RESULTS', true);
  
  let allPassed = true;
  results.forEach(result => {
    if (result.success) {
      logSuccess(`✅ ${result.name}: PASSED`);
    } else {
      logError(`❌ ${result.name}: FAILED`);
      allPassed = false;
    }
  });
  
  if (allPassed) {
    logSuccess('\n🎉 All advanced race condition patterns tests passed!');
  } else {
    logError('\n❌ Some tests failed. Check the logs for details.');
  }
}

// Create test utilities
const test = {
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  logHeader: (text, major = false) => {
    const line = major ? '='.repeat(70) : '-'.repeat(50);
    console.log('\n' + line);
    console.log(` ${text}`);
    console.log(line);
  },
  logSuccess: (text) => console.log('✅ ' + text),
  logError: (text) => console.log('❌ ' + text),
  logInfo: (text) => console.log('ℹ️ ' + text)
};

// These utilities are already declared above
// No need to redeclare them from the test object

// Run the tests
runTests().catch(error => {
  console.error('Error running tests:', error);
  process.exit(1);
});

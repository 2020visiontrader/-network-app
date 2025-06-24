/**
 * Test Configuration for NetworkFounderApp
 * 
 * Centralized configuration for all test scenarios including
 * race condition prevention, retry mechanisms, and timeouts.
 */

module.exports = {
  // Database connection settings
  DATABASE: {
    CONNECTION_TIMEOUT: 10000,
    QUERY_TIMEOUT: 5000,
    RETRY_ATTEMPTS: 5,
    RETRY_DELAY: 500,
  },

  // Authentication settings
  AUTH: {
    INITIALIZATION_TIMEOUT: 8000,
    SESSION_CHECK_INTERVAL: 100,
    MAX_SESSION_CHECKS: 50,
  },

  // Test execution settings
  TEST: {
    SETUP_TIMEOUT: 15000,
    TEST_TIMEOUT: 30000,
    CLEANUP_TIMEOUT: 5000,
    INTER_TEST_DELAY: 100,
    MAX_CONCURRENT_TESTS: 3,
  },

  // Race condition prevention
  RACE_CONDITION: {
    DEFAULT_RETRY_ATTEMPTS: 5,
    DEFAULT_RETRY_DELAY: 500,
    ASYNC_OPERATION_TIMEOUT: 10000,
    CONDITION_CHECK_INTERVAL: 100,
    MAX_CONDITION_CHECKS: 100,
  },

  // User interaction simulation
  USER_INTERACTION: {
    FORM_SUBMIT_DELAY: 200,
    NAVIGATION_DELAY: 300,
    INPUT_DELAY: 50,
    CLICK_DELAY: 100,
  },

  // Test data management
  TEST_DATA: {
    CLEANUP_ON_START: true,
    CLEANUP_ON_END: true,
    PRESERVE_ON_FAILURE: false,
    MAX_TEST_USERS: 100,
  },

  // Error handling
  ERROR_HANDLING: {
    IGNORE_EXPECTED_ERRORS: [
      'Results contain 0 rows',
      'relation does not exist',
      'invalid input syntax'
    ],
    FATAL_ERRORS: [
      'connection refused',
      'authentication failed',
      'access denied'
    ],
    RETRY_ON_ERRORS: [
      'network error',
      'timeout',
      'temporary failure'
    ]
  },

  // Logging and reporting
  LOGGING: {
    VERBOSE: true,
    LOG_RETRIES: true,
    LOG_CLEANUP: true,
    LOG_TIMINGS: true,
  },

  // Environment-specific overrides
  ENVIRONMENTS: {
    development: {
      TEST: {
        SETUP_TIMEOUT: 20000,
        TEST_TIMEOUT: 45000,
      },
      LOGGING: {
        VERBOSE: true,
      }
    },
    
    ci: {
      TEST: {
        SETUP_TIMEOUT: 30000,
        TEST_TIMEOUT: 60000,
      },
      RACE_CONDITION: {
        DEFAULT_RETRY_ATTEMPTS: 10,
        DEFAULT_RETRY_DELAY: 1000,
      }
    },
    
    production: {
      TEST: {
        SETUP_TIMEOUT: 45000,
        TEST_TIMEOUT: 90000,
      },
      LOGGING: {
        VERBOSE: false,
      }
    }
  }
};

# Enhanced Race Condition Monitoring Guide

This document provides guidance on implementing enhanced monitoring for race conditions in the NetworkFounderApp, specifically focused on the recommendations you requested.

## 1. Dashboard Page Enhanced Logging

To improve the dashboard page logging for better race condition diagnostics, update the `loadUserData` function in `app/dashboard/page.tsx`:

```typescript
// Near the start of the function
console.log(`🔄 Dashboard data loading started at ${new Date().toISOString()}`, {
  userId: appUser?.id
});

// After the fetchWithRetry call, enhance the error logging
if (!founderData) {
  console.error('❌ Founder data not found after multiple attempts', { 
    attempts, 
    timeTaken,
    userId: appUser.id,
    timestamp: new Date().toISOString(),
    // Log additional diagnostic information
    retryPattern: `${attempts} attempts over ${timeTaken}ms`,
    errorType: 'DATA_NOT_FOUND_AFTER_RETRIES'
  });
  setError('Founder data not found. Please complete onboarding first.');
  return;
}

// Enhanced success logging with more detailed information
console.log('✅ Founder data loaded successfully', { 
  attempts, 
  timeTaken,
  userId: appUser.id,
  onboardingCompleted: founderData.onboarding_completed,
  timestamp: new Date().toISOString(),
  // Track if retries were needed or if first attempt succeeded
  requiredRetries: attempts > 1,
  // This helps identify potential race conditions
  possibleRaceCondition: attempts > 1 ? 'Yes - needed retries' : 'No - first attempt succeeded',
  // Performance categorization
  performance: timeTaken < 500 ? 'Fast' : timeTaken < 2000 ? 'Normal' : 'Slow'
});
```

## 2. Global Helper Function for Race Condition Monitoring

Add a new utility function to `src/lib/db-utils.ts`:

```typescript
/**
 * Log detailed race condition diagnostics
 * 
 * @param operation Name of the operation being monitored
 * @param metrics Performance metrics (attempts, time, etc.)
 * @param context Additional context like userId, resource being accessed
 */
export function logRaceConditionDiagnostics(
  operation: string,
  metrics: {
    attempts: number;
    timeTaken: number;
    success: boolean;
  },
  context: Record<string, any> = {}
): void {
  const { attempts, timeTaken, success } = metrics;
  
  // Determine if this might be a race condition
  const raceConditionLikelihood = 
    attempts > 2 ? 'High' : 
    attempts > 1 ? 'Possible' : 
    'Unlikely';
  
  // Categorize performance
  const performanceCategory = 
    timeTaken < 300 ? 'Fast' : 
    timeTaken < 1000 ? 'Normal' : 
    timeTaken < 3000 ? 'Slow' : 
    'Very Slow';
  
  // Generate detailed diagnostics
  const diagnostics = {
    operation,
    timestamp: new Date().toISOString(),
    success,
    metrics: {
      attempts,
      timeTaken,
      averageAttemptTime: Math.round(timeTaken / Math.max(attempts, 1))
    },
    analysis: {
      raceConditionLikelihood,
      performanceCategory,
      retryPattern: attempts > 1 ? `Needed ${attempts - 1} retries` : 'First attempt succeeded',
      needsOptimization: timeTaken > 2000 || attempts > 2
    },
    ...context
  };
  
  // Log with appropriate level based on outcome
  if (!success) {
    console.error(`❌ Race condition monitoring - ${operation} failed:`, diagnostics);
  } else if (attempts > 1 || timeTaken > 2000) {
    console.warn(`⚠️ Race condition monitoring - ${operation} succeeded with retries:`, diagnostics);
  } else {
    console.log(`✅ Race condition monitoring - ${operation} succeeded:`, diagnostics);
  }
  
  // Return diagnostics for potential telemetry reporting
  return diagnostics;
}
```

Then use it in your code:

```typescript
// Import the new function
import { fetchWithRetry, measureDbOperation, logRaceConditionDiagnostics } from '../lib/db-utils';

// Use it after database operations
const { data, success, attempts, timeTaken } = await fetchWithRetry(...);

// Log detailed diagnostics
logRaceConditionDiagnostics('operation-name', 
  { attempts, timeTaken, success },
  { userId, additionalContext }
);
```

## 3. Performance Monitoring and Adjustment

To implement ongoing performance monitoring and adjustment:

1. **Add a Weekly Analysis Task**

Create a script or scheduled task to analyze log data and generate a report:

```javascript
// scripts/analyze-race-conditions.js
const fs = require('fs');
const path = require('path');

// Function to parse logs and analyze race conditions
function analyzeRaceConditions(logFilePath) {
  const logs = fs.readFileSync(logFilePath, 'utf8')
    .split('\n')
    .filter(line => line.includes('Race condition monitoring'))
    .map(line => {
      try {
        const jsonStr = line.substring(line.indexOf('{'));
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  // Calculate metrics
  const totalOperations = logs.length;
  const raceConditions = logs.filter(log => log.analysis.raceConditionLikelihood !== 'Unlikely').length;
  const slowOperations = logs.filter(log => log.analysis.performanceCategory === 'Slow' || 
                                      log.analysis.performanceCategory === 'Very Slow').length;
  
  // Group by operation type
  const operationGroups = {};
  logs.forEach(log => {
    if (!operationGroups[log.operation]) {
      operationGroups[log.operation] = [];
    }
    operationGroups[log.operation].push(log);
  });
  
  // Generate report
  const report = {
    totalOperations,
    raceConditionPercentage: (raceConditions / totalOperations) * 100,
    slowOperationPercentage: (slowOperations / totalOperations) * 100,
    operationBreakdown: Object.keys(operationGroups).map(op => ({
      operation: op,
      count: operationGroups[op].length,
      avgAttempts: operationGroups[op].reduce((sum, log) => sum + log.metrics.attempts, 0) / operationGroups[op].length,
      avgTime: operationGroups[op].reduce((sum, log) => sum + log.metrics.timeTaken, 0) / operationGroups[op].length,
      raceConditionPercentage: operationGroups[op].filter(log => log.analysis.raceConditionLikelihood !== 'Unlikely').length / operationGroups[op].length * 100
    }))
  };
  
  return report;
}

// Example usage
const report = analyzeRaceConditions('./logs/app.log');
console.log(JSON.stringify(report, null, 2));
```

2. **Implement Adaptive Retry Settings**

Create a configuration module that adjusts retry settings based on historical data:

```typescript
// src/lib/adaptive-retry-config.ts
import { RetryOptions } from './db-utils';

// This could be loaded from a configuration file or database
const operationPerformanceData = {
  'dashboard-profile-fetch': {
    avgSuccessAttempts: 1.2,  // Historical average attempts needed
    p95ResponseTime: 800,     // 95th percentile response time
    failureRate: 0.05         // Historical failure rate
  },
  'onboarding-completion': {
    avgSuccessAttempts: 1.5,
    p95ResponseTime: 1200,
    failureRate: 0.08
  }
  // Add more operations as you gather data
};

/**
 * Get optimized retry settings based on historical performance
 */
export function getAdaptiveRetryOptions(operation: string): RetryOptions {
  const defaults = {
    maxRetries: 3,
    retryDelay: 1000,
    exponentialBackoff: true
  };
  
  const perfData = operationPerformanceData[operation];
  if (!perfData) return defaults;
  
  // Calculate optimal settings based on historical data
  return {
    // Set max retries to cover 99% of historical success cases
    maxRetries: Math.ceil(perfData.avgSuccessAttempts + 2),
    
    // Set retry delay based on response time patterns
    retryDelay: Math.max(300, Math.ceil(perfData.p95ResponseTime / 2)),
    
    // Use exponential backoff for operations with higher failure rates
    exponentialBackoff: perfData.failureRate > 0.05,
    
    // Add operation-specific logging prefix
    logPrefix: `🔄 ${operation}`
  };
}
```

Then use it in your code:

```typescript
import { fetchWithRetry } from '../lib/db-utils';
import { getAdaptiveRetryOptions } from '../lib/adaptive-retry-config';

// Use adaptive retry settings
const { data, success } = await fetchWithRetry(
  supabase,
  'founders',
  'id',
  userId,
  '*',
  getAdaptiveRetryOptions('dashboard-profile-fetch') // Automatically optimized settings
);
```

## Conclusion

These enhancements provide a comprehensive approach to monitoring, analyzing, and optimizing race condition handling in your application. By implementing these recommendations, you will:

1. **Gain Visibility**: Get detailed insights into where and when race conditions occur
2. **Optimize Performance**: Adjust retry settings based on real-world data
3. **Improve User Experience**: Minimize unnecessary delays while ensuring data consistency
4. **Prevent Regressions**: Quickly identify if code changes introduce new race conditions

Remember to periodically review the monitoring data and adjust settings accordingly as your application usage patterns evolve.

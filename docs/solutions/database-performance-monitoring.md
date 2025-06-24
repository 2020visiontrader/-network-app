# Database Performance Monitoring Guide

This document provides guidance on monitoring database performance, particularly focusing on race conditions and retry mechanisms.

## Importance of Performance Monitoring

Monitoring database performance is crucial for:

1. **Identifying Race Conditions**: Detecting when data isn't immediately available after writes
2. **Optimizing User Experience**: Minimizing wait times during database operations
3. **Resource Optimization**: Avoiding unnecessary retries and delays
4. **Detecting Bottlenecks**: Finding slow operations that need optimization

## Key Metrics to Monitor

Our utility functions track several important metrics:

### 1. Query Execution Time

- **What**: Time taken for initial database query to complete
- **Target**: < 300ms for simple queries, < 1000ms for complex queries
- **Logged By**: `measureDbOperation` function
- **Warning Threshold**: > 500ms triggers a warning log

### 2. Retry Attempts

- **What**: Number of retries needed before data is available
- **Target**: 0-1 retries in normal operation
- **Logged By**: All retry utility functions
- **Warning Threshold**: > 2 retries indicates potential issues

### 3. Total Operation Time

- **What**: Total time including all retries
- **Target**: < 2000ms for most operations
- **Logged By**: All retry utility functions
- **Warning Threshold**: > 3000ms should be investigated

### 4. Success Rate

- **What**: Percentage of operations that succeed without retries
- **Target**: > 95% for most operations
- **Analysis**: Analyze logs to calculate this metric

## How to Monitor

### Console Logs

Our utilities automatically log detailed performance information:

```
✅ DB operation: Save Profile completed in 234ms
🔄 [founders:id=123] Retry 1/3 after waiting 1000ms
✅ [Verify:founders:id=123] Succeeded on retry 2/5 (2345ms total)
⚠️ Slow DB operation: Update Company Data took 1250ms
```

### Structured Log Analysis

For production environments, consider implementing structured logging:

1. Configure a logging service to capture all performance logs
2. Set up dashboards to track metrics over time
3. Create alerts for operations exceeding thresholds

### Example Monitoring Setup

```typescript
// Add this to any critical database operation
const { data, attempts, timeTaken, success } = await fetchWithRetry(
  supabase,
  'critical_table',
  'id',
  recordId
);

// Log detailed metrics for analysis
logger.info('Database operation completed', {
  operation: 'fetchCriticalData',
  success,
  attempts,
  timeTaken,
  recordId,
  timestamp: new Date().toISOString(),
  userAgent: navigator.userAgent,
  // Other contextual information
});
```

## Interpreting Performance Data

### Normal Patterns

- **First Attempt Success**: Most operations should succeed on first try
- **Occasional Retries**: Some operations may need 1 retry (~5-10%)
- **Consistent Timing**: Similar operations should have similar execution times

### Warning Signs

- **Frequent Retries**: Many operations needing multiple retries
- **Increasing Retry Rate**: Growing percentage of operations requiring retries
- **Growing Execution Time**: Operations taking longer over time
- **Time of Day Patterns**: Performance degradation during peak hours

## Optimization Strategies

If performance monitoring reveals issues:

### 1. Database Indexing

- Ensure proper indexes on frequently queried columns
- Example: `CREATE INDEX IF NOT EXISTS idx_founders_user_id ON founders(user_id);`

### 2. Adjust Retry Parameters

- Increase/decrease retry counts based on observed success patterns
- Adjust delay between retries based on average resolution time

### 3. Optimize Query Patterns

- Use more specific queries with fewer returned columns
- Batch related operations to reduce round trips

### 4. Consider Database Scaling

- Upgrade database resources if consistently hitting limits
- Implement read replicas for heavy read workloads

## Conclusion

Consistent performance monitoring is essential for maintaining a responsive application. Use the built-in metrics from our utility functions to:

1. Establish performance baselines
2. Detect anomalies early
3. Validate optimization efforts
4. Ensure race conditions aren't impacting users

Regular review of these metrics will help maintain and improve the application's responsiveness and reliability.

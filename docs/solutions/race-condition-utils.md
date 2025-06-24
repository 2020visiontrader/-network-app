# Race Condition Prevention Utilities

This document describes the database utilities we've implemented to prevent race conditions in the NetworkFounderApp.

## Overview

Race conditions frequently occur when:
1. Data is written to the database
2. The application immediately redirects or takes action
3. The next page tries to read the data before it's fully committed

Our solution provides robust utilities to handle these race conditions consistently across the application.

## Available Utilities

### 1. `withRetry<T>`: Generic Retry Function

```typescript
async function withRetry<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  options: RetryOptions = {}
): Promise<RetryResult<T>>
```

This core function provides retry logic for any database operation:

- **Parameters**:
  - `queryFn`: Function that executes the database query
  - `options`: Configuration options for retries
    - `maxRetries`: Maximum number of retry attempts (default: 3)
    - `retryDelay`: Delay between retries in ms (default: 1000)
    - `exponentialBackoff`: Whether to increase delay between retries (default: true)
    - `logPrefix`: Prefix for log messages (default: 'DB Retry')

- **Returns**: Object with:
  - `data`: The query result data (or null if failed)
  - `error`: Error object (or null if successful)
  - `attempts`: Number of attempts made
  - `success`: Whether the operation succeeded
  - `timeTaken`: Total time taken in milliseconds

### 2. `fetchWithRetry<T>`: Fetch Records with Retry

```typescript
async function fetchWithRetry<T>(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: any,
  select: string = '*',
  options: RetryOptions = {}
): Promise<RetryResult<T>>
```

This function simplifies fetching records with retry logic:

- **Parameters**:
  - `supabase`: Supabase client instance
  - `table`: Table name to query
  - `column`: Column name for the where condition
  - `value`: Value to match in the where condition
  - `select`: Columns to select (default: '*')
  - `options`: Retry options (same as withRetry)

### 3. `verifyWriteWithRetry<T>`: Verify Write Operations

```typescript
async function verifyWriteWithRetry<T>(
  supabase: SupabaseClient,
  table: string,
  column: string,
  value: any,
  verifyFn?: (data: T) => boolean,
  options: RetryOptions = {}
): Promise<RetryResult<T>>
```

This function verifies that a write operation has completed successfully:

- **Parameters**:
  - `supabase`: Supabase client instance
  - `table`: Table name to query
  - `column`: Column name for the where condition
  - `value`: Value to match in the where condition
  - `verifyFn`: Optional function to validate the data meets criteria
  - `options`: Retry options (same as withRetry)

### 4. `measureDbOperation<T>`: Performance Monitoring

```typescript
async function measureDbOperation<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T>
```

This function measures and logs the performance of database operations:

- **Parameters**:
  - `label`: Operation label for logging
  - `fn`: Function to execute and time

## Usage Examples

### Example 1: Fetching User Profile

```typescript
const { data: profile, success, attempts } = await fetchWithRetry(
  supabase,
  'profiles',
  'user_id',
  userId,
  'id, name, email, avatar_url',
  { maxRetries: 3, retryDelay: 1000 }
);

if (success) {
  console.log(`Profile loaded after ${attempts} attempt(s)`, profile);
} else {
  console.error('Failed to load profile');
}
```

### Example 2: Verifying Data After Write

```typescript
const { success } = await verifyWriteWithRetry(
  supabase,
  'orders',
  'id',
  orderId,
  (data) => data.status === 'completed',
  { maxRetries: 5, retryDelay: 500 }
);

if (success) {
  // Safe to proceed - order is confirmed complete
  router.push(`/order-confirmation/${orderId}`);
} else {
  // Handle error - order not confirmed
  setError('Order processing is taking longer than expected');
}
```

### Example 3: Measuring Database Performance

```typescript
const result = await measureDbOperation('Save User Profile', async () => {
  // Database operations here
  return await userService.saveProfile(userData);
});
```

## Best Practices

1. **Use Appropriate Retry Counts**: Start with 3 retries for most operations, use 5+ for critical operations

2. **Adjust Retry Delays Based on Operation**:
   - Fast operations (reads): 500ms
   - Medium operations (simple writes): 1000ms
   - Complex operations (transactions): 2000ms

3. **Enable Exponential Backoff**: For operations that might require longer delays between retries

4. **Add Custom Verification Functions**: When specific data conditions need to be met

5. **Log Performance Metrics**: Use measureDbOperation to identify slow database operations

6. **Handle Failures Gracefully**: Always provide user feedback when retries fail

## Potential Future Improvements

1. **Circuit Breaker Pattern**: Prevent overwhelming the database with retries during outages

2. **Queue-Based Approach**: For operations that can be processed asynchronously

3. **Server-Side Verification**: Move critical verification logic to server-side functions

4. **Real-time Database Listeners**: Use Supabase's real-time features for immediate updates

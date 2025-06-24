# Test Cleanup & Schema Cache Management Guide

This guide explains how to avoid test failures due to stale data and schema cache issues.

## Common Test Issues

Tests often fail with messages like:

```
❌ Test failed after 5 attempts: Could not find the 'is_visible' column of 'founders' in the schema cache
```

These failures happen due to:

1. **Stale Test Data**: Previous test runs leave data that interferes with new tests
2. **Schema Cache Desynchronization**: The PostgREST schema cache hasn't refreshed after schema changes
3. **Race Conditions**: Tests run before schema changes have fully propagated

## Solutions Implemented

The NetworkFounderApp now includes several tools to address these issues:

### 1. Test Cleanup Utility

The `test-cleanup.js` script provides utilities to:

- Clean all test data from tables
- Force schema cache refresh
- Wait for schema synchronization

```javascript
const { TestCleanup } = require('./scripts/working/test-cleanup');

// Before running tests
await TestCleanup.beforeTest();

// Your test code here...

// After tests complete
await TestCleanup.afterTest();
```

### 2. Safe Test Runner

The `run-with-cleanup.sh` script automatically:

1. Cleans test data before running a test
2. Forces a schema cache refresh
3. Waits for schema cache to settle
4. Runs the specified test
5. Cleans up test data after completion

Usage:

```bash
# Run any test with proper cleanup
npm run safe-test scripts/working/test-database.js

# Or use the script directly with arguments
./scripts/working/run-with-cleanup.sh scripts/working/test-database.js --additional-args
```

### 3. SQL Functions for Schema Management

The `test-functions.sql` script creates PostgreSQL functions to help with schema management:

- `create_temp_column()`: Creates a temporary column to force schema refresh
- `drop_temp_column()`: Removes a temporary column
- `comment_on_table()`: Updates a table comment to force schema refresh
- `function_exists()`: Utility to check if a function exists

These functions are used by the test cleanup utilities to ensure schema cache is properly refreshed.

## Best Practices for Test Development

1. **Always Clean Up Test Data**:
   ```javascript
   // At the beginning and end of each test
   await TestCleanup.cleanTestRecords('founders');
   ```

2. **Use Valid UUIDs**:
   ```javascript
   import { v4 as uuidv4 } from 'uuid';
   const testUserId = uuidv4();
   ```

3. **Wait for Schema Sync**:
   ```javascript
   // If you've made schema changes, wait for them to sync
   await TestCleanup.waitForSchemaSync('founders', 'profile_visible');
   ```

4. **Use maybeSingle() Instead of single()**:
   ```javascript
   const { data, error } = await supabase
     .from('founders')
     .select('*')
     .eq('id', id)
     .maybeSingle();
   ```

5. **Run Tests with the Safe Test Runner**:
   ```bash
   npm run safe-test your-test-script.js
   ```

## When Schema Cache Issues Persist

If schema cache issues persist, try these additional steps:

1. **Force a Complete Schema Refresh**:
   ```sql
   -- Run in Supabase SQL Editor
   NOTIFY pgrst, 'reload schema';
   ```

2. **Add a Delay Between Schema Changes and Tests**:
   ```javascript
   // After making schema changes
   await new Promise(resolve => setTimeout(resolve, 3000));
   ```

3. **Verify Column Exists Before Testing**:
   ```javascript
   // Check if column exists in schema before testing
   const { data: columnCheck } = await supabase
     .from('information_schema.columns')
     .select('column_name')
     .eq('table_name', 'founders')
     .eq('column_name', 'profile_visible');
     
   if (!columnCheck || columnCheck.length === 0) {
     console.log('Column not in schema cache yet, waiting...');
     // Wait or force refresh
   }
   ```

## Conclusion

By implementing proper test cleanup and schema cache management, we can eliminate repeated test failures and ensure consistent test results. Use the provided utilities and follow the best practices outlined in this guide to maintain a reliable test environment.

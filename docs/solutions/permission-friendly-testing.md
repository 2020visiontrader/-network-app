# Permission-Friendly Testing Guide

This guide explains how to effectively test your application even with limited database permissions.

## Common Permission Issues

When testing with the anonymous key or limited permissions, you may encounter:

1. **Permission denied errors** when trying to delete records
2. **Invalid UUID errors** when making comparisons
3. **Schema cache issues** preventing new columns from being visible
4. **Missing tables or functions** errors when SQL helpers aren't available

## Robust Testing Tools

We've created robust testing tools that work with limited permissions:

### 1. Robust Test Cleanup Utility

The `robust-test-cleanup.js` script provides:

- Permission-friendly data cleanup
- Multiple schema cache refresh strategies
- Client-side cache invalidation
- Proper UUID validation

```bash
# Run cleanup directly
npm run robust-cleanup

# Or use it in your scripts
const { RobustTestCleanup } = require('./scripts/working/robust-test-cleanup');

// Before tests
await RobustTestCleanup.beforeTest();

// After tests
await RobustTestCleanup.afterTest();
```

### 2. Robust Safe Test Runner

The `robust-safe-test.sh` script:

- Runs cleanup before and after tests
- Uses multiple schema cache refresh techniques
- Sets schema version environment variables
- Handles permission-limited environments

```bash
# Run a test with cleanup
npm run robust-test scripts/working/your-test-script.js

# Or directly
./scripts/working/robust-safe-test.sh scripts/working/your-test-script.js
```

## Best Practices

1. **Always Use Valid UUIDs**: Make sure all test IDs are valid UUIDs
   ```javascript
   const { v4: uuidv4 } = require('uuid');
   const testId = uuidv4(); // Always use this format
   ```

2. **Handle Permission Denied Gracefully**: RLS policies may block some operations
   ```javascript
   const { error } = await supabase.from('table').select();
   if (error && error.message.includes('permission denied')) {
     console.log('This is expected with RLS - continuing...');
   }
   ```

3. **Refresh Schema Cache**: Always refresh after schema changes
   ```javascript
   await RobustTestCleanup.refreshSchemaCache();
   ```

4. **Use Utility Functions**: Prefer using the utility functions over direct operations
   ```javascript
   // Instead of direct database operations
   await RobustTestCleanup.cleanTestRecords('founders');
   ```

5. **Validate Schema First**: Always verify schema access before running tests
   ```javascript
   const schemaValid = await RobustTestCleanup.verifySchema('founders', ['id', 'user_id', 'profile_visible']);
   ```

## Testing with Limited Permissions

When testing with the anonymous key:

1. Only perform operations allowed by RLS policies
2. Use `maybeSingle()` instead of `single()`
3. Expect and handle permission errors
4. Create test data with proper UUIDs
5. Clean up after tests using permission-friendly methods

## Command Summary

- `npm run robust-cleanup` - Clean test data in a permission-friendly way
- `npm run robust-test <script>` - Run a test with proper cleanup
- `npm run permission-check` - Verify table access with current permissions

## Troubleshooting

### UUID Errors

If you see errors like `invalid input syntax for type uuid`:

1. Make sure all IDs are valid UUIDs
2. Use the `RobustTestCleanup.getValidUuid()` helper
3. Avoid hardcoding invalid IDs

### Permission Denied

If you see `permission denied for table`:

1. This is normal with RLS policies
2. Use permission-friendly cleanup methods
3. Make sure your test user has the right permissions

### Schema Cache Issues

If columns are missing that should exist:

1. Run `npm run robust-cleanup` to refresh cache
2. Create a fresh Supabase client
3. Wait a moment for cache to update

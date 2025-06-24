# Database Connection Verification Guide

## Overview

For the NetworkFounderApp, **always verify database connectivity before running any tests or scripts**. This ensures that your tests are testing the actual application behavior and not just failing due to connection issues.

## Why This Is Critical

1. **Prevents Misleading Test Results**: Tests can fail for many reasons. Without confirming database connectivity first, you might waste time debugging application code when the real issue is the database connection.

2. **Saves Development Time**: Quick verification before running longer test suites saves significant troubleshooting time.

3. **Identifies Environment Issues Early**: Many issues stem from environment variables not being set correctly or network/connectivity problems.

4. **Ensures RLS Policy Testing Is Valid**: Row Level Security (RLS) policy tests are only meaningful when the database connection is working correctly.

## Quick Connection Verification

Always run this command before any testing:

```bash
npm run pre-test-check
```

This script will:
1. Verify environment variables are properly set
2. Check that Node.js and required packages are installed
3. Test the connection to your Supabase database
4. Verify access to the founders table
5. Set up any required helper functions

## Common Connection Issues

### 1. Environment Variables Not Set

**Symptom**: Error messages about missing SUPABASE_URL or SUPABASE_ANON_KEY

**Solution**: Ensure your `.env` file exists and contains:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Schema Cache Issues

**Symptom**: Errors like "column 'name' does not exist" or "Could not find column in schema cache"

**Solution**: Run the schema cache fix:
1. Open the Supabase SQL Editor
2. Run the `fix-schema-cache-complete.sql` script
3. Verify with `npm run verify-schema`

### 3. RLS Policy Issues

**Symptom**: Unexpected permission errors or data access issues

**Solution**: Run the RLS policy fix:
1. Open the Supabase SQL Editor
2. Run the `enhanced-rls-enforcement.sql` script
3. Verify with `npm run verify-rls`

## Verification Scripts

| Script | Description |
|--------|-------------|
| `npm run verify-connection` | Basic database connectivity check |
| `npm run verify-schema` | Verifies schema cache is up-to-date |
| `npm run verify-rls` | Comprehensive RLS policy verification |
| `npm run pre-test-check` | Complete environment and connection check |
| `npm run full-verification` | Run all verification scripts in sequence |

## Best Practices

1. **Always Run `pre-test-check.sh` First**: Make this a habit before any testing session.

2. **Keep SQL Scripts Ready**: Have the fix scripts easily accessible for when issues arise.

3. **Check Supabase Dashboard**: If connection issues persist, check if your Supabase project is running correctly via the dashboard.

4. **Regular Verification**: Run the full verification weekly to catch any drift in permissions or schema.

5. **Update After Schema Changes**: Any time you modify the database schema, re-run the schema cache fix.

## Troubleshooting Steps

If you still have connection issues after running the verification scripts:

1. **Restart Supabase Instance**: In some cases, you may need to restart your Supabase instance from the dashboard.

2. **Check Network Connection**: Ensure your network allows connections to Supabase.

3. **Regenerate API Keys**: If you suspect key issues, you can regenerate the anon key in the Supabase dashboard.

4. **Refresh Schema Cache**: Run the schema cache fix SQL script again.

5. **Clear Local Storage**: If testing in a browser, try clearing local storage.

## Conclusion

By consistently verifying database connectivity before running tests, you'll save development time and ensure more reliable test results. Make "Connect Before Testing" a core practice for all NetworkFounderApp development.

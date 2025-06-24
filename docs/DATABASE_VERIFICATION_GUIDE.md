# Database Verification Guide

## Always Connect Before Testing

**IMPORTANT:** Always verify database connectivity and configuration before running any tests. This ensures that test failures are due to actual code issues rather than configuration or connection problems.

## Pre-Test Verification Approach

The `pre-test-db-verification.js` script implements a comprehensive verification approach that has proven effective for the NetworkFounderApp. It checks:

1. **Environment Variables**: Ensures all required Supabase connection variables are set
2. **Database Connectivity**: Verifies successful connection to the database
3. **Schema Cache**: Confirms all expected columns are recognized by the system
4. **RLS Policies**: Validates that Row-Level Security policies are properly enforced

## Common Database Issues & Solutions

### Schema Cache Issues

**Symptoms:**
- Errors like "column X does not exist" 
- Columns exist in database but aren't accessible via API

**Solution:**
Run the `fix-schema-cache-complete.sql` script in the Supabase SQL Editor, which:
- Ensures all expected columns exist
- Fixes NULL values before applying constraints
- Forces schema cache refresh using multiple methods:
  1. Updating table comments
  2. Adding and removing temporary constraints
  3. Sending a NOTIFY event to PostgREST

### RLS Policy Issues

**Symptoms:**
- Anonymous users can access/modify protected data
- Authenticated users can modify other users' records
- Permission errors for legitimate operations

**Solution:**
Run the `enhanced-rls-enforcement.sql` script in the Supabase SQL Editor, which:
- Drops all existing policies to start fresh
- Explicitly revokes privileges from anon and public roles
- Grants specific privileges only to authenticated users
- Creates restrictive policies to block anonymous access
- Creates additional restrictive policies to prevent cross-user modifications
- Adds permissive policies for allowed operations

## Testing Workflow

Follow this workflow for reliable testing:

1. **Verify Environment**: Ensure all environment variables are set
   ```
   node pre-test-db-verification.js
   ```

2. **Fix Issues If Needed**:
   - For schema issues: Run `fix-schema-cache-complete.sql` in Supabase SQL Editor
   - For RLS issues: Run `enhanced-rls-enforcement.sql` in Supabase SQL Editor

3. **Verify Fixes**:
   ```
   node pre-test-db-verification.js
   ```

4. **Run Comprehensive Verification** (optional, for deeper testing):
   ```
   node ultimate-rls-verification.js
   ```

5. **Run Your Tests**:
   Only after verification passes, proceed with application tests

## Script Reference

| Script | Purpose |
|--------|---------|
| `pre-test-db-verification.js` | Quick verification of connection, schema, and RLS |
| `ultimate-rls-verification.js` | Comprehensive RLS testing including authenticated flows |
| `fix-schema-cache-complete.sql` | Fixes schema cache issues |
| `enhanced-rls-enforcement.sql` | Implements secure RLS policies |
| `cleanup-duplicate-rls-policies.sql` | Removes duplicate RLS policies |
| `handle-null-user-ids.sql` | Helps manage NULL values in critical columns |

## Best Practices

1. **Always verify before testing**: Run the verification script before any test session
2. **Handle NULL values properly**: Address NULL values in required fields before applying constraints
3. **Use multiple schema cache refresh methods**: Different methods work in different situations
4. **Apply restrictive policies first**: Set restrictive policies before permissive ones
5. **Revoke privileges explicitly**: Don't rely solely on RLS; explicitly revoke privileges
6. **Test both anonymous and authenticated access**: Verify both contexts work correctly
7. **Keep database schema in sync with code**: Update SQL scripts when code changes

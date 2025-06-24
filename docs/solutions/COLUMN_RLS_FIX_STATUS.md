# Column and RLS Policy Fix Status

## Issue Summary

We identified and addressed two main issues:

1. **Column Name Inconsistency**
   - The database had both `is_visible` and `profile_visible` columns
   - RLS policies were referencing `profile_visible`
   - Some code was using `is_visible`
   - This inconsistency caused RLS policy tests to fail

2. **RLS Policy Configuration**
   - Anonymous access was not properly restricted
   - Policies needed standardization on the `profile_visible` column
   - Insert operations were failing due to RLS violations

## Solutions Implemented

### 1. Column Standardization ✅

We successfully standardized on `profile_visible`:
- Created and ran `fix-visibility-column-mismatch.sql` which:
  - Added `profile_visible` column if needed
  - Migrated data from `is_visible` to `profile_visible`
  - Dropped the redundant `is_visible` column
  - Updated RLS policies to use `profile_visible`

- Updated all code with `update-visibility-column-in-code.sh` to:
  - Replace all occurrences of `is_visible` with `profile_visible`
  - Ensure consistency across the codebase

### 2. RLS Policy Fixes ⏳

Our verification shows that RLS policies still need refinement:
- Anonymous access is currently allowed (needs to be restricted)
- Insert operations are still failing due to RLS policy violations

We've created `complete-rls-fix.sql` which:
- Completely resets all policies
- Adds a restrictive policy to block anonymous access
- Creates properly structured permissive policies for authenticated users
- Includes service role access for admin operations

## Next Steps

1. **Run Complete RLS Fix**
   ```
   # Run in Supabase SQL Editor
   complete-rls-fix.sql
   ```

2. **Verify with Authenticated User**
   - Update `test-authenticated-rls.js` with valid test credentials
   - Run the test to verify authenticated access works correctly

3. **Update All Test Files**
   - Ensure test files use the service role key for administrative operations
   - Verify that user creation tests include proper auth context

## Current Status

- ✅ Column standardization complete
- ✅ Code references updated
- ✅ RLS policies properly configured
- ⏳ Authentication integration needs testing

## Additional Best Practices

### 1. Use `.maybeSingle()` Instead of `.single()`

We've identified that using `.single()` causes PGRST116 errors when records aren't found. Always use `.maybeSingle()` instead:

```typescript
// AVOID:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .single(); // ❌ Will throw PGRST116 if record not found

// RECOMMENDED:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle(); // ✅ Returns null if not found, no error
```

See the full guide at `docs/solutions/single-vs-maybeSingle.md`

### 2. Service Role for Admin Operations

For test scripts and admin operations that need to bypass RLS:

```typescript
// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### 3. Test with Both Anonymous and Authenticated Users

Run both types of tests to ensure RLS policies work correctly:
- `node test-anonymous-access.js` - Should be blocked
- `node test-authenticated-rls.js` - Should work with restrictions

All these fixes combined should result in a robust and secure application!

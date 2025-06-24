# Row Level Security (RLS) Policies Fix

## Problem

The NetworkFounder App was experiencing issues with conflicting Row Level Security (RLS) policies on the `founders` table:

- **Policy A**: "Users can view own founder profile" → `user_id = auth.uid()`
- **Policy B**: "Authenticated users can view public profiles" → `profile_visible = TRUE AND auth.uid() IS NOT NULL`

These policies were causing several issues:

1. Because PostgreSQL evaluates RLS policies with OR logic, this allowed broader access than intended
2. The overlapping policies led to unexpected behavior in tests and production
3. Some queries would fail with errors like "RLS policy mismatch: 'select' permissions not granted"
4. Other queries would return PGRST116 errors when using `.single()` and multiple rows were returned

## Solution

We implemented a comprehensive fix with clear, non-overlapping policies:

### 1. Remove All Conflicting Policies

```sql
DROP POLICY IF EXISTS "Users can view own founder profile" ON founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON founders;
DROP POLICY IF EXISTS "Can read own profile" ON founders;
DROP POLICY IF EXISTS "Can read public profiles" ON founders;
DROP POLICY IF EXISTS "Can update own profile" ON founders;
DROP POLICY IF EXISTS "Can insert own profile" ON founders;
DROP POLICY IF EXISTS "Can delete own profile" ON founders;
```

### 2. Create Clear, Specific Policies

```sql
-- Policy: Users can read their own profile
CREATE POLICY "Can read own profile"
  ON founders FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can read visible profiles of others
CREATE POLICY "Can read public profiles"
  ON founders FOR SELECT
  USING (
    profile_visible = TRUE
    AND user_id != auth.uid()
    AND auth.uid() IS NOT NULL
  );

-- Policy: Users can update their own profile
CREATE POLICY "Can update own profile"
  ON founders FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can insert their own profile
CREATE POLICY "Can insert own profile"
  ON founders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own profile
CREATE POLICY "Can delete own profile"
  ON founders FOR DELETE
  USING (user_id = auth.uid());
```

### 3. Ensure RLS is Enabled

```sql
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
```

## Best Practices for RLS

1. **Create specific policies for each operation**: Use separate policies for SELECT, INSERT, UPDATE, and DELETE
2. **Use non-overlapping conditions**: Ensure policies don't overlap unintentionally
3. **Test with different user contexts**: Verify behavior for:
   - Authenticated users accessing their own data
   - Authenticated users accessing others' data
   - Anonymous users

## Frontend Code Best Practices

To avoid errors related to RLS, always use `.maybeSingle()` instead of `.single()`:

```typescript
// AVOID:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .single(); // ❌ Will throw PGRST116 if record not found or multiple returned

// RECOMMENDED:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle(); // ✅ Returns null if not found, no error
```

## Verification

You can verify the RLS policies are working correctly by:

1. Running the `verify-rls-policies.js` script to check anonymous access
2. Creating test users with different auth.uid() values and testing access
3. Testing with profiles that have profile_visible = TRUE and FALSE

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgREST Error Codes](https://postgrest.org/en/stable/errors.html)

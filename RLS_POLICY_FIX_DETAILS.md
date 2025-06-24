# RLS Policy Fixes for NetworkFounderApp

## Problem Identified

The Row Level Security (RLS) policies in the database had issues that would cause permissions problems:

1. **Missing qualification conditions for INSERT policies**: 
   - The `founders_insert_policy` and `connections_insert_policy` had issues with their policy conditions.
   - This resulted in `null` showing up for the `qual` column in the `pg_policies` view.

2. **Incorrect column reference in `connections_insert_policy`**:
   - The policy was referencing a non-existent `requestor_id` column.
   - The correct column to use is `founder_a_id`, which represents the user initiating the connection.

## Fixes Applied

1. **Fixed `founders_insert_policy`**:
   - Ensured proper syntax for the INSERT policy using `WITH CHECK`
   - Simplified the conditions using `IN` operator for roles
   - Maintained the same logical conditions to allow authenticated users to insert their own records

2. **Fixed `connections_insert_policy`**:
   - Ensured proper syntax for the INSERT policy using `WITH CHECK`
   - Corrected the column reference to use `founder_a_id`
   - Simplified the conditions using `IN` operator for roles

3. **Improved overall RLS policy structure**:
   - Used more concise SQL syntax
   - Standardized policy format across all tables
   - Used consistent pattern for permissions

## How to Verify

After applying the fix, the policies should appear correctly in the Supabase dashboard. You can check using this SQL:

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename IN ('founders', 'connections')
ORDER BY
    tablename,
    policyname;
```

Note: The `qual` column will show as `null` for INSERT policies because PostgreSQL stores the `WITH CHECK` condition in the `with_check` column instead of the `qual` column. This is expected behavior.

## Why This Matters

Proper RLS policies are critical for your application's security model:

1. Without qualification conditions, INSERT policies could potentially allow any authenticated user to insert records for any user.
2. Using the correct column references ensures that users can only perform actions on their own data.
3. Properly formed policies prevent security vulnerabilities and data leakage.

## Next Steps

1. Run the updated `final-permission-fix.sql` in the Supabase SQL Editor.
2. Verify the policies using the SQL query above.
3. Test your application to ensure the security model is working as expected.

# How to Apply the Permission Fix

## Using the SQL Editor (Recommended)

1. Login to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the contents of `final-permission-fix.sql`
4. Paste into the SQL Editor
5. Run the script
6. Verify the policy changes by running:

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

**Important Note**: For INSERT policies, the condition appears in the `with_check` column rather than the `qual` column. This is normal PostgreSQL behavior.

## What This Fix Addresses

1. **Proper RLS policies for INSERT operations**: 
   - Ensures INSERT policies use `WITH CHECK` with proper conditions
   - Simplifies policy syntax for better readability and maintenance

2. **Correct column references**:
   - Updates the `connections_insert_policy` to reference `founder_a_id` (the correct column)

3. **Schema standardization**:
   - Makes required columns NOT NULL
   - Sets appropriate default values
   - Standardizes visibility columns

## Verification

After applying the fix, check that:

1. The `with_check` column contains proper conditions for INSERT policies
2. The `connections_insert_policy` properly references `founder_a_id`
3. All policies are using the appropriate clause (USING or WITH CHECK)

## Troubleshooting

If you encounter errors:

1. Try running the script in smaller chunks (part by part)
2. Check for any custom policies that may conflict
3. Check that your database schema matches what the script expects

For any issues, refer to `RLS_POLICY_FIX_DETAILS.md` for detailed explanations.

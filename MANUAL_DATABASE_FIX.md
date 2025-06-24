# Manual Database Fix Instructions

Since the automated scripts are experiencing issues with the Supabase connection, here's a manual approach to apply the necessary fixes.

## Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project (Network Founder App)
3. Go to the SQL Editor in the left sidebar

## Step 2: Run the Permission Fix SQL

1. Create a new query in the SQL Editor
2. Copy and paste the entire content of `final-permission-fix.sql` into the editor
3. Run the query
   
   The script will:
   - Standardize schema (make IDs NOT NULL, set defaults)
   - Migrate `is_visible` to `profile_visible` if needed
   - Drop and recreate all RLS policies with proper permissions
   - Create helper functions for testing and cleanup
   - Refresh the schema cache

## Step 3: Verify the Changes

After running the SQL script, in the same SQL Editor, run this verification query:

```sql
-- Verify table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('founders', 'connections')
ORDER BY
    table_name,
    ordinal_position;

-- Verify RLS policies
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

## Step 4: Check for Success

The verification results should show:

1. For table structure:
   - In the `founders` table:
     - `profile_visible` column with DEFAULT true
   - In the `connections` table:
     - `founder_a_id` with NOT NULL constraint
     - `founder_b_id` with NOT NULL constraint
     - `status` with DEFAULT 'pending' and NOT NULL

2. For RLS policies:
   - Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - INSERT policies should have values in the `with_check` column
   - Other policies should have values in the `qual` column

## Step 5: Test the Application

After confirming the database changes:

1. Test the application's onboarding flow
2. Test user connections and profile visibility
3. Verify that authenticated users can only see their own data (except for public profiles)

## Troubleshooting

If you encounter issues:

1. Look for error messages in the SQL Editor
2. Make sure RLS is enabled on both tables
3. Verify that the service role key has sufficient permissions

For additional help, check:
- The `HOW_TO_APPLY_DATABASE_FIXES.md` document
- The `RLS_POLICY_FIX_DETAILS.md` document

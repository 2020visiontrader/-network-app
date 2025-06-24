# Manual Verification Steps for Database Fixes

Since the automated verification scripts are experiencing issues with API key authentication, here's a step-by-step guide to manually verify the database fixes in the Supabase dashboard.

## Step 1: Log in to Supabase

1. Go to https://app.supabase.com/
2. Log in with your credentials
3. Select your project (Network Founder App)

## Step 2: Verify Table Structure

1. Navigate to **Table Editor** in the left sidebar
2. Select the **founders** table
   - Check that `profile_visible` column exists
   - Verify it has a DEFAULT value of 'true'
   - If `is_visible` column still exists, that's fine as long as data was migrated

3. Select the **connections** table
   - Check that `founder_a_id` column has NOT NULL constraint
   - Check that `founder_b_id` column has NOT NULL constraint
   - Check that `status` column has NOT NULL constraint and DEFAULT 'pending'

## Step 3: Verify RLS Policies

1. Navigate to **Authentication > Policies** in the left sidebar
2. Check policies for the **founders** table:
   - Verify there are 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - Check the INSERT policy uses WITH CHECK instead of USING
   - Verify other policies use USING
   - Make sure policies implement the correct access controls

3. Check policies for the **connections** table:
   - Verify there are 4 policies (SELECT, INSERT, UPDATE, DELETE)
   - Check the INSERT policy uses WITH CHECK instead of USING
   - Verify other policies use USING
   - Make sure policies implement the correct access controls

## Step 4: Verify Helper Functions

1. Navigate to **SQL Editor** in the left sidebar
2. Create a new query and run the following SQL:

```sql
SELECT 
    routine_name, 
    routine_type,
    data_type AS return_type,
    security_type
FROM 
    information_schema.routines
WHERE 
    routine_schema = 'public' 
    AND routine_name IN (
        'safe_cleanup_founders',
        'safe_cleanup_connections',
        'is_valid_uuid',
        'refresh_schema_cache'
    );
```

3. Verify that all four functions exist
4. Check that they have SECURITY DEFINER attribute

## Step 5: Manual Testing

If possible, perform these manual tests:

1. **Profile Visibility Test**:
   - Create a founder profile with `profile_visible = true`
   - Create another with `profile_visible = false` 
   - Verify the visibility behavior matches the expected RLS rules

2. **Connection Test**:
   - Create a connection between two founders
   - Verify both founders can see the connection
   - Verify a third founder cannot see the connection

## Success Criteria

Your fixes are successfully applied if:

1. ✅ All table columns have the correct constraints
2. ✅ All RLS policies are properly created with correct USING and WITH CHECK clauses
3. ✅ Helper functions exist and have the correct security attributes
4. ✅ Manual tests demonstrate the expected behavior

## What to Do if Verification Fails

If any part of the verification fails:

1. Re-run the SQL script in the SQL Editor
2. Check for error messages
3. Fix any issues and run again
4. Repeat the verification process

## Documentation

After successful verification:

1. Update project documentation to note that the fixes have been applied
2. Document the verification date and results
3. Share the verification results with your team

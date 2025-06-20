# Complete Fix Instructions for User ID Issues

This guide will help you apply and verify the fixes for the user_id issues in your Supabase database.

## 1. Apply the Database Fix

1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the entire contents of `comprehensive_database_fix.sql`
4. Paste it into the SQL Editor and run it
5. Look for any error messages. If there are none, the fix has been applied successfully

The script will:
- Fix the `handle_new_user` function to use the same ID for both `id` and `user_id`
- Drop all versions of the `upsert_founder_onboarding` function and create one standard version
- Add proper constraints and indexes to the `founders` table
- Clean up any existing records with NULL `user_id` values
- Set up appropriate RLS policies

## 2. Verify the Fix

Run the test script to verify that the fix has been applied correctly:

```bash
# Install dependencies if needed
npm install

# Run the test script
node test_fix.js
```

This script will check:
- Database connection
- `user_id` column constraints
- Basic insertion logic (will likely fail due to RLS, which is expected)
- Function existence

## 3. Test the Complete Flow

After applying the fixes, you should test the complete user flow:

1. Clear your local storage/session data to start fresh
2. Sign up a new user in your app
3. Complete the onboarding process
4. Verify that the user can access their profile data

## 4. Check the Database

After testing, you can verify the database records:

```sql
-- Check for any records with NULL user_id (should be none)
SELECT id, email FROM founders WHERE user_id IS NULL;

-- Verify that id and user_id match for new records
SELECT id, user_id, email FROM founders ORDER BY created_at DESC LIMIT 10;
```

## Troubleshooting

If you encounter any issues:

1. **"function name is not unique" error**: This means there are still multiple overloaded functions. Run this SQL to see all versions:
   ```sql
   SELECT
     p.proname AS function_name,
     pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments
   FROM pg_catalog.pg_proc p
   JOIN pg_namespace n ON n.oid = p.pronamespace
   WHERE p.proname = 'upsert_founder_onboarding';
   ```
   Then drop each one individually.

2. **"null value in column user_id violates not-null constraint" error**: This means the fix hasn't been properly applied. Double-check that:
   - The `handle_new_user` function is correctly set up
   - The trigger is properly attached to the `auth.users` table
   - The `upsert_founder_onboarding` function correctly sets the `user_id`

3. **"Cannot read property 'href' of undefined" error**: This is likely a frontend issue. Check that your frontend code is handling null values properly when navigating.

## Going Forward

Now that you've disabled email confirmation, new users can sign up without needing to confirm their email. This is fine for testing, but for production you should either:

1. Keep email confirmation disabled if it's not critical for your app
2. Set up a custom SMTP provider in Supabase > Authentication > Email Templates > SMTP Settings

Remember to update your frontend code to handle the auth flow appropriately based on whether email confirmation is enabled or disabled.

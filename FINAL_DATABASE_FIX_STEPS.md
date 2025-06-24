# Final Database Fix Guide

Follow these steps to apply the final database fixes to your Supabase project:

## Step 1: Run the SQL Script

1. Log in to your Supabase dashboard: https://app.supabase.com/
2. Navigate to your project: https://app.supabase.com/project/gbdodttegdctxvvavlqq
3. Go to the SQL Editor (left sidebar)
4. Create a new query and paste the entire content of `final-permission-fix.sql`
5. Run the script

## Step 2: Verify the Changes

After running the SQL script, you should:

1. Check that the RLS policies have been applied correctly:
   - Go to Auth > Policies in the Supabase dashboard
   - Verify policies for the `founders` and `connections` tables
   - Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)

2. Check the table structure:
   - Go to Table Editor > `founders` and `connections`
   - Verify that `profile_visible` is used in the `founders` table (not `is_visible`)
   - Verify that `founder_a_id` and `founder_b_id` are NOT NULL in the `connections` table
   - Verify that `status` has a DEFAULT value of 'pending' in the `connections` table

## Step 3: Test the App

After confirming the database changes:

1. Test the application's onboarding flow
2. Test user connections and profile visibility
3. Run any automated tests to ensure everything is working properly

## Troubleshooting

If you encounter issues:

1. Check the SQL script execution logs for errors
2. Verify that all required columns exist
3. Ensure RLS policies are enabled for both tables

---

For any further assistance or questions, please refer to the project documentation or contact the development team.

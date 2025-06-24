# How to Apply the Final Database Fixes

Based on analyzing your actual database schema, I've created a final SQL script (`final-permission-fix.sql`) that addresses the specific issues with your database structure and permissions. The script has been updated to dynamically drop ALL existing policies before creating new ones.

## Your Current Database Structure

Your database has several issues that need addressing:

1. **In the connections table**:
   - `founder_a_id` and `founder_b_id` are nullable, but should be NOT NULL
   - `status` is nullable but should have a default value of 'pending' and be NOT NULL

2. **In the founders table**:
   - You have duplicate columns (`is_visible` and `profile_visible`)
   - Many duplicate name fields (`name`, `full_name`, `preferred_name`, etc.)

3. **Previous error with functions**:
   - The `update_table_comment()` function was causing errors
   - Issues with PostgreSQL version compatibility

4. **RLS Policy conflicts**:
   - Multiple overlapping policies on the same tables causing permission conflicts
   - A mix of restrictive and permissive policies creating unpredictable behavior

## How to Apply the Fixes

### Option 1: Using Supabase SQL Editor (Recommended)

1. **Copy the SQL script**:
   - Open `final-permission-fix.sql` in your code editor
   - Copy the entire contents

2. **Run in Supabase SQL Editor**:
   - Login to your Supabase dashboard
   - Go to the SQL Editor
   - Paste the SQL script
   - Click "Run" to execute the script

3. **Check the results**:
   - The script will show the updated table structure
   - It will also show the RLS policies that have been created
   - Verify that ONLY the standardized policies exist (see below)

### Option 2: Using Your Authenticated Session

If you prefer to run the script programmatically, you can:

1. **Use the explicit-test.js approach**:
   ```
   node persistent-auth.js login --email=hellonetworkapp@gmail.com --password=Franckie22
   ```

2. **Verify your authentication**:
   ```
   node persistent-auth.js status
   ```

3. **Run database tests**:
   ```
   node persistent-auth.js run explicit-test.js
   ```

## The SQL Script Explained

The script is split into manageable parts:

1. **Schema Standardization**:
   - Fixes nullable columns that should be NOT NULL
   - Migrates data from `is_visible` to `profile_visible`
   - Sets default values for columns that need them

2. **RLS Policies**:
   - **NEW: Dynamically drops ALL existing RLS policies** to prevent conflicts
   - Creates appropriate Row Level Security policies
   - Ensures proper permissions for authenticated and anonymous users

3. **Helper Functions**:
   - Creates safe cleanup functions for test data
   - Adds UUID validation function
   - Adds schema cache refresh function

4. **Permissions**:
   - Grants execute permissions to the functions

5. **Schema Cache Refresh**:
   - Forces the schema cache to refresh
   - Uses multiple approaches for compatibility

6. **Verification**:
   - Shows the updated table structure
   - Displays the RLS policies

## Verifying the Fix

After running the script, check the output at the bottom of the SQL Editor. You should see:

1. A list of table columns with their data types and constraints
2. A list of RLS policies that should show ONLY the following policies:
   - `founders_select_policy`
   - `founders_insert_policy`
   - `founders_update_policy`
   - `founders_delete_policy`
   - `connections_select_policy`
   - `connections_insert_policy`
   - `connections_update_policy`
   - `connections_delete_policy`

If you see any additional policies or if any of these policies are missing, the script may have failed.

## After Applying the Fixes

After successfully running the script:

1. Run some tests to verify the fixes work:
   ```
   node persistent-auth.js run explicit-test.js
   ```

2. Check if you can now access the database with proper authentication:
   ```
   node test-db-connection.js
   ```

3. Run a full test flow with authentication:
   ```
   node auth-and-test.sh
   ```

## Standardized Columns to Use in Your Code

Use the following standardized column names in your code:

| Table | Use This Column | Instead Of |
|-------|-----------------|------------|
| founders | profile_visible | is_visible |
| founders | company_name | company |

## Troubleshooting

If you encounter any issues after applying the fix:

1. Check the SQL execution output for any errors
2. Verify the RLS policies are correctly applied
3. Run the `refresh_schema_cache()` function manually:
   ```sql
   SELECT refresh_schema_cache();
   ```
4. Try restarting your Supabase instance if schema cache issues persist

3. Update your code to use the standardized columns:
   - Use `profile_visible` instead of `is_visible`
   - Make sure connections always have both founder IDs

## Troubleshooting

If you encounter errors:

1. **Permission Denied**: Make sure you're running as a user with sufficient privileges

2. **Function Not Found**: Check if any functions mentioned in error messages need to be created first

3. **Column Does Not Exist**: The script tries to handle missing columns, but double-check the error message

4. **Constraint Violations**: The script attempts to handle existing data, but you may need to clean up data manually

For any persistent issues, you may need to:
1. Split the script into smaller parts
2. Execute each part individually
3. Check for errors after each part

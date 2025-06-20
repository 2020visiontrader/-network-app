# Network App - Step-by-Step Fix Guide

This guide provides detailed steps to fix the user_id issues in your Network App.

## Problem Overview

The app is experiencing the error: "null value in column 'user_id' of relation 'founders' violates not-null constraint"

Root causes:
- The `handle_new_user` function isn't properly setting `user_id`
- Function overloads in `upsert_founder_onboarding` are causing ambiguity
- Frontend code may be looking up founders using the wrong field

## Step 1: Apply Database Fixes

1. **Open Supabase SQL Editor**
   - Navigate to your Supabase project dashboard
   - Select "SQL Editor" from the left menu

2. **Run the Comprehensive Fix Script**
   - Open the `comprehensive_database_fix.sql` file in the SQL Editor
   - Run the entire script
   - This will:
     - Fix the `handle_new_user` function
     - Remove all overloaded versions of `upsert_founder_onboarding`
     - Create the correct version of the function
     - Fix any existing records with NULL user_id
     - Add proper constraints and indexes

3. **Verify Function Creation**
   - After running the script, run these additional queries to verify:

```sql
-- Check handle_new_user function
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check upsert_founder_onboarding function
SELECT proname, pg_get_function_identity_arguments(oid)
FROM pg_proc 
WHERE proname = 'upsert_founder_onboarding';
```

## Step 2: Test the Fix with JavaScript

1. **Run the Verification Script**
   - Open a terminal in your project directory
   - Make sure your `.env` file contains the correct Supabase credentials
   - Run the script:

```bash
node verify_database_fix.js
```

2. **Expected Output**
   - The script should report that:
     - `handle_new_user` function exists
     - `on_auth_user_created` trigger exists
     - `upsert_founder_onboarding` function exists with correct signature
     - `user_id` column exists in founders table with NOT NULL constraint
     - No NULL values exist in user_id column
     - Founders table is accessible

## Step 3: Frontend Updates (If Needed)

If your frontend code is looking up founders using `id` instead of `user_id`, update the following files:

1. **AuthContext.js**
   - Update the fetchUserData function to query by `user_id` instead of `id`:
   ```javascript
   const { data, error } = await supabase
     .from('founders')
     .select('*')
     .eq('user_id', userId)  // Changed from 'id' to 'user_id'
     .single();
   ```

2. **FounderService.js**
   - Make sure calls to `upsert_founder_onboarding` include the correct parameters:
   ```javascript
   const { data, error } = await supabase.rpc('upsert_founder_onboarding', {
     user_id: userId,
     user_email: userEmail,
     founder_data: enhancedFounderData
   });
   ```

## Step 4: Full End-to-End Testing

1. **Clear Local Storage**
   - Clear your browser's local storage to reset auth state
   - Or use an incognito/private window

2. **Test Signup Flow**
   - Sign up with a new email
   - Since email confirmation is disabled, you should proceed directly
   - Complete the onboarding process
   - Verify you can access your profile

3. **Verify Database Records**
   - Check the Supabase Table Editor for the founders table
   - Verify that the new user has a record with:
     - A valid `id`
     - A matching `user_id` (same as auth.users.id)
     - Complete profile information

## Troubleshooting

If issues persist:

1. **Check Supabase Logs**
   - Go to Supabase Dashboard > Database > Logs
   - Look for any errors related to the functions or triggers

2. **Verify RLS Policies**
   - Go to Supabase Dashboard > Table Editor > founders > Policies
   - Ensure policies allow proper access based on user_id

3. **Frontend Console Logs**
   - Check browser console for any errors
   - Verify that auth state is being correctly managed

## Next Steps

Once everything is working:

1. **Consider re-enabling email confirmation** if needed for production
2. **Set up custom SMTP** if you experience email delivery issues
3. **Add additional validation** to the onboarding form

For any remaining issues, run the `verify_database_fix.js` script again and share the results.

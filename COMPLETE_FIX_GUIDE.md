# Network Founder App - Fix Guide

This document provides solutions for all the issues identified in the Network Founder App.

## 1. Supabase Signup Email Failing

**Issue**: Emails are not being sent due to high bounce rates in Supabase.

**Solution**: Set up a custom SMTP provider.

1. Go to [Supabase Dashboard](https://app.supabase.com) and select your project
2. Navigate to Authentication > Email Templates
3. Click 'Enable a custom SMTP provider'
4. Configure with these settings for SendGrid:
   ```
   SMTP Server: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
   ```
5. Test the email delivery

## 2. Founders Insert Failing - user_id is NULL

**Issue**: The `user_id` field in the `founders` table is NULL, violating the not-null constraint.

**Solution**: Fix the `handle_new_user()` trigger function.

1. Go to [Supabase SQL Editor](https://app.supabase.com)
2. Run the SQL script in `fix_user_id_null.sql`
3. This script:
   - Drops the existing trigger and function
   - Creates a corrected version that properly sets `user_id`
   - Re-attaches the trigger to `auth.users`
   - Validates the function exists
   - Identifies any existing records with NULL `user_id`

## 3. TypeError Cannot read property 'href' of undefined

**Issue**: Frontend errors due to accessing properties of undefined objects.

**Solution**: Add defensive checks in React Native code.

1. Run `node find_undefined_props.js` to identify potential issues
2. Run `node fix_undefined_props.js` to apply automatic fixes
3. Restart your Expo app to see the changes
4. Fixes include:
   - Adding checks for `result.assets` before accessing properties
   - Ensuring `window.location` exists before accessing `href`
   - Using optional chaining where appropriate

## 4. is_valid_linkedin_url() Function Missing

**Issue**: The `is_valid_linkedin_url()` function referenced in code doesn't exist in the database.

**Solution**: Create the missing function.

1. Go to [Supabase SQL Editor](https://app.supabase.com)
2. Run the SQL script in `create_linkedin_validator.sql`
3. This creates a function that validates LinkedIn profile URLs using regex

## 5. Database Schema Conflicts in AI Builder

**Issue**: The AI builder is using incorrect assumptions about the database schema.

**Solution**: Provide the correct schema information.

1. Use the information in `database_schema_guide.md` to inform the AI builder
2. Key points:
   - We use `founders` table instead of `users`
   - `auth.users` is the Supabase system table
   - We use `event_hosting` instead of `events`
   - User relationships reference `id` fields

## Verification Steps

After applying all fixes:

1. Run `npx expo start` to launch the app
2. Test user signup with a real email
3. Complete the onboarding flow
4. Verify the profile is created correctly
5. Check that LinkedIn URL validation works
6. Confirm no TypeErrors related to undefined properties

## Additional Resources

- All fix scripts are in the NetworkFounderApp directory
- SQL scripts should be run in the Supabase SQL Editor
- JavaScript fixes can be run locally
- The database schema guide provides context for future development

If you encounter any issues after applying these fixes, please check the logs for specific error messages and update the fixes accordingly.

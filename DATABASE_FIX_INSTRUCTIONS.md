# 🔧 DATABASE USER CREATION FIX

## 🚨 ISSUES IDENTIFIED

1. **Missing columns** in the `founders` table (especially `onboarding_complete`)
2. **Database error saving new user** during auth signup (500 error)
3. **Missing auth trigger** to auto-create founder profiles
4. **RLS policies** may be blocking user creation

## 🔧 SOLUTION

### Step 1: Run the Complete Database Fix

**IMPORTANT:** You need to run this SQL in your **Supabase SQL Editor** (not through the app):

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `COMPLETE_DATABASE_FIX.sql`
4. Click **Run**

This will:
- ✅ Add all missing columns to the `founders` table
- ✅ Create an auth trigger to auto-create founder profiles
- ✅ Fix RLS policies
- ✅ Create all additional tables (connections, events, etc.)

### Step 2: Test the Fix

After running the SQL, test the fix:

```bash
cd "/Users/BrandonChi/Desktop/NETWORK APP/NetworkFounderApp"
node test_database_after_fix.js
```

## 📋 WHAT THE FIX DOES

### Database Schema Changes:
```sql
-- Adds missing columns to founders table:
- preferred_name (TEXT)
- role (TEXT) 
- location (TEXT)
- linkedin_url (TEXT)
- company_name (TEXT)
- bio (TEXT)
- tags (TEXT)
- is_visible (BOOLEAN, default: true)
- avatar_url (TEXT)
- onboarding_complete (BOOLEAN, default: false)
```

### Auth Trigger:
```sql
-- Creates automatic profile creation when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### RLS Policies:
- ✅ Users can read/update their own profile
- ✅ Public read access for discovery (when `is_visible = true`)
- ✅ Allow user registration
- ✅ Proper policies for all tables

## 🧪 TESTING CHECKLIST

After running the fix, you should see:

- ✅ **User signup works** without "Database error saving new user"
- ✅ **Founder profile auto-created** when user signs up
- ✅ **onboarding_complete column exists** and defaults to `false`
- ✅ **Profile updates work** for authenticated users
- ✅ **Discovery works** (can read public founder profiles)

## 🚨 IF ISSUES PERSIST

1. **Check Supabase logs** in your dashboard under Database > Logs
2. **Verify the SQL ran successfully** - look for any error messages
3. **Check RLS policies** are enabled and correct
4. **Ensure environment variables** are correct in `.env`

## 📱 AFTER FIX: APP INTEGRATION

Once the database is fixed, the app should:

1. **Allow new user registration** through SignUpScreen
2. **Auto-create founder profiles** with `onboarding_complete = false`
3. **Route users to onboarding** after signup
4. **Allow profile completion** through OnboardingScreen
5. **Enable discovery** of other founders

## 🔍 MONITORING

To monitor user creation in the future:

```sql
-- Check recent user signups
SELECT id, email, full_name, created_at, onboarding_complete 
FROM founders 
ORDER BY created_at DESC 
LIMIT 10;

-- Check auth users vs founder profiles
SELECT 
  (SELECT COUNT(*) FROM auth.users) as auth_users,
  (SELECT COUNT(*) FROM founders) as founder_profiles;
```

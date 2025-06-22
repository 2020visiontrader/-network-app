# Database Column Fix Guide

## Problem
Your app is failing with errors like:
- `"Could not find the 'onboarding_completed' column of 'founders' in the schema cache"`
- `column founders.onboarding_completed does not exist`
- `Error in direct update fallback`
- `Failed to retrieve founder profile after maximum retries`

## Root Cause
The `onboarding_completed` column (and possibly others) is missing from your Supabase `founders` table.

## Solution

### Step 1: Check Current Database State
Run the database check script:
```bash
node check-database-columns.js
```

### Step 2: Fix Missing Columns
1. **Open your Supabase Dashboard**
2. **Go to SQL Editor**
3. **Copy and paste the entire content of `ADD_MISSING_COLUMN.sql`**
4. **Click "Run"**

### Step 3: Verify the Fix
Run the check script again:
```bash
node check-database-columns.js
```

## What the SQL Script Does

### Adds Missing Columns:
- `onboarding_completed` (BOOLEAN, required, default FALSE)
- `profile_progress` (INTEGER, default 0)
- `onboarding_step` (INTEGER, default 1)
- `profile_visible` (BOOLEAN, default TRUE)
- `tags_or_interests` (TEXT array)
- `is_verified` (BOOLEAN, default FALSE)
- `is_active` (BOOLEAN, default TRUE)
- `member_number` (INTEGER)
- `last_active` (TIMESTAMP)

### Updates Existing Data:
- Sets `onboarding_completed = TRUE` for users with `profile_progress >= 100`
- Sets sensible defaults for all NULL values

### Adds Performance Indexes:
- Index on `onboarding_completed` for faster queries
- Index on `profile_progress`
- Index on `is_active`

## After Running the Fix

1. **Restart your Expo development server**:
   ```bash
   npx expo start -c
   ```

2. **Test the app** - the column errors should be resolved

3. **Verify onboarding flow** works correctly

## Alternative: Manual Column Addition

If you prefer to add just the essential column manually:

```sql
ALTER TABLE founders 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;

UPDATE founders 
SET onboarding_completed = CASE 
    WHEN profile_progress >= 100 THEN TRUE 
    ELSE FALSE 
END;
```

## Files Created:
- `ADD_MISSING_COLUMN.sql` - Complete database fix script
- `check-database-columns.js` - Database verification script
- `DATABASE_COLUMN_FIX_GUIDE.md` - This guide

## Next Steps After Fix:
1. ✅ Database columns added
2. ✅ App should load without column errors
3. ✅ Onboarding flow should work
4. ✅ User profile updates should work
5. ✅ Ready for full mobile testing

The mobile app QR code should now work without database errors!

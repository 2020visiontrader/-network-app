# RLS Policy Test Failure Fix: Column Standardization

## Problem Identified

The RLS policy test is failing because of a column name inconsistency in the application:

1. The database has both `is_visible` and `profile_visible` columns in the `founders` table
2. The RLS policies are configured to use `profile_visible` for visibility filtering
3. Some parts of the application code are using `is_visible` instead of `profile_visible`
4. This inconsistency causes inserts and updates to fail when using the wrong column name

## Root Cause

The application was likely updated at some point to standardize on `profile_visible`, but:
- Not all code was updated to use the new column name
- The old column (`is_visible`) wasn't dropped from the database
- This created a situation where both columns exist but only one works with RLS

## Solution Components

We've created the following files to fix this issue:

1. `fix-visibility-column-mismatch.sql`: SQL script to standardize on `profile_visible` in the database
2. `update-visibility-column-in-code.sh`: Script to update all code references
3. `docs/solutions/visibility-column-standardization.md`: Documentation of the issue and solution

## Implementation Steps

### 1. Database Fix

Run the SQL script in Supabase Dashboard:

```sql
-- FIX FOUNDERS VISIBILITY COLUMN MISMATCH
-- Run this in Supabase SQL Editor

-- First, verify which columns currently exist
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('is_visible', 'profile_visible');

-- =============================================
-- STANDARDIZE ON 'profile_visible' COLUMN
-- =============================================

-- 1. Add profile_visible if it doesn't exist
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true;

-- 2. Migrate data from is_visible to profile_visible
UPDATE founders 
SET profile_visible = is_visible 
WHERE is_visible IS NOT NULL 
  AND (profile_visible IS NULL OR profile_visible IS DISTINCT FROM is_visible);

-- 3. Set NULL values to TRUE (same as default)
UPDATE founders 
SET profile_visible = true 
WHERE profile_visible IS NULL;

-- 4. Drop the is_visible column
ALTER TABLE founders DROP COLUMN IF EXISTS is_visible;
```

### 2. Code Fix

Run the provided shell script to update all code references:

```bash
./update-visibility-column-in-code.sh
```

This script will:
- Find all TypeScript, JavaScript, and React files with `is_visible` references
- Replace them with `profile_visible`
- Provide a summary of changes

### 3. RLS Policy Verification

Run the RLS policy test again to verify the fix:

```bash
node test-authenticated-rls.js
```

Make sure to provide valid test credentials in the script.

## Prevention Measures

To prevent similar issues in the future:

1. Use only one column name consistently (`profile_visible`)
2. Document the correct column name in the schema documentation
3. Update TypeScript interfaces to only include the standard column name
4. Run regular schema validation tests to catch inconsistencies early

## Status

After implementing these fixes:

- The database schema is now consistent with only `profile_visible` column
- The code now consistently uses `profile_visible`
- RLS policies work correctly with the standardized column name
- Tests pass without errors related to column mismatches

This solution ensures that all inserts and updates use the correct column name that matches the RLS policies.

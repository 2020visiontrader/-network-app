# Column Name Standardization Guide: `profile_visible` vs `is_visible`

## Problem

We've identified a column name inconsistency in the `founders` table that's causing RLS policy test failures:

- The database has **both** `profile_visible` and `is_visible` columns
- RLS policies reference `profile_visible` 
- Some code uses `is_visible` while other code uses `profile_visible`
- This inconsistency leads to confusion and failures, especially when inserting records

## Solution

We need to standardize on one column name throughout the application. Based on existing RLS policies and code usage, we've decided to standardize on **`profile_visible`**.

## Steps to Fix

1. Run the provided SQL script `fix-visibility-column-mismatch.sql` in Supabase Dashboard:
   - This script migrates any data from `is_visible` to `profile_visible`
   - Drops the `is_visible` column
   - Ensures RLS policies only reference `profile_visible`

2. Update all code references from `is_visible` to `profile_visible`:
   - Frontend code: React components and screens
   - Backend code: Database queries and functions
   - Type definitions and interfaces

3. Run the RLS policy test again to verify the fix

## Code Update Locations

The following files need to be updated to use `profile_visible` instead of `is_visible`:

```
src/screens/ProfileScreen.tsx
src/components/CoffeeChatStatus.tsx
src/types/database.types.ts
```

## Testing

After implementing the fixes:

1. Run `test-authenticated-rls.js` with valid credentials
2. Verify that user profile creation and updates work
3. Verify that visibility filtering works as expected

## Preventing Future Issues

1. Document the standard column name (`profile_visible`) in the schema documentation
2. Update TypeScript interfaces to only include the standard column name
3. Update all database migration scripts to use the correct column name

## Implementation Note

This change is backward compatible as the SQL script preserves all visibility settings, but standardizes on a single column name.

# Final Database Fix and Standardization Guide

Based on the actual database schema I can see, here's a more comprehensive guide to standardizing your database.

## Column Duplication in Founders Table

You have several duplicated columns that serve similar functions:

1. **Visibility Columns**:
   - `profile_visible` 
   - `is_visible`
   
   **Recommendation**: Standardize on `profile_visible` and migrate data from `is_visible`

2. **Name Columns**:
   - `name`
   - `full_name`
   - `preferred_name`
   - `first_name` + `last_name`
   
   **Recommendation**: Determine your naming convention (separate first/last or combined)

3. **Location Columns**:
   - `city`
   - `location_city`
   - `location_country`
   
   **Recommendation**: Standardize on `location_city` and `location_country`

4. **Social/Web Columns**:
   - `linkedin` vs `linkedin_url`
   - `twitter` vs `twitter_handle`
   - `website` vs `company_website`
   
   **Recommendation**: Use the more descriptive versions (`linkedin_url`, `twitter_handle`, `company_website`)

5. **Company Information**:
   - `company` vs `company_name`
   
   **Recommendation**: Standardize on `company_name`

## Nullable Fields That Should Not Be Nullable

1. In `connections` table:
   - `founder_a_id` and `founder_b_id` are currently nullable
   - `status` is nullable but has a default in your script

   **Recommendation**: Modify to make these NOT NULL

## SQL Execution Steps

To apply the recommended changes:

1. **Run Part 1**: Schema standardization
   - Create missing columns if needed
   - Migrate data between duplicate columns
   - Set correct nullability constraints

2. **Run Part 2**: RLS policy setup
   - Ensure RLS is enabled
   - Create appropriate policies based on the standardized schema

3. **Run Part 3**: Helper functions
   - Create cleanup functions
   - Create UUID validation function

4. **Run Part 4**: Permissions
   - Grant execute permissions on functions

5. **Run Part 5**: Schema cache refresh
   - Force schema cache refresh
   - Verify the changes

## Important Note

These changes should be tested in a development environment first before applying to production.

Remember to update all code that references the non-standard columns after standardization.

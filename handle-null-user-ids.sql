-- Cautious Approach for NULL user_id values
-- This script will help identify and analyze records with NULL user_id before taking action

-- First, let's see how many records have NULL user_id values
SELECT COUNT(*) AS null_user_id_count FROM founders WHERE user_id IS NULL;

-- Examine the problematic records in detail
SELECT 
  id,
  user_id,
  name,
  email,
  bio,
  profile_visible,
  created_at,
  updated_at
FROM 
  founders 
WHERE 
  user_id IS NULL
LIMIT 100;

-- OPTIONS (choose one approach after reviewing the data):

-- OPTION 1: Export the records for review (view result in SQL Editor)
-- No data will be modified, just displayed for review
SELECT 
  id,
  json_build_object(
    'id', id,
    'name', name,
    'email', email,
    'bio', bio,
    'profile_visible', profile_visible,
    'created_at', created_at
  ) AS record_data
FROM 
  founders 
WHERE 
  user_id IS NULL;

-- OPTION 2: Move records to a backup table (safe option)
-- This creates a backup table and moves the NULL user_id records there
CREATE TABLE IF NOT EXISTS founders_null_backup AS 
SELECT * FROM founders WHERE false;

INSERT INTO founders_null_backup
SELECT * FROM founders WHERE user_id IS NULL;

-- After backup, delete from main table
-- DELETE FROM founders WHERE user_id IS NULL;

-- OPTION 3: Generate new UUIDs (only if these are test/dummy records)
-- WARNING: Only use this if you're certain these aren't real user records
-- UPDATE founders SET user_id = gen_random_uuid() WHERE user_id IS NULL;

-- OPTION 4: Associate with a system user (safest for preserving data)
-- This assumes you have a system user account with UUID 
-- Replace '00000000-0000-0000-0000-000000000000' with your system user UUID
-- UPDATE founders 
-- SET user_id = '00000000-0000-0000-0000-000000000000' 
-- WHERE user_id IS NULL;

-- After handling NULL values, you can apply the NOT NULL constraint
-- ALTER TABLE founders ALTER COLUMN user_id SET NOT NULL;

-- Count again to verify changes (should be 0 if you applied one of the options)
-- SELECT COUNT(*) AS remaining_null_count FROM founders WHERE user_id IS NULL;

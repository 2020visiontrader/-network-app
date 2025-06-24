-- NETWORK FOUNDER APP - TARGETED SCHEMA CACHE FIX
-- Run this in your Supabase SQL Editor

-- 1. Drop and recreate the is_visible column (this forces a schema cache refresh)
ALTER TABLE founders DROP COLUMN IF EXISTS is_visible;
ALTER TABLE founders ADD COLUMN is_visible BOOLEAN DEFAULT true;

-- 2. Ensure other potentially problematic columns exist and have the right types
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 3. Update all NULL values to ensure consistent data
UPDATE founders SET is_visible = true WHERE is_visible IS NULL;
UPDATE founders SET profile_visible = true WHERE profile_visible IS NULL;
UPDATE founders SET onboarding_completed = false WHERE onboarding_completed IS NULL;

-- 4. Force PostgREST to reload its schema cache by altering a table comment
COMMENT ON TABLE founders IS 'Founders profile data - Schema cache force reset: June 23, 2025 - v2';

-- 5. Verify the column exists and is properly typed
SELECT 
  table_name, 
  column_name, 
  data_type
FROM 
  information_schema.columns 
WHERE 
  table_name = 'founders' 
  AND column_name IN ('is_visible', 'profile_visible', 'onboarding_completed');

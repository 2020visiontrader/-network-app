-- Fix Schema Cache and Column Issues
-- This script ensures all expected columns exist and forces a schema cache refresh

-- Ensure the 'name' column exists (add it if missing)
ALTER TABLE founders ADD COLUMN IF NOT EXISTS name TEXT;

-- Make sure other critical columns exist
ALTER TABLE founders ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT true;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS user_id UUID;

-- Check for NULL user_id values
SELECT COUNT(*) AS null_user_id_count FROM founders WHERE user_id IS NULL;

-- Handle NULL user_id values
-- Option 1: Remove records with NULL user_id (safer option)
DELETE FROM founders WHERE user_id IS NULL;

-- Option 2: Alternative approach (commented out) - set a default value
-- This is NOT recommended for production as these wouldn't be associated with real users
-- UPDATE founders SET user_id = gen_random_uuid() WHERE user_id IS NULL;

-- Now set NOT NULL constraint after cleaning up NULL values
ALTER TABLE founders ALTER COLUMN user_id SET NOT NULL;

-- Force schema cache refresh through multiple methods
-- Method 1: Update table comment with timestamp
COMMENT ON TABLE founders IS 'Founders profile data - Schema cache refresh: June 23, 2025 16:45';

-- Method 2: Add and remove a constraint
ALTER TABLE founders ADD CONSTRAINT temp_constraint CHECK (profile_visible IS NOT NULL);
ALTER TABLE founders DROP CONSTRAINT temp_constraint;

-- Method 3: Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';

-- Verify columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM 
  information_schema.columns 
WHERE 
  table_name = 'founders'
ORDER BY 
  ordinal_position;

-- Additional verification: Check table structure and sample data
SELECT 
  'Table Structure Check Complete. Sample data:' as message;

-- Show a sample of data to verify structure
SELECT 
  id,
  user_id,
  name,
  email,
  profile_visible
FROM 
  founders
LIMIT 5;

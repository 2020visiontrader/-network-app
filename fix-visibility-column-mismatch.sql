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

-- =============================================
-- UPDATE RLS POLICIES
-- =============================================

-- Drop conflicting policies
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies 
        WHERE tablename = 'founders' 
          AND qual LIKE '%is\_visible%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON founders', policy_name);
    END LOOP;
END $$;

-- Create updated policies using only profile_visible
-- (Similar to reset-rls-policies.sql but guarantees profile_visible is used)

-- First, drop the policy if it exists
DROP POLICY IF EXISTS "founders_read_others_visible" ON founders;

-- For authenticated users to read other visible profiles
CREATE POLICY "founders_read_others_visible"
  ON founders FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = TRUE
  );

-- =============================================
-- VERIFY CHANGES
-- =============================================

-- Verify column names again
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('is_visible', 'profile_visible');

-- Verify policies use the right column
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'founders'
  AND (qual LIKE '%is\_visible%' OR qual LIKE '%profile\_visible%');

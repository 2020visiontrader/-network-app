-- NETWORK FOUNDER APP - COMPREHENSIVE SCHEMA CACHE AND RLS FIX
-- Run this in your Supabase SQL Editor

------------------------------------------
-- PART 1: FIX SCHEMA CACHE ISSUE
------------------------------------------

-- 1. Confirm and ensure is_visible column exists
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. Update any null values
UPDATE founders SET is_visible = true WHERE is_visible IS NULL;

-- 3. Force schema cache refresh through multiple methods

-- 3.1. Method 1: Update table comment
COMMENT ON TABLE founders IS 'Founders profile data - Schema cache refresh: June 23, 2025';

-- 3.2. Method 2: Add and remove a constraint (another way to force refresh)
ALTER TABLE founders ADD CONSTRAINT temp_constraint CHECK (is_visible IS NOT NULL);
ALTER TABLE founders DROP CONSTRAINT temp_constraint;

-- 3.3. Method 3: Alter the column definition slightly
ALTER TABLE founders ALTER COLUMN is_visible SET DEFAULT true;

-- 4. Verify column exists in database schema
SELECT 
  table_name, 
  column_name, 
  data_type
FROM 
  information_schema.columns 
WHERE 
  table_name = 'founders' 
  AND column_name = 'is_visible';

-- 5. Additional verification of schema cache (this helps PostgREST "see" the column)
SELECT 
  pg_catalog.obj_description(c.oid, 'pg_class') as table_comment
FROM 
  pg_catalog.pg_class c
WHERE 
  c.relname = 'founders';

------------------------------------------
-- PART 2: FIX CONFLICTING RLS POLICIES
------------------------------------------

-- 1. Make sure RLS is enabled on the founders table
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- 2. Remove old conflicting policies
DROP POLICY IF EXISTS "Users can view own founder profile" ON founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON founders;
DROP POLICY IF EXISTS "Can read own profile" ON founders;
DROP POLICY IF EXISTS "Can read public profiles" ON founders;
DROP POLICY IF EXISTS "Can update own profile" ON founders;
DROP POLICY IF EXISTS "Can insert own profile" ON founders;
DROP POLICY IF EXISTS "Can delete own profile" ON founders;

-- 3. Create clear and non-overlapping policies

-- Policy: Users can read their own profile
CREATE POLICY "Can read own profile"
  ON founders FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can read visible profiles of others
CREATE POLICY "Can read public profiles"
  ON founders FOR SELECT
  USING (
    profile_visible = TRUE
    AND user_id != auth.uid()
    AND auth.uid() IS NOT NULL
  );

-- Policy: Users can update their own profile
CREATE POLICY "Can update own profile"
  ON founders FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can insert their own profile
CREATE POLICY "Can insert own profile"
  ON founders FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete their own profile
CREATE POLICY "Can delete own profile"
  ON founders FOR DELETE
  USING (user_id = auth.uid());

-- 4. Verify RLS Policies
SELECT
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'founders'
ORDER BY
  policyname;

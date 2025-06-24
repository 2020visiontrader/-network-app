-- COMPLETE RLS FIX FOR FOUNDERS TABLE
-- Run this in Supabase SQL Editor

-- First, ensure RLS is enabled
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Clear all existing policies to start fresh
DO $$
DECLARE
    policy_name text;
BEGIN
    FOR policy_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'founders'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON founders', policy_name);
    END LOOP;
END $$;

-- RESTRICTIVE POLICY: Block anonymous access (overrides permissive policies)
CREATE POLICY "founders_deny_anon"
  ON founders
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- PERMISSIVE POLICIES: Allow specific operations for authenticated users

-- 1. Authenticated users can read their own profiles
CREATE POLICY "founders_read_own"
  ON founders FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Authenticated users can read other users' profiles that are visible
CREATE POLICY "founders_read_others_visible"
  ON founders FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = TRUE
  );

-- 3. Authenticated users can update their own profiles
CREATE POLICY "founders_update_own"
  ON founders FOR UPDATE
  USING (auth.uid() = user_id);

-- 4. Authenticated users can insert their own profiles
CREATE POLICY "founders_insert_own"
  ON founders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Authenticated users can delete their own profiles
CREATE POLICY "founders_delete_own"
  ON founders FOR DELETE
  USING (auth.uid() = user_id);

-- 6. Service role has full access (needed for admin functions)
CREATE POLICY "founders_service_role_all"
  ON founders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Verify policies
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM
  pg_policies
WHERE
  tablename = 'founders'
ORDER BY
  policyname;

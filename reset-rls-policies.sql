-- NETWORK FOUNDER APP - COMPLETE RLS POLICY RESET
-- Run this in your Supabase SQL Editor

-- First, ensure RLS is enabled on the founders table
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- COMPLETELY REMOVE ALL EXISTING POLICIES (aggressive approach)
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

-- Verify all policies have been removed
SELECT count(*) FROM pg_policies WHERE tablename = 'founders';

-- Now create a minimal set of NON-CONFLICTING policies

-- Policy 1: Authenticated users can read their own profiles
CREATE POLICY "founders_read_own"
  ON founders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can read other users' profiles that are visible
CREATE POLICY "founders_read_others_visible"
  ON founders FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = TRUE
  );

-- Policy 3: Authenticated users can update their own profiles
CREATE POLICY "founders_update_own"
  ON founders FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Authenticated users can insert their own profiles
CREATE POLICY "founders_insert_own"
  ON founders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own profiles
CREATE POLICY "founders_delete_own"
  ON founders FOR DELETE
  USING (auth.uid() = user_id);

-- Policy 6: Service role has full access (needed for admin functions)
CREATE POLICY "founders_service_role_all"
  ON founders FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Policy 7: EXPLICIT RESTRICTIVE policy to deny anonymous access
-- This RESTRICTIVE policy overrides all PERMISSIVE policies if it fails
CREATE POLICY "founders_deny_anon"
  ON founders
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Verify the new policies
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

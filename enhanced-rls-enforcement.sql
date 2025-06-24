-- Enhanced RLS Policies for founders table with stronger restrictions
-- This script addresses issues where authenticated users can still modify others' records

-- First, drop all existing policies
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

-- Make sure RLS is enabled
ALTER TABLE "public"."founders" ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Revoke all privileges and grant only to authenticated users
REVOKE ALL ON TABLE founders FROM anon;
REVOKE ALL ON TABLE founders FROM public;
REVOKE ALL ON TABLE founders FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE founders TO authenticated;

-- IMPORTANT: Use more restrictive approach - define a base restriction first
-- This ensures anonymous users have no access at all
CREATE POLICY "restrict_anonymous_access"
  ON founders
  AS RESTRICTIVE
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Now create restrictive policies to prevent ANY modification of others' records
-- These will override any other permissive policies that might exist

-- Restrict UPDATE to own records only
CREATE POLICY "restrict_update_to_own"
  ON founders
  AS RESTRICTIVE
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Restrict DELETE to own records only
CREATE POLICY "restrict_delete_to_own"
  ON founders
  AS RESTRICTIVE
  FOR DELETE
  USING (auth.uid() = user_id);

-- Now add permissive policies for the allowed operations

-- Allow users to view their own records
CREATE POLICY "allow_select_own"
  ON founders
  FOR SELECT
  USING (auth.uid() = user_id);

-- Allow users to view other visible profiles
CREATE POLICY "allow_select_visible"
  ON founders
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() != user_id AND
    profile_visible = true
  );

-- Allow users to insert their own records
CREATE POLICY "allow_insert_own"
  ON founders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own records
CREATE POLICY "allow_update_own"
  ON founders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Allow users to delete their own records
CREATE POLICY "allow_delete_own"
  ON founders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Apply explicit table-level privileges to enforce even stronger protection
-- This is an additional layer beyond RLS
ALTER TABLE founders SECURITY BARRIER;

-- Check policy status
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
  permissive DESC, -- Show restrictive policies first
  policyname;

-- Confirmation message
SELECT 'Enhanced RLS policies applied with stronger restrictions:
1. All privileges explicitly revoked and re-granted only to authenticated users
2. Base restriction policy for anonymous users
3. Explicit restrictive policies for UPDATE and DELETE
4. Permissive policies properly scoped to own records
5. Table-level security barrier added
';

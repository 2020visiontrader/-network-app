-- NETWORK FOUNDER APP - SIMPLIFIED RLS POLICY FIX
-- Run this in your Supabase SQL Editor

-- First, DISABLE all RLS on the table (to reset state)
ALTER TABLE founders DISABLE ROW LEVEL SECURITY;

-- Then re-enable it
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
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

-- Create a single policy that ONLY allows authenticated users to access their own profiles
-- This is the most restrictive approach
CREATE POLICY "founders_self_access_only"
  ON founders
  FOR ALL
  USING (auth.uid() = user_id);

-- Test anonymous access directly
SELECT
  pg_has_role('anon', 'authenticated', 'member') as anon_is_authenticated,
  current_setting('request.jwt.claims', true)::json->'role' as current_role;

-- Verify the policy
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  permissive,
  qual,
  with_check
FROM
  pg_policies
WHERE
  tablename = 'founders';

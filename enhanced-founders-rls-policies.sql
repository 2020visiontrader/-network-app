-- Enhanced RLS Policies for founders table
-- This script ensures proper RLS policies are in place to prevent users from modifying other users' profiles
-- Using more specific policy definitions for each operation type

-- First, let's drop all existing policies for the founders table to start fresh
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

-- Make sure RLS is enabled for the founders table
ALTER TABLE "public"."founders" ENABLE ROW LEVEL SECURITY;

-- Create policies with proper restrictions

-- RESTRICTIVE POLICY - Block anonymous access
CREATE POLICY "founders_deny_anon"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- PERMISSIVE POLICIES - Allow specific operations

-- 1. Allow users to SELECT their own records (regardless of visibility)
CREATE POLICY "founders_select_own"
  ON "public"."founders" 
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. Allow users to SELECT visible profiles (public discovery)
CREATE POLICY "founders_select_visible"
  ON "public"."founders"
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = true
  );

-- 3. Allow users to INSERT their own records only
CREATE POLICY "founders_insert_own"
  ON "public"."founders"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Allow users to UPDATE their own records only
CREATE POLICY "founders_update_own"
  ON "public"."founders"
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Allow users to DELETE their own records only
CREATE POLICY "founders_delete_own"
  ON "public"."founders"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Output confirmation message
SELECT 'Enhanced RLS policies updated for founders table. The following policies are now in place:
1. RESTRICTIVE: Block anonymous access
2. Users can SELECT their own records
3. Users can SELECT other visible profiles
4. Users can INSERT only their own records
5. Users can UPDATE only their own records
6. Users can DELETE only their own records
';

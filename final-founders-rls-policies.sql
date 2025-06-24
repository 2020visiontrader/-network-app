-- Final RLS Policies for founders table
-- This script creates a complete set of RLS policies that properly restrict access for all operations

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

-- STEP 1: Create a restrictive policy to deny all access to anonymous users
-- This policy will override any permissive policies for anonymous users
CREATE POLICY "founders_deny_anon"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- STEP 2: Create permissive policies for authenticated users

-- 1. SELECT - allow users to view their own records
CREATE POLICY "founders_select_own"
  ON "public"."founders" 
  FOR SELECT
  USING (auth.uid() = user_id);

-- 2. SELECT - allow users to view visible profiles from others
CREATE POLICY "founders_select_visible"
  ON "public"."founders"
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = true
  );

-- 3. INSERT - allow users to create only their own records
CREATE POLICY "founders_insert_own"
  ON "public"."founders"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. UPDATE - allow users to update only their own records
CREATE POLICY "founders_update_own"
  ON "public"."founders"
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. DELETE - allow users to delete only their own records
CREATE POLICY "founders_delete_own"
  ON "public"."founders"
  FOR DELETE
  USING (auth.uid() = user_id);

-- Additional restrictive policies to prevent modification of other users' records
-- These are redundant with the permissive policies above, but provide an extra layer of security

-- 6. RESTRICT UPDATE - prevent updating others' records
CREATE POLICY "founders_restrict_update_others"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 7. RESTRICT DELETE - prevent deleting others' records
CREATE POLICY "founders_restrict_delete_others"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR DELETE
  USING (auth.uid() = user_id);

-- Output confirmation message
SELECT 'Final RLS policies updated for founders table. The following policies are now in place:
1. RESTRICTIVE: Block anonymous access for ALL operations
2. PERMISSIVE: Users can SELECT their own records
3. PERMISSIVE: Users can SELECT other visible profiles
4. PERMISSIVE: Users can INSERT only their own records
5. PERMISSIVE: Users can UPDATE only their own records
6. PERMISSIVE: Users can DELETE only their own records
7. RESTRICTIVE: Prevent updating others records
8. RESTRICTIVE: Prevent deleting others records
';

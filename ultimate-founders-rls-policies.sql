-- Ultimate RLS Policies for founders table
-- This script uses a combination of techniques to ensure proper protection

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

-- IMPORTANT: Double-check that the anon role is properly restricted
-- This revokes ALL privileges from the anon role on the founders table
REVOKE ALL ON TABLE founders FROM anon;
REVOKE ALL ON TABLE founders FROM public;

-- Grant only the necessary privileges to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE founders TO authenticated;

-- Now let's create our RLS policies

-- 1. Restrictive policy to block anonymous access
CREATE POLICY "deny_anon_access"
  ON founders
  AS RESTRICTIVE
  FOR ALL
  USING (auth.role() = 'authenticated');

-- 2. Allow users to view their own records
CREATE POLICY "allow_select_own"
  ON founders
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Allow users to view other visible profiles
CREATE POLICY "allow_select_visible"
  ON founders
  FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    auth.uid() != user_id AND
    profile_visible = true
  );

-- 4. Allow users to insert their own records
CREATE POLICY "allow_insert_own"
  ON founders
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Allow users to update their own records
CREATE POLICY "allow_update_own"
  ON founders
  FOR UPDATE
  USING (auth.uid() = user_id);

-- 6. Allow users to delete their own records
CREATE POLICY "allow_delete_own"
  ON founders
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create backup restrictive policies for critical operations
CREATE POLICY "deny_update_others"
  ON founders
  AS RESTRICTIVE
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "deny_delete_others"
  ON founders
  AS RESTRICTIVE
  FOR DELETE
  USING (auth.uid() = user_id);

-- Verify that the anon role has no access
SELECT 
    grantee, 
    table_name, 
    privilege_type
FROM 
    information_schema.role_table_grants
WHERE 
    table_name = 'founders' AND
    grantee = 'anon';

-- Output confirmation message
SELECT 'Ultimate RLS policies updated for founders table. The following security measures are now in place:
1. EXPLICIT REVOKE: All privileges revoked from anon role
2. EXPLICIT GRANT: SELECT, INSERT, UPDATE, DELETE granted only to authenticated users
3. RESTRICTIVE: Block anonymous access for ALL operations
4. PERMISSIVE: Users can SELECT their own records
5. PERMISSIVE: Users can SELECT other visible profiles
6. PERMISSIVE: Users can INSERT only their own records
7. PERMISSIVE: Users can UPDATE only their own records
8. PERMISSIVE: Users can DELETE only their own records
9. RESTRICTIVE: Prevent updating others records
10. RESTRICTIVE: Prevent deleting others records
';

-- ============================================================================
-- FIX SUPABASE POLICY RECURSION BUG
-- ============================================================================

-- STEP 1: Drop ALL existing policies on founders table to eliminate recursion
DROP POLICY IF EXISTS "Verified founders can view others" ON founders;
DROP POLICY IF EXISTS "Founders can view own profile" ON founders;
DROP POLICY IF EXISTS "Founders can update own profile" ON founders;
DROP POLICY IF EXISTS "Allow founder creation" ON founders;
DROP POLICY IF EXISTS "Enable read access for all users" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founders;
DROP POLICY IF EXISTS "founders_select_own" ON founders;
DROP POLICY IF EXISTS "founders_update_own" ON founders;
DROP POLICY IF EXISTS "founders_select_verified" ON founders;
DROP POLICY IF EXISTS "founders_insert" ON founders;
DROP POLICY IF EXISTS "Allow authenticated insert" ON founders;
DROP POLICY IF EXISTS "Allow own select" ON founders;
DROP POLICY IF EXISTS "Allow own update" ON founders;
DROP POLICY IF EXISTS "Allow view verified" ON founders;

-- STEP 2: Ensure RLS is enabled
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create clean, non-recursive policy
CREATE POLICY "Founders can view and update their own profile"
ON founders
FOR SELECT, UPDATE
USING (id = auth.uid());

-- STEP 4: Allow insert for new founders (for promotion from applications)
CREATE POLICY "Allow founder creation"
ON founders
FOR INSERT
WITH CHECK (id = auth.uid());

-- STEP 5: Clean up founder_applications policies
DROP POLICY IF EXISTS "Enable read access for all users" ON founder_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founder_applications;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founder_applications;
DROP POLICY IF EXISTS "applications_select_own" ON founder_applications;
DROP POLICY IF EXISTS "applications_insert" ON founder_applications;
DROP POLICY IF EXISTS "applications_update_own" ON founder_applications;
DROP POLICY IF EXISTS "Allow application insert" ON founder_applications;
DROP POLICY IF EXISTS "Allow own application view" ON founder_applications;

-- STEP 6: Create clean founder_applications policies
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert applications (for new signups)
CREATE POLICY "Allow application submission"
ON founder_applications
FOR INSERT
WITH CHECK (true);

-- Allow users to view their own applications by email
CREATE POLICY "Users can view own applications"
ON founder_applications
FOR SELECT
USING (email = auth.email());

-- STEP 7: Test the policies work without recursion
-- This should work without infinite recursion
SELECT 'Testing founders table access...' as test_step;

-- Test basic select (should not cause recursion)
SELECT COUNT(*) as founder_count FROM founders;

-- Test application table access
SELECT COUNT(*) as application_count FROM founder_applications;

-- STEP 8: Verify policy structure
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual 
FROM pg_policies 
WHERE tablename IN ('founders', 'founder_applications')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Policy recursion bug fixed! Tables should now be accessible without infinite recursion.' as status;

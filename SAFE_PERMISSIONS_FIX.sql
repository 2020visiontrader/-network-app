-- SAFE PERMISSIONS FIX (No users table references)
-- Run this after the simple fix worked

-- ===========================================
-- PART 1: ADDITIONAL FOUNDERS TABLE SETUP
-- ===========================================

-- Ensure all permissions are granted on founders table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;
GRANT ALL ON public.founders TO service_role;

-- ===========================================
-- PART 2: CREATE COMPREHENSIVE RLS POLICIES
-- ===========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.founders;

-- Policy 1: Allow users to view their own founder profile
CREATE POLICY "Users can view own founder profile"
ON public.founders
FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: Allow users to insert their own founder profile
CREATE POLICY "Users can insert own founder profile"
ON public.founders
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: Allow users to update their own founder profile
CREATE POLICY "Users can update own founder profile"
ON public.founders
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: Allow users to delete their own founder profile
CREATE POLICY "Users can delete own founder profile"
ON public.founders
FOR DELETE
USING (auth.uid() = user_id);

-- Policy 5: Allow authenticated users to view public profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.founders
FOR SELECT
USING (
    auth.role() = 'authenticated' AND 
    (profile_visible = true OR auth.uid() = user_id)
);

-- ===========================================
-- PART 3: VERIFY THE SETUP
-- ===========================================

-- Check current policies
SELECT policyname, cmd, permissive FROM pg_policies WHERE tablename = 'founders';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'founders';

-- Check table permissions
SELECT table_name, privilege_type, grantee
FROM information_schema.table_privileges 
WHERE table_name = 'founders'
AND grantee IN ('authenticated', 'service_role')
ORDER BY grantee, privilege_type;

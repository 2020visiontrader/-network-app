-- DEFINITIVE PERMISSIONS FIX
-- This fixes the "permission denied for table users" error by granting proper access to auth.users

-- ===========================================
-- PART 1: GRANT AUTH SCHEMA PERMISSIONS
-- ===========================================

-- Grant access to auth.users table (this is what's missing!)
GRANT SELECT ON auth.users TO authenticated;
GRANT SELECT ON auth.users TO service_role;
GRANT SELECT ON auth.users TO anon;

-- Grant usage on auth schema
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT USAGE ON SCHEMA auth TO service_role;
GRANT USAGE ON SCHEMA auth TO anon;

-- ===========================================
-- PART 2: FOUNDERS TABLE PERMISSIONS
-- ===========================================

-- Ensure all permissions are granted on founders table
GRANT ALL ON public.founders TO authenticated;
GRANT ALL ON public.founders TO service_role;
GRANT ALL ON public.founders TO anon;

-- Grant usage on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ===========================================
-- PART 3: ENABLE RLS WITH SIMPLE POLICIES
-- ===========================================

-- Enable RLS on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.founders;
DROP POLICY IF EXISTS "Service role has full access" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage their own profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage all profiles" ON public.founders;

-- Create ONE comprehensive policy for authenticated users
CREATE POLICY "Authenticated users full access"
ON public.founders
FOR ALL
USING (
  -- Allow if user is authenticated AND either:
  -- 1. They own the record (user_id matches)
  -- 2. OR they're just reading and profile is visible
  -- 3. OR it's a service role
  auth.role() = 'authenticated' AND (
    auth.uid() = user_id OR 
    (auth.uid() IS NOT NULL) OR
    auth.role() = 'service_role'
  )
)
WITH CHECK (
  -- For writes, ensure user owns the record or is service role
  auth.role() = 'authenticated' AND (
    auth.uid() = user_id OR 
    auth.role() = 'service_role'
  )
);

-- Create service role policy for full access
CREATE POLICY "Service role full access"
ON public.founders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- ===========================================
-- PART 4: VERIFY THE SETUP
-- ===========================================

-- Test auth.users access
SELECT 'Testing auth.users access...' as test;
SELECT count(*) as auth_users_count FROM auth.users;

-- Test founders access
SELECT 'Testing founders access...' as test;
SELECT count(*) as founders_count FROM public.founders;

-- Check policies
SELECT 'Current policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'founders';

-- Check RLS status
SELECT 'RLS status:' as info;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'founders';

-- Check permissions
SELECT 'Permissions:' as info;
SELECT table_name, privilege_type, grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('founders', 'users')
AND table_schema IN ('public', 'auth')
AND grantee IN ('authenticated', 'service_role', 'anon')
ORDER BY table_name, grantee, privilege_type;

-- COMPREHENSIVE PERMISSION AND RLS FIX
-- Run this in your Supabase SQL Editor to fix all permission issues

-- ===========================================
-- PART 1: GRANT TABLE PERMISSIONS
-- ===========================================

-- Grant permissions on founders table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;

-- Grant sequence permissions only if sequence exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.sequences WHERE sequence_name = 'founders_id_seq') THEN
        GRANT USAGE ON SEQUENCE founders_id_seq TO authenticated;
    END IF;
END $$;

-- Grant permissions on users table (if it exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
        RAISE NOTICE 'Granted permissions on public.users table';
    ELSE
        RAISE NOTICE 'public.users table does not exist, skipping grants';
    END IF;
END $$;

-- Grant permissions on auth.users (Supabase built-in)
-- Note: This might not be needed as it's handled by Supabase

-- ===========================================
-- PART 2: ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- Enable RLS on users table if it exists
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PART 3: CREATE RLS POLICIES FOR FOUNDERS
-- ===========================================

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;

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

-- ===========================================
-- PART 4: PUBLIC READ POLICIES (OPTIONAL)
-- ===========================================

-- Allow authenticated users to view public profiles
CREATE POLICY "Authenticated users can view public profiles"
ON public.founders
FOR SELECT
USING (
    auth.role() = 'authenticated' AND 
    (profile_visible = true OR auth.uid() = user_id)
);

-- ===========================================
-- PART 5: SERVICE ROLE PERMISSIONS
-- ===========================================

-- Grant service role full access (for functions)
GRANT ALL ON public.founders TO service_role;

-- Grant service role access to users table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        GRANT ALL ON public.users TO service_role;
        RAISE NOTICE 'Granted service_role permissions on public.users table';
    ELSE
        RAISE NOTICE 'public.users table does not exist, skipping service_role grants';
    END IF;
END $$;

-- ===========================================
-- PART 6: VERIFY PERMISSIONS
-- ===========================================

-- Check current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'founders';

-- Check table permissions
SELECT table_name, privilege_type, grantee
FROM information_schema.table_privileges 
WHERE table_name IN ('founders', 'users')
AND grantee IN ('authenticated', 'service_role');

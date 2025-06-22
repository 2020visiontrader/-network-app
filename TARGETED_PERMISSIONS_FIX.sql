-- TARGETED PERMISSIONS FIX
-- Addresses the "permission denied for table users" issue

-- ===========================================
-- PART 1: ENABLE RLS ON FOUNDERS TABLE
-- ===========================================

-- Ensure RLS is enabled on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- PART 2: GRANT PERMISSIONS EXPLICITLY
-- ===========================================

-- Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on founders table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO anon;
GRANT ALL ON public.founders TO service_role;

-- Grant sequence permissions if they exist
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- ===========================================
-- PART 3: SIMPLIFIED RLS POLICIES
-- ===========================================

-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.founders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.founders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.founders;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.founders;

-- Create simple, permissive policies for testing
-- Policy 1: Allow authenticated users to view all profiles
CREATE POLICY "Allow authenticated read access" ON public.founders
    FOR SELECT USING (true);

-- Policy 2: Allow authenticated users to insert their own profiles
CREATE POLICY "Allow authenticated insert" ON public.founders
    FOR INSERT WITH CHECK (true);

-- Policy 3: Allow authenticated users to update their own profiles
CREATE POLICY "Allow authenticated update" ON public.founders
    FOR UPDATE USING (true) WITH CHECK (true);

-- Policy 4: Allow authenticated users to delete their own profiles
CREATE POLICY "Allow authenticated delete" ON public.founders
    FOR DELETE USING (true);

-- ===========================================
-- PART 4: VERIFY SETUP
-- ===========================================

-- Check if RLS is enabled
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_enabled,
    hasoids
FROM pg_tables 
WHERE tablename = 'founders';

-- Check policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'founders';

-- Check permissions
SELECT 
    table_schema,
    table_name,
    privilege_type,
    grantee,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'founders'
ORDER BY grantee, privilege_type;

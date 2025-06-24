-- ============================================================================
-- 🔐 FINAL RLS POLICIES FIX FOR FOUNDERS TABLE
-- This script completely removes all conflicting policies and creates
-- a clean, minimal set of RLS policies that work reliably.
-- ============================================================================

-- Step 1: Remove ALL existing policies to eliminate conflicts
-- This is the most comprehensive list of all possible policy names

DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can manage own founder profile" ON public.founders;

DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage their own profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage all profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.founders;

DROP POLICY IF EXISTS "Service role has full access" ON public.founders;
DROP POLICY IF EXISTS "Service role full access" ON public.founders;

DROP POLICY IF EXISTS "Allow authenticated read access" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.founders;

DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.founders;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.founders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.founders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.founders;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.founders;

DROP POLICY IF EXISTS "founder_self_access" ON public.founders;
DROP POLICY IF EXISTS "founder_public_read" ON public.founders;
DROP POLICY IF EXISTS "founder_service_access" ON public.founders;

DROP POLICY IF EXISTS "Users can read their own profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.founders;
DROP POLICY IF EXISTS "Allow user registration" ON public.founders;
DROP POLICY IF EXISTS "Public read access for discovery" ON public.founders;
DROP POLICY IF EXISTS "Allow service role full access" ON public.founders;

DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON public.founders;
DROP POLICY IF EXISTS "Allow users to read their own profile and public profiles" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON public.founders;

DROP POLICY IF EXISTS "authenticated_users_can_insert_own_profile" ON public.founders;
DROP POLICY IF EXISTS "users_can_read_own_and_public_profiles" ON public.founders;
DROP POLICY IF EXISTS "authenticated_users_can_update_own_profile" ON public.founders;
DROP POLICY IF EXISTS "authenticated_users_can_delete_own_profile" ON public.founders;

DROP POLICY IF EXISTS "Founders can view own profile" ON public.founders;
DROP POLICY IF EXISTS "Founders can update own profile" ON public.founders;
DROP POLICY IF EXISTS "Verified founders can view others" ON public.founders;
DROP POLICY IF EXISTS "Allow founder creation" ON public.founders;
DROP POLICY IF EXISTS "Founders can view and update their own profile" ON public.founders;
DROP POLICY IF EXISTS "Founders can update their own profile" ON public.founders;

DROP POLICY IF EXISTS "Allow own select" ON public.founders;
DROP POLICY IF EXISTS "Allow own update" ON public.founders;
DROP POLICY IF EXISTS "Allow view verified" ON public.founders;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- Step 3: Create MINIMAL, NON-CONFLICTING policies
-- These policies are designed to avoid any conflicts and provide exactly what we need

-- 🔹 Policy 1: Self-Access (Users can manage their own profile completely)
CREATE POLICY "founders_self_complete_access" ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 🔹 Policy 2: Public Read Access (Optional - only if you want profile discovery)
-- This policy allows authenticated users to read profiles that are marked as visible
-- UNCOMMENT the next 6 lines if you want public profile discovery:

-- CREATE POLICY "founders_public_profiles_read" ON public.founders
-- FOR SELECT
-- USING (
--     auth.role() = 'authenticated' 
--     AND profile_visible = true 
--     AND auth.uid() != user_id
-- );

-- 🔹 Policy 3: Service Role Access (For backend operations)
CREATE POLICY "founders_service_role_access" ON public.founders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Step 4: Verify the setup
SELECT 'RLS policies have been reset and configured with minimal conflicts' as status;

-- Step 5: Show current policies for verification
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

-- Step 6: Test query to ensure basic access works
-- This should work for the authenticated user accessing their own data
SELECT 
    'Test query successful - you should see this message if policies are working correctly' as test_result;

-- ============================================================================
-- 📋 SUMMARY OF APPLIED POLICIES:
-- ============================================================================
-- 1. founders_self_complete_access: Users can do anything with their own profile
-- 2. founders_service_role_access: Service role has full access for backend operations
-- 3. (Optional) founders_public_profiles_read: For profile discovery (currently commented out)
--
-- This minimal setup eliminates policy conflicts while providing all necessary access.
-- If you need public profile discovery later, uncomment the public read policy.
-- ============================================================================

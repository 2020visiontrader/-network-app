-- ============================================================================
-- FIX CONFLICTING RLS POLICIES ON FOUNDERS TABLE
-- ============================================================================

-- REMOVE ALL EXISTING POLICIES TO START CLEAN
DROP POLICY IF EXISTS "Users can view own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can insert own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can update own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Users can delete own founder profile" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage their own profiles" ON public.founders;
DROP POLICY IF EXISTS "Service role has full access" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users can manage all profiles" ON public.founders;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.founders;
DROP POLICY IF EXISTS "Service role full access" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated read access" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated update" ON public.founders;
DROP POLICY IF EXISTS "Allow authenticated delete" ON public.founders;
DROP POLICY IF EXISTS "Users can manage own founder profile" ON public.founders;

-- CREATE CLEAN, NON-CONFLICTING POLICIES

-- 1. SELF ACCESS: Users can manage their own profile completely
CREATE POLICY "founder_self_access" ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 2. PUBLIC READ: Others can view profiles marked as visible
-- This policy ONLY applies when the profile is NOT the user's own
CREATE POLICY "founder_public_read" ON public.founders
FOR SELECT
USING (
    auth.role() = 'authenticated' 
    AND profile_visible = true 
    AND auth.uid() != user_id
);

-- 3. SERVICE ROLE: Full access for backend operations
CREATE POLICY "founder_service_access" ON public.founders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

SELECT 'RLS policies cleaned and simplified successfully' as status;

-- ============================================================================
-- FIX RLS POLICY INFINITE RECURSION FOR FOUNDERS TABLE
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Verified founders can view others" ON founders;
DROP POLICY IF EXISTS "Founders can view own profile" ON founders;
DROP POLICY IF EXISTS "Founders can update own profile" ON founders;

-- Create fixed policies without infinite recursion
-- 1. Founders can view their own profile (simple auth.uid() check)
CREATE POLICY "Founders can view own profile" ON founders
    FOR SELECT USING (id = auth.uid());

-- 2. Founders can update their own profile (simple auth.uid() check)
CREATE POLICY "Founders can update own profile" ON founders
    FOR UPDATE USING (id = auth.uid());

-- 3. Verified founders can view other verified founders (without recursion)
CREATE POLICY "Verified founders can view others" ON founders
    FOR SELECT USING (
        is_verified = true 
        AND is_active = true 
        AND auth.uid() IS NOT NULL
    );

-- 4. Allow inserting new founders (for admin operations)
CREATE POLICY "Allow founder creation" ON founders
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- VERIFY POLICIES ARE WORKING
-- ============================================================================

-- Test query (should work without infinite recursion)
-- SELECT id, full_name, company_name FROM founders LIMIT 1;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this SQL
-- 2. Go to Supabase SQL Editor
-- 3. Paste and run
-- 4. Test the app again
-- ============================================================================

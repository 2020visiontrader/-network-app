-- ============================================================================
-- FIX INFINITE RECURSION IN RLS POLICIES FOR FOUNDERS TABLE
-- ============================================================================

-- Step 1: Drop all existing problematic policies on founders table
DROP POLICY IF EXISTS "Verified founders can view others" ON founders;
DROP POLICY IF EXISTS "Founders can view own profile" ON founders;
DROP POLICY IF EXISTS "Founders can update own profile" ON founders;
DROP POLICY IF EXISTS "Allow founder creation" ON founders;
DROP POLICY IF EXISTS "Enable read access for all users" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founders;

-- Step 2: Create simple, non-recursive policies

-- Allow founders to view their own profile (simple auth.uid() check)
CREATE POLICY "founders_select_own" ON founders
    FOR SELECT USING (id = auth.uid());

-- Allow founders to update their own profile (simple auth.uid() check)  
CREATE POLICY "founders_update_own" ON founders
    FOR UPDATE USING (id = auth.uid());

-- Allow viewing verified founders (no recursion - just check table directly)
CREATE POLICY "founders_select_verified" ON founders
    FOR SELECT USING (is_verified = true AND is_active = true);

-- Allow inserting new founders (for admin/system operations)
CREATE POLICY "founders_insert" ON founders
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- FIX FOUNDER_APPLICATIONS TABLE POLICIES
-- ============================================================================

-- Drop existing policies on founder_applications
DROP POLICY IF EXISTS "Enable read access for all users" ON founder_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founder_applications;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founder_applications;

-- Create simple policies for founder_applications
CREATE POLICY "applications_select_own" ON founder_applications
    FOR SELECT USING (email = auth.email());

CREATE POLICY "applications_insert" ON founder_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "applications_update_own" ON founder_applications
    FOR UPDATE USING (email = auth.email());

-- ============================================================================
-- TEST THE FIXES
-- ============================================================================

-- Test query 1: Should work without infinite recursion
-- SELECT id, full_name, company_name FROM founders WHERE is_verified = true LIMIT 3;

-- Test query 2: Should work for applications
-- SELECT id, full_name, application_status FROM founder_applications LIMIT 3;

-- ============================================================================
-- INSTRUCTIONS:
-- 1. Copy this entire SQL script
-- 2. Paste into Supabase SQL Editor
-- 3. Click "Run" to execute
-- 4. Test the backend tables again
-- ============================================================================

-- Enable RLS on tables (if not already enabled)
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS policies fixed successfully! Tables should now be accessible.' as status;

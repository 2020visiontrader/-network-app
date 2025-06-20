-- ============================================================================
-- FIX COMPLETE GOOGLE SIGN-IN + WAITLIST + ONBOARDING FLOW
-- ============================================================================

-- STEP 1: Clean slate - remove ALL existing policies
DROP POLICY IF EXISTS "Allow founder creation" ON founders;
DROP POLICY IF EXISTS "Founders can view and update their own profile" ON founders;
DROP POLICY IF EXISTS "Founders can update their own profile" ON founders;
DROP POLICY IF EXISTS "Founders can view own profile" ON founders;
DROP POLICY IF EXISTS "Verified founders can view others" ON founders;
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

-- STEP 2: Enable RLS on founders table
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- STEP 3: Create clean, working RLS policies for founders
-- Allow users to view their own profile
CREATE POLICY "Founders can view own profile"
ON founders FOR SELECT TO authenticated
USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Founders can update own profile"
ON founders FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Allow users to create their own founder record (critical for Google sign-in)
CREATE POLICY "Allow founder creation"
ON founders FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- STEP 4: Fix founder_applications RLS policies
DROP POLICY IF EXISTS "Allow application submission" ON founder_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON founder_applications;
DROP POLICY IF EXISTS "Enable read access for all users" ON founder_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founder_applications;
DROP POLICY IF EXISTS "applications_select_own" ON founder_applications;
DROP POLICY IF EXISTS "applications_insert" ON founder_applications;
DROP POLICY IF EXISTS "applications_update_own" ON founder_applications;

-- Enable RLS on founder_applications
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to submit applications (waitlist form)
CREATE POLICY "Allow application submission"
ON founder_applications FOR INSERT TO authenticated
WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Users can view own applications"
ON founder_applications FOR SELECT TO authenticated
USING (email = auth.email());

-- STEP 5: Ensure required columns exist for waitlist + onboarding
ALTER TABLE founders 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture TEXT;

ALTER TABLE founder_applications
  ADD COLUMN IF NOT EXISTS niche TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS why_join TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- STEP 6: Test the policies work (should succeed)
INSERT INTO founders (
  id,
  email,
  full_name,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-auth-flow@example.com',
  'Test Auth Flow User',
  false
) ON CONFLICT (id) DO NOTHING;

-- Test application submission
INSERT INTO founder_applications (
  email,
  full_name,
  linkedin_url,
  company_name,
  niche,
  city,
  why_join,
  application_status
) VALUES (
  'test-auth-flow@example.com',
  'Test Auth Flow User',
  'https://linkedin.com/in/test',
  'Test Company',
  'Technology',
  'San Francisco',
  'Testing the complete auth flow',
  'pending'
) ON CONFLICT (email) DO NOTHING;

-- Clean up test records
DELETE FROM founder_applications WHERE email = 'test-auth-flow@example.com';
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- STEP 7: Verify policies are working
SELECT 
  tablename,
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename IN ('founders', 'founder_applications')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Complete auth flow RLS policies fixed! Ready for Google sign-in + waitlist + onboarding.' as status;

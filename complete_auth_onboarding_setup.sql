-- ============================================================================
-- COMPLETE AUTH + ONBOARDING SETUP FOR PROFESSIONAL NETWORKING APP
-- ============================================================================

-- STEP 1: Ensure founders table has all required columns for onboarding
ALTER TABLE founders 
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- STEP 2: Make sure email and full_name are required
ALTER TABLE founders 
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN full_name SET NOT NULL;

-- STEP 3: Drop ALL existing policies to prevent conflicts
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
DROP POLICY IF EXISTS "Founders can view and update their own profile" ON founders;

-- STEP 4: Enable RLS
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- STEP 5: Create clean, production-ready policies
CREATE POLICY "Allow founder creation" 
ON founders 
FOR INSERT 
WITH CHECK (id = auth.uid());

CREATE POLICY "Founders can view own profile"
ON founders
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Founders can update own profile"
ON founders
FOR UPDATE
USING (id = auth.uid());

-- STEP 6: Clean up founder_applications policies
DROP POLICY IF EXISTS "Enable read access for all users" ON founder_applications;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founder_applications;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founder_applications;
DROP POLICY IF EXISTS "applications_select_own" ON founder_applications;
DROP POLICY IF EXISTS "applications_insert" ON founder_applications;
DROP POLICY IF EXISTS "applications_update_own" ON founder_applications;
DROP POLICY IF EXISTS "Allow application insert" ON founder_applications;
DROP POLICY IF EXISTS "Allow own application view" ON founder_applications;
DROP POLICY IF EXISTS "Allow application submission" ON founder_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON founder_applications;

-- STEP 7: Create founder_applications policies
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow application submission"
ON founder_applications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can view own applications"
ON founder_applications
FOR SELECT
USING (email = auth.email());

-- STEP 8: Test the complete flow
-- Test 1: Create a founder record (simulating auth callback)
INSERT INTO founders (
  id,
  email,
  full_name,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-auth@example.com',
  'Test Auth User',
  false
) ON CONFLICT (id) DO NOTHING;

-- Test 2: Update founder with onboarding data (simulating onboarding completion)
UPDATE founders SET
  linkedin_url = 'https://linkedin.com/in/test',
  location_city = 'San Francisco',
  industry = 'Technology',
  tagline = 'Building the future',
  onboarding_completed = true
WHERE id = '00000000-0000-0000-0000-000000000001';

-- Test 3: Create founder application record
INSERT INTO founder_applications (
  email,
  full_name,
  linkedin_url,
  company_name,
  funding_stage,
  brief_description,
  application_status
) VALUES (
  'test-auth@example.com',
  'Test Auth User',
  'https://linkedin.com/in/test',
  'Test Company',
  'Technology',
  'Building the future',
  'approved'
) ON CONFLICT (email) DO NOTHING;

-- Clean up test records
DELETE FROM founder_applications WHERE email = 'test-auth@example.com';
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- STEP 9: Verify table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('id', 'email', 'full_name', 'linkedin_url', 'location_city', 'industry', 'tagline', 'onboarding_completed')
ORDER BY column_name;

-- STEP 10: Verify policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('founders', 'founder_applications')
ORDER BY tablename, policyname;

-- Success message
SELECT 'Complete auth + onboarding setup ready! Professional networking flow enabled.' as status;

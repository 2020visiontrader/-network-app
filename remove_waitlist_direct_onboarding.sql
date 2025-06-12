-- ============================================================================
-- REMOVE WAITLIST + DIRECT ONBOARDING WITH 250 FOUNDER CAP
-- ============================================================================

-- STEP 1: Clean up founders table RLS policies
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

-- STEP 3: Create clean RLS policies for direct onboarding
CREATE POLICY "Founders can view and update their own profile"
ON founders FOR SELECT, UPDATE TO authenticated
USING (id = auth.uid());

CREATE POLICY "Allow founder creation"
ON founders FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- STEP 4: Ensure required columns exist for direct onboarding
ALTER TABLE founders 
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS location_city TEXT,
  ADD COLUMN IF NOT EXISTS industry TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS profile_picture TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- STEP 5: Create function to check founder count (for 250 cap)
CREATE OR REPLACE FUNCTION get_founder_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM founders);
END;
$$ LANGUAGE plpgsql;

-- STEP 6: Create function to check if new signups are allowed
CREATE OR REPLACE FUNCTION can_create_new_founder()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM founders) < 250;
END;
$$ LANGUAGE plpgsql;

-- STEP 7: Test the functions
SELECT get_founder_count() as current_founder_count;
SELECT can_create_new_founder() as new_signups_allowed;

-- STEP 8: Test founder creation (should work)
INSERT INTO founders (
  id,
  email,
  full_name,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-direct-onboarding@example.com',
  'Test Direct User',
  false
) ON CONFLICT (id) DO NOTHING;

-- Clean up test record
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- STEP 9: Verify policies are working
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

-- Success message
SELECT 'Direct onboarding with 250 founder cap ready! Waitlist removed.' as status;

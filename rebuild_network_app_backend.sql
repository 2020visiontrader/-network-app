-- ============================================================================
-- REBUILD NETWORK APP - DIRECT ONBOARDING WITH 250 FOUNDER CAP
-- ============================================================================

-- STEP 1: Drop founder_applications table entirely (remove waitlist system)
DROP TABLE IF EXISTS founder_applications CASCADE;

-- STEP 2: Ensure founders table has correct structure
-- Drop and recreate to ensure clean schema
DROP TABLE IF EXISTS founders CASCADE;

CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  linkedin_url TEXT,
  industry TEXT,
  tagline TEXT,
  location_city TEXT,
  profile_photo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  member_number INTEGER UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Create function to assign member numbers sequentially (1-250)
CREATE OR REPLACE FUNCTION assign_member_number()
RETURNS TRIGGER AS $$
BEGIN
  -- Get the next available member number
  SELECT COALESCE(MAX(member_number), 0) + 1 
  INTO NEW.member_number 
  FROM founders;
  
  -- Ensure we don't exceed 250
  IF NEW.member_number > 250 THEN
    RAISE EXCEPTION 'Founder limit reached (250 max)';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 4: Create function to check founder limit
CREATE OR REPLACE FUNCTION check_founder_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM founders) >= 250 THEN
    RAISE EXCEPTION 'Founder limit reached (250 max)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- STEP 5: Create triggers for founder limit and member number assignment
CREATE TRIGGER limit_new_founders
  BEFORE INSERT ON founders
  FOR EACH ROW EXECUTE FUNCTION check_founder_limit();

CREATE TRIGGER assign_member_number_trigger
  BEFORE INSERT ON founders
  FOR EACH ROW EXECUTE FUNCTION assign_member_number();

-- STEP 6: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_founders_updated_at
  BEFORE UPDATE ON founders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- STEP 7: Enable Row Level Security
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- STEP 8: Drop all existing policies
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

-- STEP 9: Create clean RLS policies
-- Allow users to view their own profile
CREATE POLICY "Founders can view own profile"
ON founders FOR SELECT TO authenticated
USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Founders can update own profile"
ON founders FOR UPDATE TO authenticated
USING (id = auth.uid());

-- Allow insert only if under 250 limit (enforced by trigger)
CREATE POLICY "Allow founder creation under limit"
ON founders FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- STEP 10: Create helper functions for frontend
CREATE OR REPLACE FUNCTION get_founder_count()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM founders);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION can_accept_new_founders()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT COUNT(*) FROM founders) < 250;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_next_member_number()
RETURNS INTEGER AS $$
BEGIN
  RETURN (SELECT COALESCE(MAX(member_number), 0) + 1 FROM founders);
END;
$$ LANGUAGE plpgsql;

-- STEP 11: Test the setup
-- Test founder count functions
SELECT get_founder_count() as current_founders;
SELECT can_accept_new_founders() as accepting_new_founders;
SELECT get_next_member_number() as next_member_number;

-- Test founder creation (should work)
INSERT INTO founders (
  id,
  email,
  full_name,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-rebuild@example.com',
  'Test Rebuild User',
  false
) ON CONFLICT (id) DO NOTHING;

-- Verify member number was assigned
SELECT id, email, member_number, created_at 
FROM founders 
WHERE email = 'test-rebuild@example.com';

-- Clean up test record
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- STEP 12: Verify table structure
\d founders;

-- STEP 13: Verify policies
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

-- Success message
SELECT 'Network App backend rebuilt! Direct onboarding with 250 founder cap ready.' as status;

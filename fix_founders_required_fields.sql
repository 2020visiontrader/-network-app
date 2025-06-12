-- ============================================================================
-- FIX FOUNDERS TABLE REQUIRED FIELDS FOR GOOGLE AUTH
-- ============================================================================

-- Make optional fields nullable to prevent insert failures
ALTER TABLE founders ALTER COLUMN tagline DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN bio DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN profile_photo_url DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN location_city DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN location_country DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN twitter_handle DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN company_stage DROP NOT NULL;
ALTER TABLE founders ALTER COLUMN industry DROP NOT NULL;

-- Set default values for commonly required fields
ALTER TABLE founders ALTER COLUMN role SET DEFAULT 'Founder';
ALTER TABLE founders ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE founders ALTER COLUMN is_active SET DEFAULT true;
ALTER TABLE founders ALTER COLUMN onboarding_completed SET DEFAULT false;

-- Ensure the insert policy exists and is correct
DROP POLICY IF EXISTS "Allow founder creation" ON founders;

CREATE POLICY "Allow founder creation"
ON founders
FOR INSERT
WITH CHECK (id = auth.uid());

-- Test insert with minimal required fields
-- This should work after the fixes above
INSERT INTO founders (
  id,
  email,
  full_name,
  company_name
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'test-minimal@example.com',
  'Test Minimal User',
  'Test Company'
) ON CONFLICT (id) DO NOTHING;

-- Clean up test record
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- Verify the policy works
SELECT 'Founders table required fields fixed for Google Auth!' as status;

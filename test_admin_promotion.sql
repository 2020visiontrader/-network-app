-- ============================================================================
-- QUICK ADMIN PROMOTION FOR TESTING
-- ============================================================================

-- Function to quickly promote a user for testing
-- Replace 'test@example.com' with the actual email you want to promote

-- STEP 1: Check if application exists
SELECT 
  email,
  full_name,
  application_status,
  created_at
FROM founder_applications 
WHERE email = 'YOUR_TEST_EMAIL_HERE'
ORDER BY created_at DESC;

-- STEP 2: Promote user to founders table (replace email and generate new UUID)
-- Note: The id will be updated to auth.uid() when they sign in with Google
INSERT INTO founders (
  id,
  email,
  full_name,
  linkedin_url,
  location_city,
  industry,
  tagline,
  onboarding_completed
) 
SELECT 
  gen_random_uuid(), -- Temporary ID, will be replaced by auth.uid()
  email,
  full_name,
  linkedin_url,
  city,
  niche,
  why_join,
  false
FROM founder_applications 
WHERE email = 'YOUR_TEST_EMAIL_HERE'
  AND application_status = 'pending'
ON CONFLICT (email) DO NOTHING;

-- STEP 3: Update application status to approved
UPDATE founder_applications 
SET application_status = 'approved'
WHERE email = 'YOUR_TEST_EMAIL_HERE';

-- STEP 4: Verify the promotion worked
SELECT 
  'Application Status' as type,
  email,
  full_name,
  application_status as status
FROM founder_applications 
WHERE email = 'YOUR_TEST_EMAIL_HERE'

UNION ALL

SELECT 
  'Founder Status' as type,
  email,
  full_name,
  CASE WHEN onboarding_completed THEN 'Onboarded' ELSE 'Needs Onboarding' END as status
FROM founders 
WHERE email = 'YOUR_TEST_EMAIL_HERE';

-- SUCCESS MESSAGE
SELECT 'User promoted successfully! They can now sign in with Google and access onboarding.' as result;

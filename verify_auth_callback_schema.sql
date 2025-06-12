-- ============================================================================
-- VERIFY AUTH CALLBACK SCHEMA REQUIREMENTS
-- ============================================================================

-- Check if founder_applications table has required columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'founder_applications' 
  AND column_name IN ('application_status', 'email')
ORDER BY column_name;

-- Check if founders table has required columns
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('onboarding_completed', 'email')
ORDER BY column_name;

-- Check application_status values
SELECT DISTINCT application_status 
FROM founder_applications 
WHERE application_status IS NOT NULL;

-- Check onboarding_completed values
SELECT DISTINCT onboarding_completed 
FROM founders 
WHERE onboarding_completed IS NOT NULL;

-- Test query that auth callback will use
SELECT 
  'Testing auth callback queries' as test_description,
  (
    SELECT COUNT(*) 
    FROM founder_applications 
    WHERE email = 'test@example.com'
  ) as application_query_works,
  (
    SELECT COUNT(*) 
    FROM founders 
    WHERE email = 'test@example.com'
  ) as founder_query_works;

-- Success message
SELECT 'Auth callback schema verification complete!' as status;

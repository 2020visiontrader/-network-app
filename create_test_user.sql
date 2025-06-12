-- ============================================================================
-- CREATE TEST USER FOR LOGIN TESTING
-- ============================================================================

-- First, create a test founder in the founders table
INSERT INTO founders (
  id,
  email,
  full_name,
  company_name,
  role,
  linkedin_url,
  is_verified,
  is_active,
  member_number,
  onboarding_completed
) VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'test@founder.com',
  'Test Founder',
  'Test Startup',
  'CEO',
  'https://linkedin.com/in/test',
  true,
  true,
  1,
  true
) ON CONFLICT (email) DO NOTHING;

-- Note: You'll need to create the auth user manually in Supabase Auth dashboard
-- Go to Authentication > Users > Add User
-- Email: test@founder.com
-- Password: test123!
-- User ID: 550e8400-e29b-41d4-a716-446655440000

-- Test query to verify
SELECT id, email, full_name, is_verified, is_active FROM founders WHERE email = 'test@founder.com';

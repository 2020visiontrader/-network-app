-- ============================================================================
-- REQUIRED SUPABASE SETUP FOR AUTH CALLBACK
-- ============================================================================

-- STEP 1: Ensure founders table has required columns
-- Check if photo_url column exists, add if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'founders' AND column_name = 'photo_url') THEN
        ALTER TABLE founders ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- STEP 2: Make sure required columns are properly configured
-- Ensure these columns exist and have correct types
ALTER TABLE founders 
  ALTER COLUMN full_name SET NOT NULL,
  ALTER COLUMN email SET NOT NULL,
  ALTER COLUMN onboarding_completed SET DEFAULT false;

-- Make photo_url nullable (optional field)
ALTER TABLE founders ALTER COLUMN photo_url DROP NOT NULL;

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

-- STEP 5: Create the exact required policy
CREATE POLICY "Allow founder creation" 
ON founders 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- STEP 6: Add select and update policies for completeness
CREATE POLICY "Founders can view own profile"
ON founders
FOR SELECT
USING (id = auth.uid());

CREATE POLICY "Founders can update own profile"
ON founders
FOR UPDATE
USING (id = auth.uid());

-- STEP 7: Test the setup
-- This insert should work with the auth callback logic
INSERT INTO founders (
  id,
  full_name,
  email,
  photo_url,
  onboarding_completed
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test User',
  'test@example.com',
  '',
  false
) ON CONFLICT (id) DO NOTHING;

-- Clean up test record
DELETE FROM founders WHERE id = '00000000-0000-0000-0000-000000000001';

-- STEP 8: Verify the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND column_name IN ('id', 'full_name', 'email', 'photo_url', 'onboarding_completed')
ORDER BY column_name;

-- STEP 9: Verify policies exist
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

-- Success message
SELECT 'Required Supabase setup complete! Auth callback should now work.' as status;

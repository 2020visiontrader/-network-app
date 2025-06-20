-- 🎯 COMPLETE DATABASE OPTIMIZATION & SECURITY FIX
-- Run this entire script in Supabase SQL Editor

-- ====================================
-- 1. CLEAN UP EXISTING POLICIES
-- ====================================

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can read their own profile" ON founders;
DROP POLICY IF EXISTS "Users can update their own profile" ON founders;
DROP POLICY IF EXISTS "Allow user registration" ON founders;
DROP POLICY IF EXISTS "Public read access for discovery" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Allow service role full access" ON founders;
DROP POLICY IF EXISTS "Allow authenticated users to insert their own profile" ON founders;
DROP POLICY IF EXISTS "Allow users to read their own profile and public profiles" ON founders;
DROP POLICY IF EXISTS "Allow authenticated users to update their own profile" ON founders;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own profile" ON founders;

-- ====================================
-- 2. CREATE OPTIMIZED RLS POLICIES
-- ====================================

-- Policy 1: Allow authenticated users to create their own profile
CREATE POLICY "authenticated_users_can_insert_own_profile" ON founders
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own profile and visible public profiles
CREATE POLICY "users_can_read_own_and_public_profiles" ON founders
  FOR SELECT 
  USING (
    auth.uid() = id OR 
    (is_visible = true AND onboarding_complete = true)
  );

-- Policy 3: Allow authenticated users to update their own profile
CREATE POLICY "authenticated_users_can_update_own_profile" ON founders
  FOR UPDATE 
  USING (auth.uid() = id) 
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow authenticated users to delete their own profile  
CREATE POLICY "authenticated_users_can_delete_own_profile" ON founders
  FOR DELETE 
  USING (auth.uid() = id);

-- ====================================
-- 3. ENSURE REQUIRED COLUMNS EXIST
-- ====================================

-- Add any missing columns for complete onboarding functionality
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT;

-- ====================================
-- 4. CREATE STORAGE POLICIES (for when bucket exists)
-- ====================================

-- Note: These will only work after you create the 'avatars' bucket
-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view avatars" ON storage.objects;

-- Create storage policies for avatar uploads
CREATE POLICY "authenticated_upload_own_avatar" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "public_read_avatars" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatars');

CREATE POLICY "authenticated_update_own_avatar" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "authenticated_delete_own_avatar" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================
-- 5. ENABLE RLS AND OPTIMIZE
-- ====================================

-- Ensure RLS is enabled
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Update existing test user for better testing
UPDATE founders 
SET 
  is_visible = true,
  onboarding_complete = false,
  updated_at = NOW()
WHERE email = 'hellonetworkapp@gmail.com';

-- ====================================
-- 6. CREATE FUNCTION FOR PROFILE VALIDATION
-- ====================================

-- Function to validate profile completeness
CREATE OR REPLACE FUNCTION validate_profile_completion(profile_data founders)
RETURNS boolean AS $$
BEGIN
  RETURN (
    profile_data.full_name IS NOT NULL AND 
    profile_data.role IS NOT NULL AND 
    profile_data.location IS NOT NULL AND
    profile_data.linkedin_url IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- 7. VERIFICATION QUERIES
-- ====================================

-- Test that policies work correctly
SELECT 'Database optimization complete!' as status;

-- Show current user for testing
SELECT 
  id,
  email, 
  full_name,
  onboarding_complete,
  is_visible,
  created_at
FROM founders 
WHERE email = 'hellonetworkapp@gmail.com';

-- Show policy summary
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

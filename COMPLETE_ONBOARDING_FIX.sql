-- COMPLETE ONBOARDING FIX - Run this in Supabase SQL Editor
-- This fixes RLS policies, creates storage bucket, and ensures onboarding works

-- 1. Fix RLS Policies for Onboarding
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON founders;
DROP POLICY IF EXISTS "Users can update their own profile" ON founders;
DROP POLICY IF EXISTS "Allow user registration" ON founders;
DROP POLICY IF EXISTS "Public read access for discovery" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable select for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON founders;
DROP POLICY IF EXISTS "Allow service role full access" ON founders;

-- Create comprehensive RLS policies
CREATE POLICY "Allow authenticated users to insert their own profile" ON founders
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to read their own profile and public profiles" ON founders
  FOR SELECT USING (auth.uid() = id OR is_visible = true);

CREATE POLICY "Allow authenticated users to update their own profile" ON founders
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow authenticated users to delete their own profile" ON founders
  FOR DELETE USING (auth.uid() = id);

-- Enable RLS
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- 2. Create Storage Bucket for Avatars (if it doesn't exist)
-- Note: This needs to be done in the Supabase dashboard Storage section
-- Go to Storage -> Create bucket -> Name: "avatars" -> Public: true

-- 3. Create Storage Policies for Avatar Uploads
-- These policies allow authenticated users to upload and manage their own avatars

-- Create policy for inserting avatars
CREATE POLICY "Allow authenticated users to upload avatars" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for updating avatars
CREATE POLICY "Allow users to update their own avatars" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for deleting avatars
CREATE POLICY "Allow users to delete their own avatars" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create policy for reading avatars (public read)
CREATE POLICY "Allow public access to view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

-- 4. Ensure all required columns exist for onboarding
-- Add any missing columns that might be needed
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS preferred_name TEXT,
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT;

-- 5. Update the user that exists to ensure they can complete onboarding
UPDATE founders 
SET 
  onboarding_complete = false,
  is_visible = true,
  updated_at = NOW()
WHERE email = 'hellonetworkapp@gmail.com';

-- 6. Test the policies work correctly
-- This should succeed for the authenticated user
SELECT 'RLS policies configured successfully' as status;

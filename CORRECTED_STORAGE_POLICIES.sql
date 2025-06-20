-- 🔧 CORRECTED STORAGE POLICIES FOR "AVATAR" BUCKET
-- Run this in Supabase SQL Editor to fix bucket name mismatch

-- ====================================
-- REMOVE OLD POLICIES (for "avatars" bucket)
-- ====================================

DROP POLICY IF EXISTS "authenticated_upload_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "public_read_avatars" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_avatar" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_avatar" ON storage.objects;

-- Also remove any policies that might reference "avatars" (plural)
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Allow public access to view avatars" ON storage.objects;

-- ====================================
-- CREATE CORRECT POLICIES FOR "AVATAR" BUCKET
-- ====================================

-- Policy 1: Allow authenticated users to upload to avatar bucket
CREATE POLICY "authenticated_upload_own_avatar_correct" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 2: Allow public read access to avatar bucket
CREATE POLICY "public_read_avatar_correct" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatar');

-- Policy 3: Allow authenticated users to update their own avatars
CREATE POLICY "authenticated_update_own_avatar_correct" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy 4: Allow authenticated users to delete their own avatars
CREATE POLICY "authenticated_delete_own_avatar_correct" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'avatar' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- ====================================
-- VERIFICATION
-- ====================================

-- Check that policies were created correctly
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%avatar%'
ORDER BY policyname;

-- Success message
SELECT 'Storage policies updated for "avatar" bucket!' as status;

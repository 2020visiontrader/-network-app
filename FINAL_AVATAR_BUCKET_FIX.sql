-- FINAL FIX FOR "AVATAR" BUCKET (SINGULAR)
-- Run this in Supabase SQL Editor

-- Remove any old policies first
DROP POLICY IF EXISTS "authenticated_upload_own_avatar_correct" ON storage.objects;
DROP POLICY IF EXISTS "public_read_avatar_correct" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_update_own_avatar_correct" ON storage.objects;
DROP POLICY IF EXISTS "authenticated_delete_own_avatar_correct" ON storage.objects;

-- Create fresh policies for "avatar" bucket
CREATE POLICY "avatar_bucket_insert" ON storage.objects
  FOR INSERT 
  WITH CHECK (bucket_id = 'avatar');

CREATE POLICY "avatar_bucket_select" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatar');

CREATE POLICY "avatar_bucket_update" ON storage.objects
  FOR UPDATE 
  USING (bucket_id = 'avatar');

CREATE POLICY "avatar_bucket_delete" ON storage.objects
  FOR DELETE 
  USING (bucket_id = 'avatar');

-- Verify policies
SELECT 'Policies created for avatar bucket!' as status;

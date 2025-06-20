# SUPABASE STORAGE BUCKET SETUP
# Complete these steps in your Supabase dashboard to fix onboarding image uploads

## Step 1: Create Avatar Storage Bucket
1. Go to your Supabase dashboard
2. Navigate to Storage in the left sidebar
3. Click "Create bucket"
4. Set the following:
   - Bucket name: `avatars`
   - Public bucket: ✅ (checked)
   - File size limit: 50MB (or as needed)
   - Allowed MIME types: `image/*`

## Step 2: Configure Bucket Policies
The SQL script `COMPLETE_ONBOARDING_FIX.sql` includes the storage policies.
Run that script after creating the bucket.

## Step 3: Test Storage Access
You can test the storage bucket by:
1. Going to Storage -> avatars bucket
2. Try uploading a test image
3. Verify the image is accessible via public URL

## Alternative: Manual Policy Creation
If the SQL policies don't work, create them manually in Storage -> Policies:

### Policy 1: Upload Policy
- Name: "Users can upload their own avatars"
- Allowed operation: INSERT
- Target: storage.objects
- With check: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

### Policy 2: Read Policy  
- Name: "Anyone can view avatars"
- Allowed operation: SELECT
- Target: storage.objects
- Using: `bucket_id = 'avatars'`

### Policy 3: Update Policy
- Name: "Users can update their own avatars" 
- Allowed operation: UPDATE
- Target: storage.objects
- Using: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

### Policy 4: Delete Policy
- Name: "Users can delete their own avatars"
- Allowed operation: DELETE
- Target: storage.objects
- Using: `bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]`

## After Setup
1. Run the SQL script: `COMPLETE_ONBOARDING_FIX.sql`
2. Test the mobile app onboarding flow
3. Verify image uploads work properly
4. Check that profile updates save successfully

## Common Issues
- If uploads fail: Check bucket permissions and policies
- If images don't display: Verify bucket is public and URLs are correct
- If policies fail: Manually create them in the dashboard
- If still issues: Check the browser console for specific error messages

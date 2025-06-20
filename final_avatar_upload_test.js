const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMTY4MzEsImV4cCI6MjA1MDg5MjgzMX0.z0KlhZd8dR9iBEwLXQwMZGQnWevxVXm7kJ5b9VLNWdw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAvatarUpload() {
    console.log('🧪 Final Avatar Upload Test');
    console.log('============================');
    
    try {
        // 1. Check bucket existence and access
        console.log('\n1️⃣ Checking bucket access...');
        const { data: bucketData, error: bucketError } = await supabase.storage
            .from('avatar')
            .list('', { limit: 1 });
            
        if (bucketError) {
            console.log('❌ Bucket access error:', bucketError.message);
            return;
        }
        console.log('✅ Avatar bucket accessible');
        
        // 2. Create a test file for upload
        console.log('\n2️⃣ Creating test image file...');
        const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        const testFileName = `test-avatar-${Date.now()}.png`;
        
        // 3. Test upload with various auth states
        console.log('\n3️⃣ Testing upload (anonymous)...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(testFileName, testImageContent, {
                contentType: 'image/png',
                upsert: true
            });
            
        if (uploadError) {
            console.log('❌ Upload error:', uploadError.message);
            console.log('Error details:', uploadError);
        } else {
            console.log('✅ Upload successful:', uploadData.path);
            
            // 4. Test public URL generation
            console.log('\n4️⃣ Testing public URL generation...');
            const { data: urlData } = supabase.storage
                .from('avatar')
                .getPublicUrl(uploadData.path);
                
            console.log('✅ Public URL:', urlData.publicUrl);
            
            // 5. Test file retrieval
            console.log('\n5️⃣ Testing file download...');
            const { data: downloadData, error: downloadError } = await supabase.storage
                .from('avatar')
                .download(uploadData.path);
                
            if (downloadError) {
                console.log('❌ Download error:', downloadError.message);
            } else {
                console.log('✅ Download successful, size:', downloadData.size, 'bytes');
            }
            
            // 6. Clean up test file
            console.log('\n6️⃣ Cleaning up test file...');
            const { error: deleteError } = await supabase.storage
                .from('avatar')
                .remove([uploadData.path]);
                
            if (deleteError) {
                console.log('⚠️  Cleanup warning:', deleteError.message);
            } else {
                console.log('✅ Test file cleaned up');
            }
        }
        
        // 7. Test with authenticated user scenario
        console.log('\n7️⃣ Testing authenticated upload scenario...');
        console.log('Creating a test user session...');
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: `test-${Date.now()}@example.com`,
            password: 'TestPassword123!'
        });
        
        if (authError && authError.message !== 'User already registered') {
            console.log('❌ Auth test error:', authError.message);
        } else {
            console.log('✅ Test user session created or exists');
            
            const authenticatedFileName = `auth-test-${Date.now()}.png`;
            const { data: authUploadData, error: authUploadError } = await supabase.storage
                .from('avatar')
                .upload(authenticatedFileName, testImageContent, {
                    contentType: 'image/png',
                    upsert: true
                });
                
            if (authUploadError) {
                console.log('❌ Authenticated upload error:', authUploadError.message);
            } else {
                console.log('✅ Authenticated upload successful:', authUploadData.path);
                
                // Cleanup
                await supabase.storage.from('avatar').remove([authUploadData.path]);
            }
        }
        
        console.log('\n📋 FINAL RESULT:');
        console.log('================');
        if (!uploadError) {
            console.log('🎉 AVATAR UPLOAD IS WORKING!');
            console.log('✅ The "avatar" bucket is accessible');
            console.log('✅ File uploads are successful');
            console.log('✅ Public URLs are generated');
            console.log('✅ Your app should now work correctly');
        } else {
            console.log('❌ AVATAR UPLOAD STILL HAS ISSUES');
            console.log('🔍 Check the error details above');
            console.log('💡 May need additional Supabase configuration');
        }
        
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
        console.log('Full error:', error);
    }
}

testAvatarUpload();

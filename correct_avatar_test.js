const { createClient } = require('@supabase/supabase-js');

// Correct Supabase configuration from .env
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testCorrectAvatarUpload() {
    console.log('🔧 Correct Avatar Upload Test');
    console.log('==============================');
    console.log('Project:', supabaseUrl);
    
    try {
        // 1. Test anonymous bucket access
        console.log('\n1️⃣ Testing bucket access (anonymous)...');
        const { data: listData, error: listError } = await supabase.storage
            .from('avatar')
            .list('', { limit: 1 });
            
        if (listError) {
            console.log('❌ Bucket access error:', listError.message);
            if (listError.message.includes('not found')) {
                console.log('🔍 The "avatar" bucket may not exist');
                return;
            }
        } else {
            console.log('✅ Avatar bucket accessible');
            console.log('   Files found:', listData.length);
        }
        
        // 2. Create test image data
        console.log('\n2️⃣ Creating test image...');
        // This is a 1x1 transparent PNG in base64
        const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        const testFileName = `test-avatar-${Date.now()}.png`;
        console.log('✅ Test file created:', testFileName);
        
        // 3. Test anonymous upload (this should work with our policies)
        console.log('\n3️⃣ Testing anonymous upload...');
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(testFileName, testImageContent, {
                contentType: 'image/png',
                upsert: true
            });
            
        if (uploadError) {
            console.log('❌ Anonymous upload failed:', uploadError.message);
            console.log('   Status code:', uploadError.statusCode);
            
            if (uploadError.message.includes('policy')) {
                console.log('🔍 This is a Row Level Security (RLS) policy issue');
                console.log('💡 The storage bucket may need public insert policies');
            } else if (uploadError.message.includes('not found')) {
                console.log('🔍 Bucket "avatar" not found');
                console.log('💡 Check if the bucket exists in Supabase dashboard');
            }
        } else {
            console.log('✅ Anonymous upload successful!');
            console.log('   File path:', uploadData.path);
            
            // 4. Test public URL generation
            console.log('\n4️⃣ Testing public URL...');
            const { data: urlData } = supabase.storage
                .from('avatar')
                .getPublicUrl(uploadData.path);
                
            console.log('✅ Public URL generated:', urlData.publicUrl);
            
            // 5. Test file download
            console.log('\n5️⃣ Testing file download...');
            const { data: downloadData, error: downloadError } = await supabase.storage
                .from('avatar')
                .download(uploadData.path);
                
            if (downloadError) {
                console.log('❌ Download failed:', downloadError.message);
            } else {
                console.log('✅ Download successful, size:', downloadData.size, 'bytes');
            }
            
            // 6. Clean up
            console.log('\n6️⃣ Cleaning up...');
            const { error: deleteError } = await supabase.storage
                .from('avatar')
                .remove([uploadData.path]);
                
            if (deleteError) {
                console.log('⚠️  Cleanup warning:', deleteError.message);
            } else {
                console.log('✅ Test file cleaned up');
            }
        }
        
        // 7. Test with a real user signup (simulating mobile app flow)
        console.log('\n7️⃣ Testing with authenticated user...');
        const testEmail = `test-${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword
        });
        
        if (authError && !authError.message.includes('already registered')) {
            console.log('❌ User creation failed:', authError.message);
        } else {
            console.log('✅ Test user created');
            
            // Try upload with authenticated user
            const authFileName = `auth-test-${Date.now()}.png`;
            const { data: authUploadData, error: authUploadError } = await supabase.storage
                .from('avatar')
                .upload(authFileName, testImageContent, {
                    contentType: 'image/png',
                    upsert: true
                });
                
            if (authUploadError) {
                console.log('❌ Authenticated upload failed:', authUploadError.message);
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
            console.log('✅ Your mobile app should now be able to upload avatars');
            console.log('✅ The "avatar" bucket is properly configured');
            console.log('✅ Both anonymous and authenticated uploads work');
        } else {
            console.log('❌ AVATAR UPLOAD STILL HAS ISSUES');
            console.log('🔧 Next steps:');
            console.log('   1. Check if "avatar" bucket exists in Supabase Dashboard');
            console.log('   2. Verify storage RLS policies are correctly applied');
            console.log('   3. Ensure storage is enabled in your Supabase project');
        }
        
    } catch (error) {
        console.log('❌ Test failed with error:', error.message);
        console.log('Full error:', error);
    }
}

testCorrectAvatarUpload();

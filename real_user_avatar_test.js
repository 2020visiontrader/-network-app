const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzMTY4MzEsImV4cCI6MjA1MDg5MjgzMX0.z0KlhZd8dR9iBEwLXQwMZGQnWevxVXm7kJ5b9VLNWdw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealUserFlow() {
    console.log('🔐 Real User Flow Avatar Test');
    console.log('=============================');
    
    try {
        // 1. Sign up a test user (simulating the app flow)
        console.log('\n1️⃣ Creating test user (simulating app signup)...');
        const testEmail = `testuser${Date.now()}@example.com`;
        const testPassword = 'TestPassword123!';
        
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword
        });
        
        if (signUpError && !signUpError.message.includes('already registered')) {
            console.log('❌ Signup error:', signUpError.message);
            return;
        }
        
        console.log('✅ Test user created/exists');
        
        // 2. Try to sign in (get proper session)
        console.log('\n2️⃣ Signing in to get session...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (signInError) {
            console.log('❌ Sign in error:', signInError.message);
            // Try with a known working account
            console.log('Trying with existing account...');
            const { data: existingSignIn, error: existingError } = await supabase.auth.signInWithPassword({
                email: 'test@example.com',
                password: 'password123'
            });
            
            if (existingError) {
                console.log('❌ No working account found. Testing anonymous upload...');
            } else {
                console.log('✅ Signed in with existing account');
            }
        } else {
            console.log('✅ Signed in successfully');
            console.log('User ID:', signInData.user?.id);
        }
        
        // 3. Test avatar upload with current session
        console.log('\n3️⃣ Testing avatar upload with current session...');
        
        // Create a minimal test image
        const testImageContent = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
        const testFileName = `user-avatar-${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatar')
            .upload(testFileName, testImageContent, {
                contentType: 'image/png',
                upsert: true
            });
        
        if (uploadError) {
            console.log('❌ Upload failed:', uploadError.message);
            console.log('Error code:', uploadError.statusCode);
            console.log('Full error:', uploadError);
            
            // Check if it's a policy issue
            if (uploadError.message.includes('policy')) {
                console.log('\n🔍 This appears to be a Row Level Security (RLS) policy issue');
                console.log('💡 The storage bucket policies may need adjustment');
            } else if (uploadError.message.includes('not found')) {
                console.log('\n🔍 This appears to be a bucket existence issue');
                console.log('💡 The "avatar" bucket may not exist or be accessible');
            }
        } else {
            console.log('✅ Upload successful!');
            console.log('File path:', uploadData.path);
            
            // Test getting public URL
            const { data: urlData } = supabase.storage
                .from('avatar')
                .getPublicUrl(uploadData.path);
            
            console.log('✅ Public URL generated:', urlData.publicUrl);
            
            // Cleanup
            await supabase.storage.from('avatar').remove([uploadData.path]);
            console.log('✅ Test file cleaned up');
        }
        
        // 4. Test bucket listing (for debugging)
        console.log('\n4️⃣ Testing bucket listing...');
        const { data: listData, error: listError } = await supabase.storage
            .from('avatar')
            .list('', { limit: 5 });
            
        if (listError) {
            console.log('❌ List error:', listError.message);
        } else {
            console.log('✅ Can list bucket contents:', listData.length, 'files');
        }
        
        console.log('\n📋 SUMMARY:');
        console.log('===========');
        if (!uploadError) {
            console.log('🎉 SUCCESS! Avatar upload is working');
            console.log('✅ Your mobile app should now be able to upload avatars');
        } else {
            console.log('❌ Avatar upload still has issues');
            console.log('🔧 Recommended next steps:');
            console.log('   1. Check Supabase dashboard for storage bucket');
            console.log('   2. Verify RLS policies are applied correctly');
            console.log('   3. Ensure service role key has proper permissions');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

testRealUserFlow();

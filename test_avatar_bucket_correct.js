const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testAvatarBucket() {
  console.log('🔍 Testing "avatar" Bucket (Singular)');
  console.log('===================================');
  
  try {
    // Test 1: List all buckets to find the correct name
    console.log('\n1️⃣ Finding Available Buckets...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Storage list error:', listError.message);
      return;
    }
    
    console.log('✅ Storage system accessible');
    console.log('   Available buckets:', buckets.map(b => b.name).join(', ') || 'None');
    
    // Test 2: Check for "avatar" bucket specifically
    const avatarBucket = buckets.find(b => b.name === 'avatar');
    
    if (avatarBucket) {
      console.log('\n2️⃣ Testing "avatar" Bucket...');
      console.log('✅ Found "avatar" bucket!');
      console.log('   - Name:', avatarBucket.name);
      console.log('   - Public:', avatarBucket.public);
      console.log('   - Created:', avatarBucket.created_at);
      
      // Test 3: Try to access the bucket
      const { data: files, error: accessError } = await supabase.storage
        .from('avatar')
        .list('', { limit: 1 });
      
      if (accessError) {
        console.log('❌ Bucket access error:', accessError.message);
      } else {
        console.log('✅ Bucket accessible');
        console.log('   - Files in bucket:', files?.length || 0);
      }
      
      // Test 4: Test public URL generation
      const { data: urlData } = supabase.storage
        .from('avatar')
        .getPublicUrl('test-file.jpg');
      
      if (urlData?.publicUrl) {
        console.log('✅ Public URL generation works');
        console.log('   - Sample URL:', urlData.publicUrl);
      }
      
      // Test 5: Test upload capability
      console.log('\n3️⃣ Testing Upload Capability...');
      
      const testData = new Uint8Array([1, 2, 3, 4]);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatar')
        .upload('test-connection.txt', testData, {
          contentType: 'text/plain',
          upsert: true
        });
      
      if (uploadError) {
        console.log('❌ Upload test failed:', uploadError.message);
        
        if (uploadError.message.includes('policy')) {
          console.log('   → Need to update storage policies for "avatar" bucket');
        }
      } else {
        console.log('✅ Upload test successful!');
        console.log('   - File uploaded to:', uploadData?.path);
        
        // Clean up test file
        await supabase.storage.from('avatar').remove(['test-connection.txt']);
        console.log('   - Test file cleaned up');
      }
      
    } else {
      console.log('\n❌ "avatar" bucket not found');
      console.log('   Available buckets:', buckets.map(b => b.name));
    }
    
    console.log('\n🔧 REQUIRED CODE CHANGES:');
    console.log('Since your bucket is named "avatar" (not "avatars"), we need to update:');
    console.log('1. OnboardingScreen.js - change "avatars" to "avatar"');
    console.log('2. SQL policies - update bucket_id references');
    console.log('3. All storage references in the app');
    
  } catch (error) {
    console.error('❌ Avatar bucket test failed:', error.message);
  }
}

testAvatarBucket();

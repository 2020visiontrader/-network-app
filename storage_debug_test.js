const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function storageDebugTest() {
  console.log('🔧 Storage Debug Test');
  console.log('====================');
  console.log('Project:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  
  const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );
  
  try {
    // Test 1: List buckets
    console.log('\n1️⃣ Listing storage buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ List error:', listError.message);
      console.log('   Status code:', listError.statusCode);
      return;
    }
    
    console.log('✅ Storage API working');
    console.log('Buckets found:', buckets?.length || 0);
    
    if (buckets && buckets.length > 0) {
      console.log('\nBucket details:');
      buckets.forEach((bucket, i) => {
        console.log(`${i + 1}. ${bucket.name} (public: ${bucket.public})`);
      });
    } else {
      console.log('No buckets found in API response');
    }
    
    // Test 2: Direct bucket access attempts
    console.log('\n2️⃣ Testing direct bucket access...');
    
    // Try avatar
    try {
      const { data: avatarTest, error: avatarError } = await supabase.storage
        .from('avatar')
        .list('', { limit: 1 });
      
      if (avatarError) {
        console.log('❌ "avatar" error:', avatarError.message);
      } else {
        console.log('✅ "avatar" bucket works! Files:', avatarTest?.length || 0);
      }
    } catch (e) {
      console.log('❌ "avatar" exception:', e.message);
    }
    
    // Try avatars
    try {
      const { data: avatarsTest, error: avatarsError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 });
      
      if (avatarsError) {
        console.log('❌ "avatars" error:', avatarsError.message);
      } else {
        console.log('✅ "avatars" bucket works! Files:', avatarsTest?.length || 0);
      }
    } catch (e) {
      console.log('❌ "avatars" exception:', e.message);
    }
    
    // Test 3: URL generation
    console.log('\n3️⃣ Testing URL generation...');
    
    try {
      const { data: urlData } = supabase.storage
        .from('avatar')
        .getPublicUrl('test.jpg');
      
      console.log('✅ "avatar" URL generation works');
      console.log('   Sample URL:', urlData?.publicUrl);
    } catch (e) {
      console.log('❌ "avatar" URL generation failed:', e.message);
    }
    
  } catch (error) {
    console.log('❌ Test crashed:', error.message);
  }
  
  console.log('\n📋 SUMMARY:');
  console.log('- If buckets list is empty but direct access works = bucket exists but API issue');
  console.log('- If direct access fails = bucket doesn\'t exist or wrong name');  
  console.log('- If URL generation works = bucket path is recognized');
}

storageDebugTest();

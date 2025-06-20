const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function quickAvatarTest() {
  console.log('🔍 Quick "avatar" Bucket Test');
  console.log('============================');
  
  try {
    // Test 1: List buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Error:', listError.message);
      return;
    }
    
    console.log('Available buckets:', buckets.map(b => b.name));
    
    // Test 2: Check "avatar" bucket
    const avatarBucket = buckets.find(b => b.name === 'avatar');
    
    if (avatarBucket) {
      console.log('✅ Found "avatar" bucket');
      console.log('   - Public:', avatarBucket.public);
      
      // Test 3: List files
      const { data: files, error: filesError } = await supabase.storage
        .from('avatar')
        .list();
      
      if (filesError) {
        console.log('❌ Access error:', filesError.message);
      } else {
        console.log('✅ Bucket accessible');
        console.log('   - Files:', files?.length || 0);
      }
      
      // Test 4: Public URL
      const { data: urlData } = supabase.storage
        .from('avatar')
        .getPublicUrl('test.jpg');
      
      console.log('✅ Public URL works:', urlData?.publicUrl);
      
    } else {
      console.log('❌ "avatar" bucket not found');
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

quickAvatarTest();

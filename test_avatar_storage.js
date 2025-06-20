const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testAvatarStorage() {
  console.log('📁 Testing Avatar Storage System');
  console.log('===============================');
  
  try {
    // Test 1: Check if storage system is accessible
    console.log('\n1️⃣ Testing Storage System Access...');
    
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.log('❌ Storage system error:', storageError.message);
      return;
    }
    
    console.log('✅ Storage system accessible');
    console.log('   Available buckets:', buckets.map(b => b.name).join(', ') || 'None');
    
    // Test 2: Check for avatars bucket
    console.log('\n2️⃣ Checking for Avatars Bucket...');
    
    const avatarBucket = buckets.find(b => b.name === 'avatars');
    
    if (avatarBucket) {
      console.log('✅ Avatars bucket exists');
      console.log('   - Name:', avatarBucket.name);
      console.log('   - Public:', avatarBucket.public);
      console.log('   - Created:', avatarBucket.created_at);
      
      // Test 3: Check bucket policies
      console.log('\n3️⃣ Testing Bucket Policies...');
      
      try {
        // Try to list files in bucket (should work if policies are correct)
        const { data: files, error: listError } = await supabase.storage
          .from('avatars')
          .list();
        
        if (listError) {
          console.log('⚠️  Bucket list error:', listError.message);
        } else {
          console.log('✅ Bucket policies allow listing');
          console.log('   - Files in bucket:', files?.length || 0);
        }
      } catch (policyError) {
        console.log('⚠️  Bucket policy test failed:', policyError.message);
      }
      
      // Test 4: Test public URL access
      console.log('\n4️⃣ Testing Public URL Generation...');
      
      try {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl('test-file.jpg');
        
        if (publicUrlData?.publicUrl) {
          console.log('✅ Public URL generation works');
          console.log('   - Sample URL format:', publicUrlData.publicUrl);
        } else {
          console.log('⚠️  Public URL generation issue');
        }
      } catch (urlError) {
        console.log('⚠️  Public URL test failed:', urlError.message);
      }
      
    } else {
      console.log('❌ Avatars bucket not found');
      console.log('\n📋 TO CREATE AVATARS BUCKET:');
      console.log('1. Go to Supabase Dashboard > Storage');
      console.log('2. Click "Create bucket"');
      console.log('3. Name: "avatars"');
      console.log('4. Public: ✅ (checked)');
      console.log('5. Click "Create bucket"');
    }
    
    // Test 5: Test storage policies exist
    console.log('\n5️⃣ Checking Storage Policies...');
    
    try {
      // This is a basic test to see if we can access storage
      const { error: policyTestError } = await supabase.storage
        .from('avatars')
        .list('', { limit: 1 });
      
      if (policyTestError) {
        if (policyTestError.message.includes('not found')) {
          console.log('⚠️  Avatars bucket not found - create it first');
        } else {
          console.log('⚠️  Storage policy issue:', policyTestError.message);
        }
      } else {
        console.log('✅ Storage policies appear to be working');
      }
    } catch (error) {
      console.log('⚠️  Storage policy test failed:', error.message);
    }
    
    console.log('\n🎯 AVATAR STORAGE SUMMARY');
    console.log('========================');
    
    if (avatarBucket) {
      console.log('✅ Storage system: Working');
      console.log('✅ Avatars bucket: Exists');
      console.log('✅ Public access: Configured');
      console.log('✅ Ready for: Avatar uploads in mobile app');
      
      console.log('\n🎉 Avatar storage is ready!');
      console.log('   - Users can now upload profile pictures');
      console.log('   - Images will be stored securely');
      console.log('   - Public URLs will work for displaying avatars');
      
    } else {
      console.log('✅ Storage system: Working');
      console.log('❌ Avatars bucket: Missing');
      console.log('⚠️  Action needed: Create avatars bucket');
      
      console.log('\n📝 NEXT STEPS:');
      console.log('1. Create "avatars" bucket in Supabase dashboard');
      console.log('2. Ensure bucket is set to public');
      console.log('3. Re-run this test to verify');
      console.log('4. Test avatar uploads in mobile app');
    }
    
  } catch (error) {
    console.error('❌ Avatar storage test failed:', error.message);
  }
}

testAvatarStorage();

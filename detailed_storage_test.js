const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function detailedStorageTest() {
  console.log('🔍 Detailed Storage Bucket Test');
  console.log('==============================');
  console.log('Project URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
  console.log('Using anon key:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? 'Present' : 'Missing');
  
  try {
    // Test 1: List all buckets with detailed info
    console.log('\n1️⃣ Listing All Storage Buckets...');
    
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.log('❌ Storage list error:', listError.message);
      console.log('   Error details:', listError);
      return;
    }
    
    console.log('✅ Storage system accessible');
    console.log('   Total buckets found:', buckets?.length || 0);
    
    if (buckets && buckets.length > 0) {
      buckets.forEach((bucket, index) => {
        console.log(`   Bucket ${index + 1}:`);
        console.log(`     - Name: ${bucket.name}`);
        console.log(`     - ID: ${bucket.id}`);
        console.log(`     - Public: ${bucket.public}`);
        console.log(`     - Created: ${bucket.created_at}`);
        console.log(`     - Updated: ${bucket.updated_at}`);
      });
    } else {
      console.log('   No buckets found');
    }
    
    // Test 2: Try to access avatars bucket specifically
    console.log('\n2️⃣ Testing Avatars Bucket Access...');
    
    const { data: avatarsList, error: avatarsError } = await supabase.storage
      .from('avatars')
      .list('', { limit: 1 });
    
    if (avatarsError) {
      console.log('❌ Avatars bucket access error:', avatarsError.message);
      console.log('   Error code:', avatarsError.statusCode || 'N/A');
      
      if (avatarsError.message.includes('not found')) {
        console.log('   → This confirms the bucket doesn\'t exist or isn\'t accessible');
      } else if (avatarsError.message.includes('permission')) {
        console.log('   → This might be a permissions issue');
      }
    } else {
      console.log('✅ Avatars bucket accessible!');
      console.log('   Files in bucket:', avatarsList?.length || 0);
    }
    
    // Test 3: Try to generate a public URL
    console.log('\n3️⃣ Testing Public URL Generation...');
    
    try {
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl('test-file.jpg');
      
      if (urlData?.publicUrl) {
        console.log('✅ Public URL generation works');
        console.log('   Sample URL:', urlData.publicUrl);
        
        // Check if the URL looks correct
        if (urlData.publicUrl.includes('avatars')) {
          console.log('   → URL format looks correct');
        }
      } else {
        console.log('❌ No public URL generated');
      }
    } catch (urlError) {
      console.log('❌ Public URL generation failed:', urlError.message);
    }
    
    // Test 4: Check storage configuration
    console.log('\n4️⃣ Storage Configuration Check...');
    
    console.log('   Supabase URL valid:', process.env.EXPO_PUBLIC_SUPABASE_URL?.includes('supabase.co') ? 'Yes' : 'No');
    console.log('   Anon key valid:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.length > 50 ? 'Yes' : 'No');
    
    // Test 5: Alternative bucket access method
    console.log('\n5️⃣ Alternative Bucket Detection...');
    
    // Try to upload a tiny test file to see what happens
    const testData = new Uint8Array([1, 2, 3, 4]); // Tiny test file
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload('test-connection.txt', testData, {
        contentType: 'text/plain',
        upsert: true
      });
    
    if (uploadError) {
      console.log('❌ Test upload failed:', uploadError.message);
      
      if (uploadError.message.includes('not found')) {
        console.log('   → Bucket definitely doesn\'t exist');
      } else if (uploadError.message.includes('policy')) {
        console.log('   → Bucket exists but policies need adjustment');
      }
    } else {
      console.log('✅ Test upload successful!');
      console.log('   → Bucket exists and is writable');
      console.log('   Upload path:', uploadData?.path);
      
      // Clean up test file
      await subabase.storage.from('avatars').remove(['test-connection.txt']);
      console.log('   → Test file cleaned up');
    }
    
    console.log('\n🎯 DIAGNOSIS SUMMARY');
    console.log('===================');
    
    const avatarBucket = buckets?.find(b => b.name === 'avatars');
    
    if (avatarBucket) {
      console.log('✅ SUCCESS: Avatars bucket found and accessible!');
      console.log('📋 Bucket Details:');
      console.log(`   - Name: ${avatarBucket.name}`);
      console.log(`   - Public: ${avatarBucket.public}`);
      console.log(`   - Ready for: Avatar uploads in mobile app`);
      
      console.log('\n🚀 NEXT STEPS:');
      console.log('1. Test avatar uploads in your mobile app');
      console.log('2. Run complete system test: node final_system_test.js');
      console.log('3. Your onboarding should now work with image uploads!');
      
    } else {
      console.log('❌ ISSUE: Avatars bucket not detected');
      console.log('\n🔧 TROUBLESHOOTING:');
      console.log('1. Double-check bucket was created in Supabase dashboard');
      console.log('2. Ensure bucket name is exactly "avatars" (lowercase)');
      console.log('3. Verify bucket is set to public');
      console.log('4. Try refreshing the Supabase dashboard');
      console.log('5. Check if you\'re in the correct Supabase project');
      
      console.log('\n📝 CREATE BUCKET STEPS:');
      console.log('- Go to Supabase Dashboard > Storage');
      console.log('- Click "Create bucket"');
      console.log('- Name: avatars');
      console.log('- Public: ✅ (checked)');
      console.log('- Click "Create bucket"');
    }
    
  } catch (error) {
    console.error('❌ Detailed storage test failed:', error.message);
    console.error('   Full error:', error);
  }
}

detailedStorageTest();

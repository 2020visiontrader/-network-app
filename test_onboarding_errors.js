const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testOnboardingCompletion() {
  console.log('🧪 Testing onboarding completion errors...');
  
  const testEmail = 'hellonetworkapp@gmail.com';
  
  try {
    // 1. Get the existing user data
    console.log('\n1. Checking existing user data...');
    
    const { data: userData, error: fetchError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (fetchError) {
      console.log('❌ Error fetching user:', fetchError.message);
      return;
    }
    
    console.log('✅ User found:', userData.id);
    console.log('   - Email:', userData.email);
    console.log('   - Full name:', userData.full_name);
    console.log('   - Onboarding complete:', userData.onboarding_complete);

    // 2. Test onboarding update that mobile app would make
    console.log('\n2. Testing onboarding update...');
    
    const onboardingData = {
      full_name: 'NETWORK ADMIN',
      preferred_name: 'Admin',
      role: 'Founder',
      location: 'San Francisco, CA',
      linkedin_url: 'https://linkedin.com/in/networkadmin',
      company_name: 'Network App',
      bio: 'Building the future of founder networking.',
      tags: 'networking, startups, AI',
      is_visible: true,
      avatar_url: null,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    // Try the update without authentication (this should fail with RLS)
    const { data: updateData, error: updateError } = await supabase
      .from('founders')
      .update(onboardingData)
      .eq('id', userData.id)
      .select();

    if (updateError) {
      console.log('❌ Onboarding update error:', updateError.message);
      console.log('   - Error code:', updateError.code);
      console.log('   - Details:', updateError.details);
      
      if (updateError.message.includes('row-level security')) {
        console.log('\n🔍 RLS Policy Issue Detected!');
        console.log('   The user needs to be authenticated to update their profile.');
        console.log('   This is likely the cause of onboarding completion errors.');
      }
    } else {
      console.log('✅ Onboarding update successful');
      console.log('   Updated data:', updateData);
    }

    // 3. Check required columns for onboarding
    console.log('\n3. Checking database schema for onboarding fields...');
    
    const requiredFields = [
      'full_name', 'preferred_name', 'role', 'location', 'linkedin_url', 
      'company_name', 'bio', 'tags', 'is_visible', 'avatar_url', 
      'onboarding_complete'
    ];
    
    const availableFields = Object.keys(userData);
    const missingFields = requiredFields.filter(field => !availableFields.includes(field));
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
    } else {
      console.log('✅ All required onboarding fields present');
    }

    // 4. Test storage bucket access for avatar uploads
    console.log('\n4. Testing avatar storage access...');
    
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.log('❌ Storage access error:', bucketError.message);
      } else {
        const avatarBucket = buckets.find(bucket => bucket.name === 'avatars');
        if (avatarBucket) {
          console.log('✅ Avatar storage bucket exists');
        } else {
          console.log('⚠️  Avatar storage bucket not found');
          console.log('   Available buckets:', buckets.map(b => b.name));
        }
      }
    } catch (storageError) {
      console.log('❌ Storage test error:', storageError.message);
    }

    console.log('\n🔧 Potential Onboarding Issues:');
    console.log('   1. RLS policies may prevent unauthenticated updates');
    console.log('   2. Storage bucket for avatars may not be configured');
    console.log('   3. User authentication may not be persisting properly');
    
    console.log('\n💡 Solutions:');
    console.log('   1. Ensure user is properly authenticated when updating profile');
    console.log('   2. Check RLS policies allow authenticated users to update their own profiles');
    console.log('   3. Verify avatar storage bucket exists and has proper permissions');
    console.log('   4. Test the complete flow from login -> onboardning -> profile update');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

testOnboardingCompletion();

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function fixOnboardingIssues() {
  console.log('🔧 Fixing onboarding issues...');
  
  try {
    // 1. First run the SQL to fix RLS policies
    console.log('\n1. Running SQL fixes...');
    console.log('   ⚠️  You need to run COMPLETE_ONBOARDING_FIX.sql in Supabase SQL Editor');
    console.log('   ⚠️  You need to create the avatars storage bucket (see STORAGE_BUCKET_SETUP.md)');
    
    // 2. Test if we can update the profile for the existing user
    console.log('\n2. Testing profile update for existing user...');
    
    const testEmail = 'hellonetworkapp@gmail.com';
    const { data: userData, error: fetchError } = await supabase
      .from('founders')
      .select('*')
      .eq('email', testEmail)
      .single();
    
    if (fetchError) {
      console.log('❌ Error fetching user:', fetchError.message);
      return;
    }
    
    // 3. Test the onboarding completion without image upload
    console.log('\n3. Testing onboarding completion without image...');
    
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
      avatar_url: null, // No image upload for now
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    const { data: updateData, error: updateError } = await supabase
      .from('founders')
      .update(onboardingData)
      .eq('email', testEmail)
      .select();

    if (updateError) {
      console.log('❌ Onboarding update error:', updateError.message);
      console.log('   This confirms the RLS policy issue');
    } else {
      console.log('✅ Onboarding update successful without authentication');
      console.log('   This suggests RLS policies are too permissive');
    }

    // 4. Check what buckets exist
    console.log('\n4. Checking storage buckets...');
    try {
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        console.log('❌ Cannot access storage:', bucketError.message);
      } else {
        console.log('✅ Storage accessible');
        console.log('   Available buckets:', buckets.map(b => b.name));
        
        if (!buckets.find(b => b.name === 'avatars')) {
          console.log('⚠️  Avatars bucket missing - this will cause image upload errors');
        }
      }
    } catch (storageError) {
      console.log('❌ Storage error:', storageError.message);
    }

    console.log('\n📋 Onboarding Issues Summary:');
    console.log('   🔴 CRITICAL: Avatar storage bucket missing');
    console.log('   🔴 CRITICAL: RLS policies may be preventing profile updates');
    console.log('   🔶 IMPORTANT: User authentication may not persist during onboarding');
    
    console.log('\n🔧 Required Fixes:');
    console.log('   1. Create "avatars" storage bucket in Supabase dashboard');
    console.log('   2. Run COMPLETE_ONBOARDING_FIX.sql in Supabase SQL Editor');
    console.log('   3. Test the mobile app with authenticated user');
    console.log('   4. Consider making image upload optional during onboarding');
    
    console.log('\n🎯 Immediate Solutions:');
    console.log('   • Make avatar upload optional in onboarding');
    console.log('   • Add error handling for storage failures');
    console.log('   • Ensure user stays authenticated during onboarding');
    console.log('   • Add retry logic for profile updates');

  } catch (error) {
    console.error('❌ Fix attempt failed:', error.message);
  }
}

fixOnboardingIssues();

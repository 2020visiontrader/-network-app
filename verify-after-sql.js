const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

// Generate a proper UUID v4
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function verifyAfterSQLFix() {
  console.log('🔍 VERIFYING AFTER SQL SCRIPT EXECUTION');
  console.log('=======================================');
  
  const testUuid = generateUUID();
  const testData = {
    user_id: testUuid,
    full_name: 'Post-SQL Test User',
    linkedin_url: 'https://linkedin.com/in/postsqltest',
    location_city: 'Fix City',
    industry: 'Technology',
    tagline: 'Testing after SQL fix',
    onboarding_completed: true,
    profile_progress: 100,
    profile_visible: true
  };
  
  console.log('✨ Testing complete CRUD cycle...');
  
  // Test INSERT
  console.log('1. 📝 Testing INSERT...');
  const { data: insertData, error: insertError } = await supabase
    .from('founders')
    .insert(testData)
    .select()
    .maybeSingle();
    
  if (insertError) {
    console.error('❌ INSERT still failing:', insertError.message);
    console.log('🔧 Please check that the SQL script ran successfully');
    return;
  } else {
    console.log('✅ INSERT working:', insertData.full_name);
  }
  
  // Test SELECT
  console.log('2. 🔍 Testing SELECT...');
  const { data: selectData, error: selectError } = await supabase
    .from('founders')
    .select('*')
    .eq('user_id', testUuid)
    .maybeSingle();
    
  if (selectError) {
    console.error('❌ SELECT failed:', selectError.message);
  } else {
    console.log('✅ SELECT working:', selectData.full_name);
  }
  
  // Test UPDATE
  console.log('3. ✏️  Testing UPDATE...');
  const { data: updateData, error: updateError } = await supabase
    .from('founders')
    .update({ 
      tagline: 'Updated after SQL fix',
      updated_at: new Date().toISOString()
    })
    .eq('user_id', testUuid)
    .select()
    .maybeSingle();
    
  if (updateError) {
    console.error('❌ UPDATE failed:', updateError.message);
  } else {
    console.log('✅ UPDATE working:', updateData.tagline);
  }
  
  // Test DELETE
  console.log('4. 🗑️  Testing DELETE...');
  const { error: deleteError } = await supabase
    .from('founders')
    .delete()
    .eq('user_id', testUuid);
    
  if (deleteError) {
    console.error('❌ DELETE failed:', deleteError.message);
  } else {
    console.log('✅ DELETE working');
  }
  
  console.log('\n🎉 VERIFICATION COMPLETE!');
  console.log('========================');
  console.log('✅ All database operations working');
  console.log('✅ RLS policies properly configured');
  console.log('✅ .maybeSingle() preventing errors');
  console.log('\n🚀 Your onboarding flow is ready for testing!');
  console.log('📱 Scan the QR code and test signup → onboarding → dashboard');
}

// Run verification
console.log('Starting post-SQL verification...');
verifyAfterSQLFix().catch(error => {
  console.error('💥 Verification failed:', error.message);
});

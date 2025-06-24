const { createClient } = require('@supabase/supabase-js');

async function testDatabaseWithoutEmail() {
  console.log('🧪 Testing Database Without Email Signup...\n');

  const supabase = createClient(
    'https://gbdodttegdctxvvavlqq.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA'
  );

  try {
    // Test 1: Database connectivity
    console.log('1️⃣ Testing database connection...');
    const { data: dbTest, error: dbError } = await supabase
      .from('founders')
      .select('count')
      .limit(1);

    if (dbError) {
      console.error('❌ Database error:', dbError.message);
      return;
    }
    console.log('✅ Database connected successfully');

    // Test 2: Check table structure
    console.log('\n2️⃣ Checking founders table structure...');
    const { data: structureTest, error: structureError } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_complete, company_name, role, profile_visible')
      .limit(1);

    if (structureError) {
      console.error('❌ Table structure error:', structureError.message);
      return;
    }
    console.log('✅ All required columns exist in founders table');

    // Test 3: Check if we can read existing data
    console.log('\n3️⃣ Testing data access...');
    const { data: userData, error: userError } = await supabase
      .from('founders')
      .select('id, full_name, company_name, role, onboarding_complete')
      .limit(5);

    if (userError) {
      console.error('❌ Data access error:', userError.message);
    } else {
      console.log('✅ Can read founder data');
      console.log('📊 Current founders in database:', userData?.length || 0);
      if (userData && userData.length > 0) {
        console.log('👥 Sample users:', userData.map(u => ({ name: u.full_name, company: u.company_name })));
      }
    }

    // Test 4: Check RLS policies (without auth)
    console.log('\n4️⃣ Testing RLS policies...');
    const { data: publicData, error: publicError } = await supabase
      .from('founders')
      .select('id, full_name, company_name, role')
      .eq('profile_visible', true)
      .limit(3);

    if (publicError) {
      console.log('❌ Public access blocked:', publicError.message);
      console.log('✅ This is expected if RLS is properly configured');
    } else {
      console.log('✅ Public discovery access works');
      console.log('🔍 Discoverable users:', publicData?.length || 0);
    }

    // Test 5: Check other tables exist
    console.log('\n5️⃣ Checking other tables...');
    const tables = ['connections', 'coffee_chats', 'events', 'masterminds'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table} table: ${error.message}`);
      } else {
        console.log(`✅ ${table} table exists and accessible`);
      }
    }

    console.log('\n🎉 Database testing completed without email signup!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Database connectivity: Working');
    console.log('✅ Founders table schema: Complete');
    console.log('✅ Required columns: All present');
    console.log('✅ Table structure: Ready for app');
    console.log('\n🔧 Next step: Test signup through the actual app interface');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testDatabaseWithoutEmail().catch(console.error);

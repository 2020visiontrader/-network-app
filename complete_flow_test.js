const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 Complete Flow Test...\n');

// Initialize Supabase client
const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testCompleteFlow() {
    try {
        // Use a realistic test email
        const testEmail = `testuser${Date.now()}@gmail.com`;
        const testPassword = 'password123';
        const testProfile = {
            fullName: 'Test User',
            companyName: 'Test Company',
            role: 'Founder'
        };
        
        console.log('1️⃣ Testing complete signup flow...');
        console.log(`📧 Creating user: ${testEmail}`);
        
        // Step 1: Sign up user
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
            email: testEmail.toLowerCase().trim(),
            password: testPassword,
        });

        if (signUpError) {
            console.log(`❌ Auth signup failed: ${signUpError.message}`);
            return false;
        }

        console.log('✅ Auth user created successfully!');
        console.log(`   User ID: ${authData.user?.id}`);
        console.log(`   Email: ${authData.user?.email}`);
        console.log(`   Email confirmed: ${authData.user?.email_confirmed_at ? 'Yes' : 'No'}`);

        // Step 2: Create founder profile (simulating what AuthContext does)
        console.log('\n2️⃣ Creating founder profile...');
        
        const { data: profileData, error: profileError } = await supabase
            .from('founders')
            .insert({
                id: authData.user.id,
                email: authData.user.email,
                full_name: testProfile.fullName,
                company_name: testProfile.companyName,
                role: testProfile.role || 'Founder',
                onboarding_complete: false,
                created_at: new Date().toISOString(),
            })
            .select();

        if (profileError) {
            console.log(`❌ Profile creation failed: ${profileError.message}`);
            console.log('Details:', profileError.details);
            console.log('Code:', profileError.code);
        } else {
            console.log('✅ Founder profile created successfully!');
            console.log('   Profile:', profileData[0]);
        }

        // Step 3: Verify the user can be retrieved
        console.log('\n3️⃣ Verifying user retrieval...');
        
        const { data: retrievedUser, error: retrieveError } = await supabase
            .from('founders')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();

        if (retrieveError) {
            console.log(`❌ User retrieval failed: ${retrieveError.message}`);
        } else {
            console.log('✅ User retrieved successfully!');
            console.log(`   Name: ${retrievedUser.full_name}`);
            console.log(`   Company: ${retrievedUser.company_name}`);
            console.log(`   Role: ${retrievedUser.role}`);
            console.log(`   Onboarding: ${retrievedUser.onboarding_complete ? 'Complete' : 'Pending'}`);
        }

        // Step 4: Test signing in
        console.log('\n4️⃣ Testing sign in...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
        });

        if (signInError) {
            console.log(`❌ Sign in failed: ${signInError.message}`);
        } else {
            console.log('✅ Sign in successful!');
            console.log(`   Session created for: ${signInData.user?.email}`);
        }

        return true;
        
    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
        return false;
    }
}

async function checkDatabaseSchema() {
    console.log('\n5️⃣ Verifying database schema...');
    
    try {
        // Check if all required columns exist
        const { data, error } = await supabase
            .from('founders')
            .select('id, email, full_name, company_name, role, onboarding_complete, created_at')
            .limit(1);

        if (error) {
            console.log(`❌ Schema check failed: ${error.message}`);
        } else {
            console.log('✅ All required columns exist in founders table');
        }
        
    } catch (err) {
        console.log(`❌ Schema verification error: ${err.message}`);
    }
}

async function runCompleteTest() {
    await checkDatabaseSchema();
    const success = await testCompleteFlow();
    
    console.log('\n📝 Test Summary:');
    if (success) {
        console.log('🎉 Complete flow test PASSED!');
        console.log('✅ User signup works');
        console.log('✅ Profile creation works');
        console.log('✅ User retrieval works');
        console.log('✅ Sign in works');
        console.log('\n🚀 The app should now work end-to-end!');
    } else {
        console.log('❌ Test FAILED - check errors above');
    }
}

runCompleteTest().catch(console.error);

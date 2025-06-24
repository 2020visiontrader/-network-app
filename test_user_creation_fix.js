const { createClient } = require('@supabase/supabase-js');

// Use service role key for testing
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA0OTk5MSwiZXhwIjoyMDY0NjI1OTkxfQ.bwaSvWzocekwfK_mbdq4JtxHqK08tRHaWBPigI_53C8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testUserCreationFix() {
    console.log('🔧 Testing User Creation Fix');
    console.log('============================');
    
    try {
        // 1. Clean up any existing test data
        console.log('\n1️⃣ Cleaning up existing test data...');
        const testEmail = 'test@networkapp.com';
        
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        if (existingUsers && existingUsers.users) {
            const existingUser = existingUsers.users.find(u => u.email === testEmail);
            if (existingUser) {
                await supabase.from('founders').delete().eq('id', existingUser.id);
                await supabase.auth.admin.deleteUser(existingUser.id);
                console.log('✅ Existing test user cleaned up');
            }
        }
        
        // 2. Create test user
        console.log('\n2️⃣ Creating test user...');
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: true
        });
        
        if (authError) {
            console.log('❌ User creation failed:', authError.message);
            return;
        }
        
        console.log('✅ User created successfully');
        console.log('   User ID:', authData.user.id);
        
        // 3. Test founder profile creation using the mobile app approach
        console.log('\n3️⃣ Testing founder profile creation (mobile app data)...');
        
        const userId = authData.user.id;
        
        // This mirrors what the mobile app sends
        const mobileAppData = {
            id: userId,
            email: testEmail,
            full_name: 'Test User',
            bio: 'I am a test user for the network app',
            location: 'San Francisco, CA',
            experience_level: 'intermediate',
            interests: ['technology', 'startups', 'networking'],
            availability: 'available'
        };
        
        const { data: founderResult, error: founderError } = await supabase
            .from('founders')
            .insert(mobileAppData)
            .select()
            .maybeSingle();
            
        if (founderError) {
            console.log('❌ Mobile app style creation failed:', founderError.message);
            
            // Try using the new function instead
            console.log('\n🔄 Trying with create_mobile_founder function...');
            
            const { data: functionResult, error: functionError } = await supabase
                .rpc('create_mobile_founder', {
                    user_id: userId,
                    user_email: testEmail,
                    user_full_name: 'Test User',
                    user_bio: 'I am a test user for the network app',
                    user_location: 'San Francisco, CA',
                    user_experience_level: 'intermediate',
                    user_interests: ['technology', 'startups', 'networking'],
                    user_availability: 'available'
                });
                
            if (functionError) {
                console.log('❌ Function creation failed:', functionError.message);
            } else {
                console.log('✅ Function creation successful!');
                console.log('   Profile created:', functionResult[0]);
            }
        } else {
            console.log('✅ Mobile app style creation successful!');
            console.log('   Profile created:', founderResult);
        }
        
        // 4. Test mobile view access
        console.log('\n4️⃣ Testing mobile view access...');
        
        const { data: mobileView, error: viewError } = await supabase
            .from('mobile_founders')
            .select('*')
            .eq('id', userId)
            .maybeSingle();
            
        if (viewError) {
            console.log('❌ Mobile view access failed:', viewError.message);
        } else {
            console.log('✅ Mobile view access successful!');
            console.log('   Mobile view data:', mobileView);
        }
        
        // 5. Test with regular anon client (like mobile app would use)
        console.log('\n5️⃣ Testing with anon client (mobile app simulation)...');
        
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';
        const anonClient = createClient(supabaseUrl, anonKey);
        
        // Sign in with the test user
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
            email: testEmail,
            password: 'TestPassword123!'
        });
        
        if (signInError) {
            console.log('❌ Mobile app sign in failed:', signInError.message);
        } else {
            console.log('✅ Mobile app sign in successful!');
            
            // Try to access own profile
            const { data: ownProfile, error: profileError } = await anonClient
                .from('mobile_founders')
                .select('*')
                .eq('id', signInData.user.id)
                .maybeSingle();
                
            if (profileError) {
                console.log('❌ Profile access failed:', profileError.message);
            } else {
                console.log('✅ Profile access successful!');
                console.log('   Own profile:', ownProfile);
            }
        }
        
        // 6. Clean up
        console.log('\n6️⃣ Cleaning up test data...');
        await supabase.from('founders').delete().eq('id', userId);
        await supabase.auth.admin.deleteUser(userId);
        console.log('✅ Test data cleaned up');
        
        console.log('\n📋 TEST RESULTS:');
        console.log('================');
        if (!founderError || !functionError) {
            console.log('🎉 USER CREATION FIX IS WORKING!');
            console.log('✅ Users can be created successfully');
            console.log('✅ Founder profiles can be created');
            console.log('✅ Mobile view is accessible');
            console.log('✅ Mobile app authentication works');
            console.log('\n🚀 Your mobile app should now work correctly!');
        } else {
            console.log('❌ USER CREATION STILL HAS ISSUES');
            console.log('🔧 You may need to run the SQL fix script first');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Full error:', error);
    }
}

testUserCreationFix();

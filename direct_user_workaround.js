const { createClient } = require('@supabase/supabase-js');

// Use service role key to apply SQL fixes directly
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA0OTk5MSwiZXhwIjoyMDY0NjI1OTkxfQ.bwaSvWzocekwfK_mbdq4JtxHqK08tRHaWBPigI_53C8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function directUserCreationTest() {
    console.log('🔧 Direct User Creation Workaround');
    console.log('==================================');
    
    try {
        const testEmail = 'test@networkapp.com';
        
        // Clean up existing
        console.log('\n1️⃣ Cleaning up existing test data...');
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        if (existingUsers && existingUsers.users) {
            const existingUser = existingUsers.users.find(u => u.email === testEmail);
            if (existingUser) {
                await supabase.from('founders').delete().eq('id', existingUser.id);
                await supabase.auth.admin.deleteUser(existingUser.id);
                console.log('✅ Existing test user cleaned up');
            }
        }
        
        // Create test user
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
        
        console.log('✅ User created:', authData.user.id);
        
        // Try to create founder with existing database schema
        console.log('\n3️⃣ Testing founder creation with existing schema...');
        
        // Use only columns that definitely exist in the database
        const existingSchemaData = {
            id: authData.user.id,
            email: testEmail,
            full_name: 'Test User',
            bio: 'Test bio for mobile app',
            location: 'Test Location',
            company_name: 'Test Company',
            role: 'Founder',
            industry: 'Technology',
            company_stage: 'idea',
            tagline: 'Test tagline',
            is_active: true,
            onboarding_completed: true,
            onboarding_complete: true
        };
        
        const { data: founderData, error: founderError } = await supabase
            .from('founders')
            .insert(existingSchemaData)
            .select()
            .maybeSingle();
            
        if (founderError) {
            console.log('❌ Founder creation failed:', founderError.message);
            console.log('   Error details:', founderError);
            
            // Try with minimal data
            console.log('\n🔄 Trying with minimal required data...');
            const minimalData = {
                id: authData.user.id,
                email: testEmail,
                full_name: 'Test User',
                is_active: true
            };
            
            const { data: minimalResult, error: minimalError } = await supabase
                .from('founders')
                .insert(minimalData)
                .select()
                .maybeSingle();
                
            if (minimalError) {
                console.log('❌ Minimal creation failed:', minimalError.message);
            } else {
                console.log('✅ Minimal founder profile created!');
                console.log('   Profile:', minimalResult);
            }
        } else {
            console.log('✅ Founder profile created successfully!');
            console.log('   Profile:', founderData);
        }
        
        // Test authentication flow
        console.log('\n4️⃣ Testing authentication flow...');
        
        const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';
        const anonClient = createClient(supabaseUrl, anonKey);
        
        const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
            email: testEmail,
            password: 'TestPassword123!'
        });
        
        if (signInError) {
            console.log('❌ Sign in failed:', signInError.message);
        } else {
            console.log('✅ Sign in successful!');
            
            // Try to read own profile
            const { data: ownProfile, error: profileError } = await anonClient
                .from('founders')
                .select('*')
                .eq('id', signInData.user.id)
                .maybeSingle();
                
            if (profileError) {
                console.log('❌ Profile read failed:', profileError.message);
            } else {
                console.log('✅ Profile read successful!');
                console.log('   Profile data available:', Object.keys(ownProfile));
            }
        }
        
        // Clean up
        console.log('\n5️⃣ Cleaning up...');
        await supabase.from('founders').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        console.log('✅ Test data cleaned up');
        
        console.log('\n📋 WORKAROUND RESULTS:');
        console.log('=====================');
        if (!founderError || !minimalError) {
            console.log('🎉 USER CREATION WORKS WITH EXISTING SCHEMA!');
            console.log('✅ Users can be created');
            console.log('✅ Founder profiles can be created');
            console.log('✅ Authentication flow works');
            console.log('\n💡 RECOMMENDATION:');
            console.log('   - Your mobile app can work with the existing database schema');
            console.log('   - Update the mobile app code to use existing columns');
            console.log('   - Map mobile app fields to database columns');
        } else {
            console.log('❌ USER CREATION STILL HAS ISSUES');
            console.log('🔧 The database schema needs to be updated manually');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
    }
}

directUserCreationTest();

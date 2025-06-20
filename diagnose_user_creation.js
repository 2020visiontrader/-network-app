const { createClient } = require('@supabase/supabase-js');

// Correct Supabase configuration
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function diagnoseUserCreation() {
    console.log('🔍 User Creation Diagnostic Test');
    console.log('=================================');
    
    try {
        // 1. Check database schema first
        console.log('\n1️⃣ Checking founders table schema...');
        const { data: schemaData, error: schemaError } = await supabase
            .from('founders')
            .select('*')
            .limit(1);
            
        if (schemaError) {
            console.log('❌ Schema check failed:', schemaError.message);
            return;
        }
        
        if (schemaData && schemaData.length > 0) {
            console.log('✅ Founders table exists with columns:', Object.keys(schemaData[0]));
        } else {
            console.log('⚠️  Founders table is empty, checking structure...');
            
            // Try to get table info
            const { data: tableInfo, error: tableError } = await supabase.rpc('get_table_columns', {
                table_name: 'founders'
            });
            
            if (tableError) {
                console.log('❌ Could not get table structure:', tableError.message);
            }
        }
        
        // 2. Test auth user creation with a consistent test email
        console.log('\n2️⃣ Testing auth user creation...');
        const testEmail = 'test@networkapp.com';
        const testPassword = 'TestPassword123!';
        
        // Try to sign in first to see if user exists
        const { data: existingSignIn, error: existingSignInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword
        });
        
        if (existingSignIn?.user) {
            console.log('✅ Test user already exists, using existing user');
            console.log('   User ID:', existingSignIn.user.id);
            
            // Check if founder profile exists
            const { data: existingFounder, error: existingFounderError } = await supabase
                .from('founders')
                .select('*')
                .eq('id', existingSignIn.user.id)
                .single();
                
            if (existingFounderError) {
                console.log('❌ Founder profile check failed:', existingFounderError.message);
            } else if (existingFounder) {
                console.log('✅ Founder profile exists:', existingFounder);
            } else {
                console.log('⚠️  Auth user exists but no founder profile');
            }
        } else {
            console.log('ℹ️  Test user does not exist, will create new one');
            
            // Create new test user
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: testEmail,
                password: testPassword
            });
            
            if (authError) {
                console.log('❌ Auth user creation failed:', authError.message);
                return;
            }
            
            console.log('✅ Auth user created successfully');
            console.log('   User ID:', authData.user?.id);
            console.log('   Email confirmed:', authData.user?.email_confirmed_at ? 'Yes' : 'No');
        }
        
        // 3. Get current user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !sessionData.session) {
            console.log('❌ No active session, trying to sign in...');
            
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: testEmail,
                password: testPassword
            });
            
            if (signInError) {
                console.log('❌ Sign in failed:', signInError.message);
                return;
            }
            
            console.log('✅ Signed in successfully');
        } else {
            console.log('✅ Active session found');
        }
        
        // 4. Test founder profile creation
        console.log('\n3️⃣ Testing founder profile creation...');
        
        const { data: currentUser } = await supabase.auth.getUser();
        const userId = currentUser.user?.id;
        
        if (!userId) {
            console.log('❌ No user ID available');
            return;
        }
        
        // Try to create founder profile with minimal required fields
        const founderData = {
            id: userId,
            email: testEmail,
            full_name: 'Test User',
            bio: 'Test bio',
            location: 'Test Location',
            experience_level: 'intermediate',
            interests: ['technology', 'startup'],
            availability: 'available',
            status: 'active'
        };
        
        const { data: founderResult, error: founderError } = await supabase
            .from('founders')
            .insert(founderData)
            .select()
            .single();
            
        if (founderError) {
            console.log('❌ Founder profile creation failed:', founderError.message);
            console.log('   Error details:', founderError);
            
            // Check what specific column is causing issues
            if (founderError.message.includes('column')) {
                console.log('🔍 This appears to be a missing column issue');
                console.log('💡 The database schema may need to be updated');
            }
            
            if (founderError.message.includes('policy') || founderError.message.includes('permission')) {
                console.log('🔍 This appears to be a Row Level Security (RLS) policy issue');
                console.log('💡 The RLS policies may need to be updated');
            }
        } else {
            console.log('✅ Founder profile created successfully!');
            console.log('   Profile:', founderResult);
        }
        
        // 5. Clean up test data
        console.log('\n4️⃣ Cleaning up test data...');
        if (userId) {
            await supabase.from('founders').delete().eq('id', userId);
            console.log('✅ Test founder profile cleaned up');
        }
        
        console.log('\n📋 DIAGNOSTIC SUMMARY:');
        console.log('======================');
        if (!founderError) {
            console.log('🎉 USER CREATION IS WORKING!');
            console.log('✅ Auth users can be created');
            console.log('✅ Founder profiles can be created');
            console.log('✅ Your mobile app should work correctly');
        } else {
            console.log('❌ USER CREATION HAS ISSUES');
            console.log('🔧 Issues found:');
            console.log('   - Founder profile creation failed');
            console.log('   - Error:', founderError.message);
            console.log('\n💡 Recommended fixes:');
            console.log('   1. Check database schema matches code expectations');
            console.log('   2. Verify RLS policies allow inserts');
            console.log('   3. Ensure all required columns exist');
        }
        
    } catch (error) {
        console.log('❌ Diagnostic test failed:', error.message);
        console.log('Full error:', error);
    }
}

diagnoseUserCreation();

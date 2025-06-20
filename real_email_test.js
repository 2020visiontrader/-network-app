const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🚀 Real Email Test...\n');

// Initialize Supabase client
const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function testRealEmail() {
    try {
        // Test with a realistic looking email
        const testEmail = 'testuser@gmail.com';
        const testPassword = 'password123';
        
        console.log('1️⃣ Testing user signup with Gmail address...');
        console.log(`📧 Attempting to sign up: ${testEmail}`);
        
        const { data, error } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (error) {
            console.log(`❌ Signup failed: ${error.message}`);
            console.log(`Error code: ${error.status || 'Unknown'}`);
            
            // Check if it's a duplicate user error (which would be good - means the email format is valid)
            if (error.message.includes('already registered') || error.message.includes('already been registered')) {
                console.log('✅ This is actually good - the email format is valid, user just already exists');
                return true;
            }
            return false;
        }

        console.log('✅ Signup successful!');
        console.log('User ID:', data.user?.id);
        console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
        
        return true;
        
    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
        return false;
    }
}

async function checkSupabaseAuth() {
    console.log('\n2️⃣ Checking Supabase Auth configuration...');
    
    try {
        // Try to get auth settings (this will show us what's configured)
        const { data: settings, error } = await supabase.auth.getSession();
        
        if (error) {
            console.log('❌ Auth check failed:', error.message);
        } else {
            console.log('✅ Auth service is responding');
        }
        
    } catch (err) {
        console.log('❌ Auth service error:', err.message);
    }
}

async function runTest() {
    await testRealEmail();
    await checkSupabaseAuth();
    
    console.log('\n📝 Summary:');
    console.log('- If signup fails with "invalid email", check Supabase project settings');
    console.log('- If signup fails with "already registered", the email format is valid');
    console.log('- Check Supabase Auth settings for domain restrictions');
    console.log('- Verify email confirmation requirements');
}

runTest().catch(console.error);

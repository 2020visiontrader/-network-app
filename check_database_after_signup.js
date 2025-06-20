const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('🔍 Checking Database After Signup...\n');

// Initialize Supabase client
const supabase = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function checkDatabase() {
    try {
        console.log('1️⃣ Checking founders table...');
        
        const { data: founders, error: foundersError } = await supabase
            .from('founders')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (foundersError) {
            console.log('❌ Error fetching founders:', foundersError.message);
        } else {
            console.log(`📊 Found ${founders.length} founders in database`);
            
            if (founders.length > 0) {
                const latest = founders[0];
                console.log('\n📋 Latest founder:');
                console.log(`   ID: ${latest.id}`);
                console.log(`   Email: ${latest.email}`);
                console.log(`   Created: ${latest.created_at}`);
                console.log(`   Company: ${latest.company_name || 'Not set'}`);
                console.log(`   Onboarding Complete: ${latest.onboarding_complete}`);
            }
        }

        console.log('\n2️⃣ Checking auth.users table...');
        
        // Note: We can't directly query auth.users from the client, but we can check our connection
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
            console.log('❌ Session error:', sessionError.message);
        } else {
            console.log('✅ Auth service is working');
        }

        console.log('\n3️⃣ Testing user creation flow...');
        
        // Create a test user with a unique email
        const testEmail = `test${Date.now()}@example.com`;
        const testPassword = 'password123';

        console.log(`📧 Creating user: ${testEmail}`);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
            email: testEmail,
            password: testPassword,
        });

        if (signupError) {
            console.log(`❌ Signup failed: ${signupError.message}`);
        } else {
            console.log('✅ User created successfully!');
            console.log(`   User ID: ${signupData.user?.id}`);
            
            // Now manually create the founder profile since we removed the trigger
            console.log('\n4️⃣ Creating founder profile...');
            
            const { data: founderData, error: founderError } = await supabase
                .from('founders')
                .insert([
                    {
                        id: signupData.user.id,
                        email: testEmail,
                        onboarding_complete: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                ])
                .select();

            if (founderError) {
                console.log(`❌ Founder profile creation failed: ${founderError.message}`);
            } else {
                console.log('✅ Founder profile created successfully!');
                console.log('   Profile:', founderData[0]);
            }
        }

    } catch (err) {
        console.log('❌ Unexpected error:', err.message);
    }
}

checkDatabase().catch(console.error);

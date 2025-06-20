const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass email confirmation issues
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTA0OTk5MSwiZXhwIjoyMDY0NjI1OTkxfQ.bwaSvWzocekwfK_mbdq4JtxHqK08tRHaWBPigI_53C8';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function checkUserCreationIssues() {
    console.log('🔧 Direct User Creation Check');
    console.log('=============================');
    
    try {
        // 1. Check founders table structure directly
        console.log('\n1️⃣ Checking founders table structure...');
        
        // Try to get a sample record to see the schema
        const { data: sampleData, error: sampleError } = await supabase
            .from('founders')
            .select('*')
            .limit(1);
            
        if (sampleError) {
            console.log('❌ Cannot access founders table:', sampleError.message);
            
            // Try to get table info using information_schema
            const { data: schemaInfo, error: schemaError } = await supabase.rpc('get_table_info', {
                schema_name: 'public',
                table_name: 'founders'
            });
            
            if (schemaError) {
                console.log('❌ Cannot get schema info:', schemaError.message);
                
                // Try direct SQL query
                const { data: columnsData, error: columnsError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable')
                    .eq('table_name', 'founders')
                    .eq('table_schema', 'public');
                    
                if (columnsError) {
                    console.log('❌ Cannot query columns:', columnsError.message);
                } else {
                    console.log('✅ Founders table columns:', columnsData);
                }
            }
        } else {
            if (sampleData && sampleData.length > 0) {
                console.log('✅ Founders table exists with sample data');
                console.log('   Columns:', Object.keys(sampleData[0]));
            } else {
                console.log('⚠️  Founders table exists but is empty');
                
                // Try an empty insert to see what columns are expected
                const { data: insertTest, error: insertError } = await supabase
                    .from('founders')
                    .insert({})
                    .select();
                    
                if (insertError) {
                    console.log('📋 Required columns (from insert error):', insertError.message);
                }
            }
        }
        
        // 2. Test creating a user with confirmed email
        console.log('\n2️⃣ Testing direct user creation...');
        
        const testEmail = 'test@networkapp.com';
        const testPassword = 'TestPassword123!';
        
        // Delete existing test user first
        console.log('🧹 Cleaning up any existing test user...');
        const { data: existingUsers, error: existingError } = await supabase.auth.admin.listUsers();
        
        if (existingUsers && existingUsers.users) {
            const existingUser = existingUsers.users.find(u => u.email === testEmail);
            if (existingUser) {
                await supabase.auth.admin.deleteUser(existingUser.id);
                await supabase.from('founders').delete().eq('id', existingUser.id);
                console.log('✅ Existing test user cleaned up');
            }
        }
        
        // Create user with confirmed email
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: testPassword,
            email_confirm: true
        });
        
        if (authError) {
            console.log('❌ User creation failed:', authError.message);
            return;
        }
        
        console.log('✅ User created successfully');
        console.log('   User ID:', authData.user.id);
        console.log('   Email:', authData.user.email);
        console.log('   Confirmed:', authData.user.email_confirmed_at ? 'Yes' : 'No');
        
        // 3. Test founder profile creation with minimal data
        console.log('\n3️⃣ Testing founder profile creation...');
        
        const userId = authData.user.id;
        
        // Try with minimal required fields first
        const minimalData = {
            id: userId,
            email: testEmail,
            full_name: 'Test User'
        };
        
        const { data: founderData, error: founderError } = await supabase
            .from('founders')
            .insert(minimalData)
            .select()
            .single();
            
        if (founderError) {
            console.log('❌ Minimal founder creation failed:', founderError.message);
            
            // Try to identify missing required columns
            if (founderError.message.includes('null value')) {
                console.log('🔍 Missing required columns detected');
                
                // Try with more fields
                const extendedData = {
                    id: userId,
                    email: testEmail,
                    full_name: 'Test User',
                    bio: 'Test bio',
                    location: 'Test Location',
                    experience_level: 'intermediate',
                    interests: ['technology'],
                    availability: 'available',
                    status: 'active',
                    company: 'Test Company',
                    industry: 'Technology',
                    stage: 'idea',
                    founded_date: new Date().toISOString().split('T')[0],
                    team_size: 1,
                    funding_stage: 'pre-seed'
                };
                
                console.log('🔄 Trying with extended data...');
                const { data: extendedResult, error: extendedError } = await supabase
                    .from('founders')
                    .insert(extendedData)
                    .select()
                    .single();
                    
                if (extendedError) {
                    console.log('❌ Extended founder creation failed:', extendedError.message);
                } else {
                    console.log('✅ Extended founder creation successful!');
                    console.log('   Profile:', extendedResult);
                }
            }
        } else {
            console.log('✅ Minimal founder creation successful!');
            console.log('   Profile:', founderData);
        }
        
        // 4. Clean up
        console.log('\n4️⃣ Cleaning up...');
        await supabase.from('founders').delete().eq('id', userId);
        await supabase.auth.admin.deleteUser(userId);
        console.log('✅ Test data cleaned up');
        
        console.log('\n📋 FINAL DIAGNOSIS:');
        console.log('===================');
        if (!founderError || (!founderError && !extendedError)) {
            console.log('🎉 USER CREATION IS WORKING!');
            console.log('✅ Users can be created with confirmed emails');
            console.log('✅ Founder profiles can be created');
        } else {
            console.log('❌ USER CREATION HAS SPECIFIC ISSUES:');
            console.log('   - Founder profile creation fails');
            console.log('   - Likely missing required database columns');
            console.log('   - Schema mismatch between code and database');
        }
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        console.log('Full error:', error);
    }
}

checkUserCreationIssues();

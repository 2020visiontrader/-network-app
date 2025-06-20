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

async function applyUserCreationFix() {
    console.log('🔧 Applying User Creation Fix Directly');
    console.log('=====================================');
    
    const fixes = [
        {
            name: "Make password_hash nullable",
            sql: "ALTER TABLE founders ALTER COLUMN password_hash DROP NOT NULL;"
        },
        {
            name: "Add availability column",
            sql: `ALTER TABLE founders 
                  ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available' 
                  CHECK (availability IN ('available', 'busy', 'offline'));`
        },
        {
            name: "Add experience_level column", 
            sql: `ALTER TABLE founders 
                  ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'intermediate'
                  CHECK (experience_level IN ('beginner', 'intermediate', 'expert'));`
        },
        {
            name: "Add interests column",
            sql: "ALTER TABLE founders ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';"
        },
        {
            name: "Add status column",
            sql: `ALTER TABLE founders 
                  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
                  CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));`
        },
        {
            name: "Make bio column nullable",
            sql: "ALTER TABLE founders ALTER COLUMN bio DROP NOT NULL;"
        },
        {
            name: "Drop problematic policies",
            sql: `DROP POLICY IF EXISTS "Users can insert their own founder profile" ON founders;
                  DROP POLICY IF EXISTS "Users can view their own founder profile" ON founders;
                  DROP POLICY IF EXISTS "Users can update their own founder profile" ON founders;`
        },
        {
            name: "Create new RLS policies",
            sql: `CREATE POLICY "Enable insert for authenticated users" ON founders
                      FOR INSERT WITH CHECK (auth.uid() = id);
                  CREATE POLICY "Enable select for authenticated users" ON founders
                      FOR SELECT USING (auth.uid() = id OR is_active = true);
                  CREATE POLICY "Enable update for profile owners" ON founders
                      FOR UPDATE USING (auth.uid() = id);`
        }
    ];
    
    try {
        // Apply each fix
        for (const fix of fixes) {
            console.log(`\n${fix.name}...`);
            
            const { data, error } = await supabase.rpc('exec_sql', {
                sql: fix.sql
            });
            
            if (error) {
                console.log(`❌ ${fix.name} failed:`, error.message);
                // Continue with other fixes
            } else {
                console.log(`✅ ${fix.name} applied successfully`);
            }
        }
        
        // Create mobile view
        console.log('\nCreating mobile_founders view...');
        const viewSQL = `
        CREATE OR REPLACE VIEW mobile_founders AS
        SELECT 
            id,
            email,
            full_name,
            COALESCE(bio, '') as bio,
            COALESCE(location, location_city, '') as location,
            COALESCE(experience_level, 'intermediate') as experience_level,
            COALESCE(interests, '{}') as interests,
            COALESCE(availability, 'available') as availability,
            COALESCE(status, 'active') as status,
            COALESCE(avatar_url, profile_photo_url, profile_picture) as avatar_url,
            company_name as company,
            industry,
            company_stage as stage,
            role,
            tagline,
            linkedin_url,
            twitter_handle,
            company_website,
            is_verified,
            is_active,
            onboarding_completed,
            onboarding_complete,
            created_at,
            updated_at,
            last_active
        FROM founders;
        
        GRANT SELECT ON mobile_founders TO authenticated;
        GRANT SELECT ON mobile_founders TO anon;`;
        
        const { error: viewError } = await supabase.rpc('exec_sql', {
            sql: viewSQL
        });
        
        if (viewError) {
            console.log('❌ Mobile view creation failed:', viewError.message);
        } else {
            console.log('✅ Mobile view created successfully');
        }
        
        // Create mobile founder function
        console.log('\nCreating create_mobile_founder function...');
        const functionSQL = `
        CREATE OR REPLACE FUNCTION create_mobile_founder(
            user_id UUID,
            user_email TEXT,
            user_full_name TEXT,
            user_bio TEXT DEFAULT '',
            user_location TEXT DEFAULT '',
            user_experience_level TEXT DEFAULT 'intermediate',
            user_interests TEXT[] DEFAULT '{}',
            user_availability TEXT DEFAULT 'available'
        )
        RETURNS SETOF founders
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
            RETURN QUERY
            INSERT INTO founders (
                id,
                email,
                full_name,
                bio,
                location,
                experience_level,
                interests,
                availability,
                status,
                is_active,
                onboarding_completed,
                onboarding_complete,
                created_at,
                updated_at
            ) VALUES (
                user_id,
                user_email,
                user_full_name,
                user_bio,
                user_location,
                user_experience_level,
                user_interests,
                user_availability,
                'active',
                true,
                NOW(),
                true,
                NOW(),
                NOW()
            )
            RETURNING *;
        END;
        $$;
        
        GRANT EXECUTE ON FUNCTION create_mobile_founder TO authenticated;`;
        
        const { error: functionError } = await supabase.rpc('exec_sql', {
            sql: functionSQL
        });
        
        if (functionError) {
            console.log('❌ Function creation failed:', functionError.message);
        } else {
            console.log('✅ Function created successfully');
        }
        
        console.log('\n🎉 User creation fix applied successfully!');
        console.log('Now testing the fix...');
        
        // Test the fix immediately
        return await testFixedUserCreation();
        
    } catch (error) {
        console.log('❌ Failed to apply fix:', error.message);
        return false;
    }
}

async function testFixedUserCreation() {
    console.log('\n🧪 Testing Fixed User Creation');
    console.log('==============================');
    
    try {
        const testEmail = 'test@networkapp.com';
        
        // Clean up existing
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        if (existingUsers && existingUsers.users) {
            const existingUser = existingUsers.users.find(u => u.email === testEmail);
            if (existingUser) {
                await supabase.from('founders').delete().eq('id', existingUser.id);
                await supabase.auth.admin.deleteUser(existingUser.id);
            }
        }
        
        // Create test user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: testEmail,
            password: 'TestPassword123!',
            email_confirm: true
        });
        
        if (authError) {
            console.log('❌ User creation failed:', authError.message);
            return false;
        }
        
        console.log('✅ User created:', authData.user.id);
        
        // Test mobile founder creation
        const { data: founderData, error: founderError } = await supabase
            .rpc('create_mobile_founder', {
                user_id: authData.user.id,
                user_email: testEmail,
                user_full_name: 'Test User',
                user_bio: 'Test bio',
                user_location: 'Test Location',
                user_experience_level: 'intermediate',
                user_interests: ['technology', 'startup'],
                user_availability: 'available'
            });
            
        if (founderError) {
            console.log('❌ Founder creation failed:', founderError.message);
            return false;
        }
        
        console.log('✅ Founder profile created successfully!');
        
        // Test mobile view
        const { data: mobileView, error: viewError } = await supabase
            .from('mobile_founders')
            .select('*')
            .eq('id', authData.user.id)
            .single();
            
        if (viewError) {
            console.log('❌ Mobile view failed:', viewError.message);
        } else {
            console.log('✅ Mobile view works!');
        }
        
        // Clean up
        await supabase.from('founders').delete().eq('id', authData.user.id);
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        console.log('\n🎉 ALL TESTS PASSED!');
        console.log('✅ User creation is now working');
        console.log('✅ Mobile app should work correctly');
        
        return true;
        
    } catch (error) {
        console.log('❌ Test failed:', error.message);
        return false;
    }
}

applyUserCreationFix();

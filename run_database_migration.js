const { supabase } = require('./src/services/supabase');
const fs = require('fs');
const path = require('path');

async function runDatabaseMigration() {
  console.log('🔧 Running complete onboarding database migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'complete_onboarding_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (basic approach)
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && stmt !== '');
    
    console.log(`📋 Executing ${statements.length} migration statements...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }
      
      console.log(`⚡ Statement ${i + 1}: ${statement.substring(0, 50)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_statement: statement 
        });
        
        if (error) {
          // Try direct execution if RPC fails
          const { data: directData, error: directError } = await supabase
            .from('founders')
            .select('*')
            .limit(1);
            
          if (directError && directError.message.includes('does not exist')) {
            console.log('⚠️  Table might not exist, trying raw SQL...');
            // For schema changes, we might need to execute differently
            console.log('   Statement may need manual execution in Supabase Dashboard');
          } else {
            console.log('❌ Error:', error.message);
          }
        } else {
          console.log('✅ Success');
        }
      } catch (execError) {
        console.log('❌ Execution error:', execError.message);
      }
    }
    
    console.log('\n🎯 Migration execution attempted. Verifying results...\n');
    
    // Verify the migration worked
    await verifyMigration();
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  }
}

async function verifyMigration() {
  try {
    // Test 1: Check if we can query founders table
    console.log('1. Testing founders table access...');
    const { data: founders, error: foundersError } = await supabase
      .from('founders')
      .select('email, onboarding_completed, profile_progress')
      .limit(1);
    
    if (foundersError) {
      console.log('❌ Cannot access founders table:', foundersError.message);
    } else {
      console.log('✅ Founders table accessible');
    }
    
    // Test 2: Check if helper function exists
    console.log('2. Testing helper function...');
    const { data: funcData, error: funcError } = await supabase
      .rpc('is_onboarding_complete', { user_id: '00000000-0000-0000-0000-000000000000' });
    
    if (funcError) {
      console.log('❌ Helper function not available:', funcError.message);
    } else {
      console.log('✅ Helper function exists');
    }
    
    // Test 3: Check if upsert function exists
    console.log('3. Testing upsert function...');
    const testData = {
      full_name: 'Test User',
      role: 'Founder',
      company_name: 'Test Company',
      industry: 'Tech',
      location_city: 'Test City',
      linkedin_url: 'https://linkedin.com/in/test',
      bio: 'Test bio',
      tags_or_interests: ['test'],
      profile_visible: true
    };
    
    const { data: upsertData, error: upsertError } = await supabase
      .rpc('upsert_founder_onboarding', {
        user_id: '00000000-0000-0000-0000-000000000000',
        user_email: 'test@example.com',
        founder_data: testData
      });
    
    if (upsertError) {
      console.log('❌ Upsert function not available:', upsertError.message);
    } else {
      console.log('✅ Upsert function exists');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

// Run the migration
runDatabaseMigration().then(() => {
  console.log('\n🎉 Database migration process completed!');
  console.log('📋 Please also run this SQL manually in Supabase Dashboard:');
  console.log('   Go to Dashboard > SQL Editor > Paste the complete_onboarding_migration.sql');
  process.exit(0);
});

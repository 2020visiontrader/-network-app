const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateFoundersSchema() {
  console.log('🔧 Updating founders table schema for onboarding flow...');
  
  try {
    // First, check current schema
    console.log('1. Checking current schema...');
    const { data: columns, error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `SELECT column_name, data_type, is_nullable, column_default 
            FROM information_schema.columns 
            WHERE table_name = 'founders' 
            ORDER BY ordinal_position;`
    });

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError);
      return;
    }

    console.log('📋 Current columns:', columns?.map(c => `${c.column_name} (${c.data_type})`));

    // Add missing columns if needed
    const columnsToAdd = [
      { name: 'location_city', type: 'text', current: 'location' },
      { name: 'tags_or_interests', type: 'text[]', current: 'tags' },
      { name: 'profile_visible', type: 'boolean DEFAULT true', current: 'is_visible' },
      { name: 'onboarding_completed', type: 'boolean DEFAULT false', current: 'onboarding_complete' }
    ];

    for (const column of columnsToAdd) {
      console.log(`2. Adding/updating column: ${column.name}...`);
      
      // Add new column if it doesn't exist
      try {
        await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE founders ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
        });
        console.log(`✅ Added column: ${column.name}`);
      } catch (error) {
        console.log(`⚠️  Column ${column.name} may already exist:`, error.message);
      }

      // Copy data from old column if it exists
      if (column.current) {
        try {
          await supabase.rpc('exec_sql', {
            sql: `UPDATE founders SET ${column.name} = ${column.current} WHERE ${column.name} IS NULL AND ${column.current} IS NOT NULL;`
          });
          console.log(`✅ Copied data from ${column.current} to ${column.name}`);
        } catch (error) {
          console.log(`⚠️  Could not copy data from ${column.current}:`, error.message);
        }
      }
    }

    // Handle tags_or_interests special case (convert text to array)
    console.log('3. Converting tags to array format...');
    try {
      await supabase.rpc('exec_sql', {
        sql: `UPDATE founders 
              SET tags_or_interests = string_to_array(tags, ',') 
              WHERE tags_or_interests IS NULL 
              AND tags IS NOT NULL 
              AND tags != '';`
      });
      console.log('✅ Converted tags to array format');
    } catch (error) {
      console.log('⚠️  Could not convert tags to array:', error.message);
    }

    // Test the new schema with a sample query
    console.log('4. Testing new schema...');
    const { data: testData, error: testError } = await supabase
      .from('founders')
      .select('id, full_name, location_city, tags_or_interests, profile_visible, onboarding_completed')
      .limit(1);

    if (testError) {
      console.error('❌ Error testing new schema:', testError);
    } else {
      console.log('✅ New schema test successful');
      console.log('📄 Sample data:', testData);
    }

    console.log('\n🎉 Founders table schema update complete!');
    console.log('\n📝 New onboarding fields:');
    console.log('- full_name');
    console.log('- linkedin_url');
    console.log('- location_city');
    console.log('- industry');
    console.log('- company_name');
    console.log('- role');
    console.log('- bio');
    console.log('- tags_or_interests (array)');
    console.log('- profile_visible (boolean)');
    console.log('- onboarding_completed (boolean)');

  } catch (error) {
    console.error('❌ Error updating schema:', error);
  }
}

updateFoundersSchema();

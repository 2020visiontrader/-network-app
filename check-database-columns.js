// Database Column Verification Script
// Run this to check if the required columns exist in your Supabase database

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseColumns() {
  console.log('🔍 Checking Supabase database schema...\n');

  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('founders')
      .select('id')
      .limit(1);

    if (testError) {
      console.error('❌ Database connection failed:', testError.message);
      return;
    }
    console.log('✅ Database connection successful\n');

    // Check if onboarding_completed column exists by trying to select it
    console.log('2. Checking for onboarding_completed column...');
    const { data: onboardingData, error: onboardingError } = await supabase
      .from('founders')
      .select('onboarding_completed')
      .limit(1);

    if (onboardingError) {
      console.error('❌ onboarding_completed column missing!');
      console.error('Error:', onboardingError.message);
      console.log('\n🔧 FIX: Run the ADD_MISSING_COLUMN.sql script in your Supabase SQL editor\n');
    } else {
      console.log('✅ onboarding_completed column exists');
    }

    // Check other important columns
    const columnsToCheck = [
      'profile_progress',
      'onboarding_step', 
      'profile_visible',
      'is_active',
      'is_verified'
    ];

    console.log('\n3. Checking other important columns...');
    for (const column of columnsToCheck) {
      try {
        const { error } = await supabase
          .from('founders')
          .select(column)
          .limit(1);

        if (error) {
          console.log(`❌ ${column}: MISSING`);
        } else {
          console.log(`✅ ${column}: EXISTS`);
        }
      } catch (err) {
        console.log(`❌ ${column}: ERROR checking`);
      }
    }

    // Show sample founder data to verify structure
    console.log('\n4. Sample founder data structure:');
    const { data: sampleData, error: sampleError } = await supabase
      .from('founders')
      .select('id, email, full_name, onboarding_completed, profile_progress')
      .limit(1);

    if (sampleError) {
      console.error('❌ Could not fetch sample data:', sampleError.message);
    } else if (sampleData && sampleData.length > 0) {
      console.log('✅ Sample record structure:');
      console.log(JSON.stringify(sampleData[0], null, 2));
    } else {
      console.log('ℹ️  No founder records found in database');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the check
checkDatabaseColumns().then(() => {
  console.log('\n🏁 Database column check complete!');
  console.log('\nIf any columns are missing, run the ADD_MISSING_COLUMN.sql script in your Supabase dashboard.');
}).catch(console.error);

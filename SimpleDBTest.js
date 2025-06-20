// SimpleDBTest.js - Check database structure and query existing users
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client (replace with your actual URLs and keys)
const supabaseUrl = 'https://gbdodttegdctxvvavlqq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZG9kdHRlZ2RjdHh2dmF2bHFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNDk5OTEsImV4cCI6MjA2NDYyNTk5MX0.pi8qd7QiRakXvUTmOgrits457xn3aQlJHm-c0TwgLyA';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database structure and query existing users
async function checkDatabaseStructure() {
  console.log('🔍 CHECKING DATABASE STRUCTURE');
  console.log('=====================================');
  
  try {
    // Check founders table structure
    console.log('\n1. Founders Table Structure:');
    
    const { data: tableInfo, error: tableError } = await supabase
      .from('founders')
      .select('*')
      .limit(1);
    
    if (tableError) {
      console.error(`   ❌ Error accessing founders table: ${tableError.message}`);
      return;
    }
    
    if (tableInfo && tableInfo.length > 0) {
      const sampleRow = tableInfo[0];
      console.log('   ✅ Founders table accessible');
      
      // List columns
      const columns = Object.keys(sampleRow);
      console.log(`   Found ${columns.length} columns:`);
      
      // Group columns by type
      const groupedColumns = {
        ids: columns.filter(col => col.includes('id')),
        profile: columns.filter(col => ['full_name', 'email', 'company_name', 'role', 'bio', 'industry', 'location_city', 'linkedin_url'].includes(col)),
        flags: columns.filter(col => ['onboarding_completed', 'profile_visible', 'profile_progress'].includes(col)),
        timestamps: columns.filter(col => ['created_at', 'updated_at', 'last_active'].includes(col)),
        other: columns.filter(col => 
          !col.includes('id') && 
          !['full_name', 'email', 'company_name', 'role', 'bio', 'industry', 'location_city', 'linkedin_url'].includes(col) &&
          !['onboarding_completed', 'profile_visible', 'profile_progress'].includes(col) &&
          !['created_at', 'updated_at', 'last_active'].includes(col)
        )
      };
      
      console.log('   ID columns:', groupedColumns.ids.join(', '));
      console.log('   Profile columns:', groupedColumns.profile.join(', '));
      console.log('   Flag columns:', groupedColumns.flags.join(', '));
      console.log('   Timestamp columns:', groupedColumns.timestamps.join(', '));
      console.log('   Other columns:', groupedColumns.other.join(', '));
      
      // Check for critical columns
      const criticalColumns = ['id', 'user_id', 'email', 'onboarding_completed'];
      const missingColumns = criticalColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`   ⚠️ Missing critical columns: ${missingColumns.join(', ')}`);
      } else {
        console.log('   ✅ All critical columns present');
      }
    } else {
      console.log('   ⚠️ Founders table exists but is empty');
    }
    
    // Count founders in the database
    console.log('\n2. Database Population:');
    
    const { data: countData, error: countError } = await supabase
      .from('founders')
      .select('id', { count: 'exact' });
    
    if (countError) {
      console.error(`   ❌ Error counting founders: ${countError.message}`);
    } else {
      console.log(`   Found ${countData.length} founder records in the database`);
    }
    
    // Check for any founders with onboarding completed
    const { data: onboardedData, error: onboardedError } = await supabase
      .from('founders')
      .select('id, email, onboarding_completed')
      .eq('onboarding_completed', true)
      .limit(5);
    
    if (onboardedError) {
      console.error(`   ❌ Error checking onboarded founders: ${onboardedError.message}`);
    } else if (onboardedData && onboardedData.length > 0) {
      console.log(`   Found ${onboardedData.length} founders with completed onboarding`);
      console.log('   Sample onboarded founders:');
      onboardedData.forEach((founder, index) => {
        console.log(`     ${index + 1}. ID: ${founder.id.substring(0, 8)}... | Email: ${founder.email}`);
      });
    } else {
      console.log('   No founders with completed onboarding found');
    }
    
    // Try to query the first founder using user_id
    if (tableInfo && tableInfo.length > 0) {
      const sampleFounder = tableInfo[0];
      console.log('\n3. Testing user_id query:');
      
      if (sampleFounder.user_id) {
        const { data: userIdData, error: userIdError } = await supabase
          .from('founders')
          .select('*')
          .eq('user_id', sampleFounder.user_id)
          .maybeSingle();
        
        if (userIdError) {
          console.error(`   ❌ Error querying by user_id: ${userIdError.message}`);
        } else if (userIdData) {
          console.log('   ✅ Successfully queried founder by user_id');
          console.log(`   ID: ${userIdData.id.substring(0, 8)}...`);
          console.log(`   user_id: ${userIdData.user_id.substring(0, 8)}...`);
          console.log(`   Email: ${userIdData.email}`);
          
          if (userIdData.id === userIdData.user_id) {
            console.log('   ✅ id and user_id match (good for RLS policies)');
          } else {
            console.log('   ⚠️ id and user_id do not match (might affect RLS policies)');
          }
        } else {
          console.log('   ⚠️ No founder found with that user_id');
        }
      } else {
        console.log('   ⚠️ Sample founder does not have user_id field');
      }
    }
    
    console.log('\n✅ DATABASE STRUCTURE CHECK COMPLETE');
    
  } catch (error) {
    console.error('\n❌ ERROR DURING DATABASE CHECK:');
    console.error(`   ${error.message}`);
  }
}

// Run the check
checkDatabaseStructure();

module.exports = { checkDatabaseStructure };

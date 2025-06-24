const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

// Path to session token file (created by persistent-auth.js)
const tokenFilePath = path.join(__dirname, '.supabase_session');

// Create a Supabase client with proper credentials
let supabase;

// Check for service key first (preferred), then session token
if (supabaseServiceKey) {
  console.log('✅ Using service role key (preferred method)');
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else if (fs.existsSync(tokenFilePath)) {
  console.log('ℹ️ Using stored session token');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Load and apply the session
  try {
    const sessionData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
    console.log('🔐 Loaded session from file, applying now...');
    
    // We'll apply this right before running queries
    global.sessionData = sessionData;
  } catch (err) {
    console.error('❌ Error reading session file:', err.message);
  }
} else {
  console.log('⚠️ No service key or session found. Using anonymous key only.');
  console.log('❌ This may fail due to RLS policies.');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// Main function
async function main() {
  try {
    // If we have session data, apply it
    if (global.sessionData) {
      console.log('🔐 Setting authentication session...');
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: global.sessionData.access_token,
        refresh_token: global.sessionData.refresh_token,
      });
      
      if (sessionError) {
        console.error('❌ Error setting session:', sessionError.message);
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          console.log(`✅ Authenticated as: ${userData.user.email}`);
        }
      }
    }
    
    // Start verification
    console.log('\n🔍 VERIFYING DATABASE SETUP');
    console.log('=======================');
    
    // Check 1: Verify the tables
    console.log('\n1️⃣ Checking for required tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['founders', 'connections']);
      
    if (tablesError) {
      console.error('❌ Error checking tables:', tablesError.message);
    } else {
      const tableNames = tables.map(t => t.table_name);
      console.log('📊 Found tables:', tableNames.join(', '));
      
      if (!tableNames.includes('founders')) {
        console.log('❌ Missing founders table - SQL fix not applied');
      } else if (!tableNames.includes('connections')) {
        console.log('❌ Missing connections table - SQL fix not applied');
      } else {
        console.log('✅ Required tables exist');
      }
    }
    
    // Check 2: Verify columns in founders table
    console.log('\n2️⃣ Checking columns in founders table...');
    const { data: founderColumns, error: founderColumnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'founders');
      
    if (founderColumnsError) {
      console.error('❌ Error checking founder columns:', founderColumnsError.message);
    } else {
      const requiredColumns = ['id', 'user_id', 'profile_visible', 'created_at', 'updated_at'];
      const columnNames = founderColumns.map(c => c.column_name);
      
      console.log('📊 Found columns:', columnNames.join(', '));
      
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      if (missingColumns.length > 0) {
        console.log('⚠️ Missing columns in founders table:', missingColumns.join(', '));
      } else {
        console.log('✅ All required columns exist in founders table');
      }
    }
    
    // Check 3: Verify RLS is enabled
    console.log('\n3️⃣ Checking if RLS is enabled...');
    const { data: rls, error: rlsError } = await supabase
      .from('pg_tables')
      .select('tablename, rowsecurity')
      .eq('schemaname', 'public')
      .in('tablename', ['founders', 'connections']);
      
    if (rlsError) {
      console.error('❌ Error checking RLS:', rlsError.message);
    } else {
      console.log('📊 RLS status:');
      rls.forEach(table => {
        console.log(`   ${table.tablename}: ${table.rowsecurity ? '✅ Enabled' : '❌ Disabled'}`);
      });
      
      const allEnabled = rls.every(table => table.rowsecurity);
      if (allEnabled) {
        console.log('✅ RLS is properly enabled on all tables');
      } else {
        console.log('⚠️ RLS is not enabled on all tables - SQL fix may not be fully applied');
      }
    }
    
    // Check 4: Verify cleanup functions
    console.log('\n4️⃣ Checking for cleanup functions...');
    const { data: functions, error: functionsError } = await supabase
      .from('pg_proc')
      .select('proname')
      .eq('pronamespace', 'public'::regnamespace)
      .in('proname', ['safe_cleanup_founders', 'safe_cleanup_connections', 'is_valid_uuid']);
      
    if (functionsError) {
      console.error('❌ Error checking functions:', functionsError.message);
      console.log('⚠️ This is expected if you lack permissions to query pg_proc');
      
      // Try testing the functions directly
      console.log('\n   Attempting to call functions directly...');
      
      try {
        const { data: uuidTest, error: uuidError } = await supabase.rpc('is_valid_uuid', { 
          str: '123e4567-e89b-12d3-a456-426614174000' 
        });
        
        if (uuidError) {
          console.error('   ❌ is_valid_uuid function not working:', uuidError.message);
        } else {
          console.log('   ✅ is_valid_uuid function works!');
        }
      } catch (err) {
        console.error('   ❌ Error testing is_valid_uuid function:', err.message);
      }
    } else {
      const functionNames = functions.map(f => f.proname);
      console.log('📊 Found functions:', functionNames.join(', '));
      
      const requiredFunctions = ['safe_cleanup_founders', 'safe_cleanup_connections', 'is_valid_uuid'];
      const missingFunctions = requiredFunctions.filter(fn => !functionNames.includes(fn));
      
      if (missingFunctions.length > 0) {
        console.log('⚠️ Missing functions:', missingFunctions.join(', '));
      } else {
        console.log('✅ All required functions exist');
      }
    }
    
    // Summary
    console.log('\n📋 VERIFICATION SUMMARY');
    console.log('===================');
    console.log('Based on the checks above, here\'s the status of your database:');
    
    if (tablesError || founderColumnsError || rlsError) {
      console.log('⚠️ Could not fully verify due to permission issues');
      console.log('💡 Use the Supabase dashboard to verify manually');
    } else {
      const tablesOk = tables && tables.length === 2;
      const columnsOk = founderColumns && founderColumns.length >= 5;
      const rlsOk = rls && rls.every(table => table.rowsecurity);
      
      if (tablesOk && columnsOk && rlsOk) {
        console.log('✅ DATABASE SETUP APPEARS COMPLETE');
        console.log('Your database has the required tables, columns, and RLS is enabled.');
      } else if (tablesOk && columnsOk) {
        console.log('⚠️ PARTIAL SETUP DETECTED');
        console.log('Tables and columns exist, but RLS may not be properly configured.');
      } else {
        console.log('❌ INCOMPLETE SETUP');
        console.log('Some required tables or columns are missing.');
      }
    }
    
    // Next steps
    console.log('\n📋 NEXT STEPS:');
    console.log('1. If verification shows incomplete setup, apply the SQL fixes in the Supabase SQL Editor');
    console.log('2. If verification shows complete setup, run your tests with proper authentication');
    console.log('3. Use node persistent-auth.js run <script> to run tests with authentication');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

main();

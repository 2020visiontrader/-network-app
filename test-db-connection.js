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
    
    // Step 1: Let's verify if we can run queries
    console.log('\n🧪 Testing database connection...');
    
    const { data, error } = await supabase.from('founders').select('*').limit(1);
    
    if (error) {
      console.error('❌ Database access error:', error.message);
      
      // If the error is about permissions, explain next steps
      if (error.message.includes('permission denied')) {
        console.log('\n⚠️ Permission denied error. This is expected if RLS is enabled.');
        console.log('⚠️ You need to use the Supabase SQL Editor to execute the script directly.');
        console.log('⚠️ Follow these steps:');
        console.log('   1. Copy the contents of improved-permission-fix.sql');
        console.log('   2. Log in to your Supabase dashboard');
        console.log('   3. Go to the SQL Editor');
        console.log('   4. Paste the SQL and run it');
        console.log('   5. This will properly set up the permissions');
      }
    } else {
      console.log('✅ Successfully connected to database');
      console.log(`   Found ${data.length} founder records`);
      
      if (data.length > 0) {
        console.log(`   Sample record ID: ${data[0].id}`);
      }
    }
    
    // Test if we can directly execute SQL statements using rpc
    // This requires that the 'query' function already exists in the database
    console.log('\n🧪 Testing if we can execute SQL via RPC...');
    
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('query', { 
        sql_query: 'SELECT current_timestamp' 
      });
      
      if (rpcError) {
        console.error('❌ Cannot execute SQL via RPC:', rpcError.message);
        console.log('⚠️ The query function does not exist or you lack permissions');
        console.log('⚠️ Please use the Supabase SQL Editor instead');
      } else {
        console.log('✅ SQL execution via RPC works!');
        console.log('   You can use the execute-sql.js script');
      }
    } catch (err) {
      console.error('❌ Error testing SQL execution:', err.message);
    }
    
    console.log('\n📋 RECOMMENDED STEPS:');
    console.log('1. Copy the contents of improved-permission-fix.sql');
    console.log('2. Log in to your Supabase dashboard');
    console.log('3. Go to the SQL Editor');
    console.log('4. Paste the SQL and run it');
    console.log('5. This will properly set up the permissions');
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

main();

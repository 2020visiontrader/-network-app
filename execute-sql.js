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

// Create a Supabase client
let supabase;

// Check if we should use service role key (preferred) or try to restore session
if (supabaseServiceKey) {
  console.log('✅ Using service role key (preferred method)');
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else if (fs.existsSync(tokenFilePath)) {
  console.log('ℹ️ Using stored session token');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  console.log('⚠️ No service key or session found. Using anonymous key only.');
  console.log('❌ This may fail due to RLS policies.');
  supabase = createClient(supabaseUrl, supabaseAnonKey);
}

// SQL file to execute
const sqlFilePath = process.argv[2] || 'improved-permission-fix.sql';

// Function to execute SQL in chunks
async function executeSql() {
  try {
    // Check if file exists
    if (!fs.existsSync(sqlFilePath)) {
      console.error(`❌ SQL file not found: ${sqlFilePath}`);
      process.exit(1);
    }
    
    // Read the SQL file
    console.log(`📄 Reading SQL file: ${sqlFilePath}`);
    const sql = fs.readFileSync(sqlFilePath, 'utf8');
    
    // If using stored session, try to restore it
    if (fs.existsSync(tokenFilePath) && !supabaseServiceKey) {
      console.log('🔐 Restoring authentication session...');
      try {
        const sessionData = JSON.parse(fs.readFileSync(tokenFilePath, 'utf8'));
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: sessionData.access_token,
          refresh_token: sessionData.refresh_token,
        });
        
        if (sessionError) {
          console.error('❌ Error restoring session:', sessionError.message);
        } else {
          const { data: userData } = await supabase.auth.getUser();
          if (userData && userData.user) {
            console.log(`✅ Authenticated as: ${userData.user.email}`);
          }
        }
      } catch (err) {
        console.error('❌ Error reading or parsing session file:', err.message);
      }
    }
    
    // Split the SQL into statements
    // This is a simple approach - won't handle all edge cases
    const statements = sql
      .replace(/--.*$/gm, '') // Remove comments
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`🔢 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      
      // Skip empty statements
      if (!stmt) continue;
      
      try {
        // Execute the statement
        console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
        
        // For short statements, log them
        if (stmt.length < 100) {
          console.log(`📝 ${stmt}`);
        } else {
          console.log(`📝 ${stmt.substring(0, 97)}...`);
        }
        
        const { error } = await supabase.rpc('query', { sql_query: stmt });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        }
      } catch (err) {
        console.error(`❌ Unexpected error on statement ${i + 1}:`, err.message);
        errorCount++;
      }
    }
    
    // Summary
    console.log('\n📊 EXECUTION SUMMARY');
    console.log('==================');
    console.log(`Total statements: ${statements.length}`);
    console.log(`Successful: ${successCount}`);
    console.log(`Failed: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n✅ All SQL statements executed successfully!');
    } else {
      console.log('\n⚠️ Some statements failed. See errors above.');
    }
    
  } catch (err) {
    console.error('❌ Unexpected error:', err);
    process.exit(1);
  }
}

// Add function to execute the query
async function addQueryFunction() {
  // Skip if using service role (already has access)
  if (supabaseServiceKey) {
    return;
  }
  
  console.log('🔧 Adding query function to database...');
  
  const createQueryFunctionSql = `
  CREATE OR REPLACE FUNCTION public.query(sql_query text)
  RETURNS jsonb
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  DECLARE
    result jsonb;
  BEGIN
    EXECUTE sql_query;
    result := '{"success": true}'::jsonb;
    RETURN result;
  EXCEPTION WHEN OTHERS THEN
    result := jsonb_build_object(
      'success', false,
      'error', SQLERRM,
      'detail', SQLSTATE
    );
    RETURN result;
  END;
  $$;
  
  -- Grant execute permissions
  GRANT EXECUTE ON FUNCTION public.query(text) TO authenticated;
  GRANT EXECUTE ON FUNCTION public.query(text) TO anon;
  `;
  
  try {
    // We have to manually construct and execute this one
    const { data, error } = await supabase.rpc('query', { sql_query: createQueryFunctionSql });
    
    if (error) {
      console.error('❌ Error creating query function:', error.message);
      console.log('⚠️ Attempting to continue without query function');
    } else {
      console.log('✅ Query function created successfully');
    }
  } catch (err) {
    console.error('❌ Error creating query function:', err.message);
    console.log('⚠️ This might be because it already exists or you lack permissions');
    console.log('⚠️ Attempting to continue without recreating the function');
  }
}

// Main execution
async function main() {
  try {
    await addQueryFunction();
    await executeSql();
  } catch (err) {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  }
}

main();

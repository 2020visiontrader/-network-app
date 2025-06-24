const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
const refreshToken = process.env.SUPABASE_REFRESH_TOKEN;

// Paths to SQL files
const sqlFilePath = process.argv[2];

if (!sqlFilePath) {
  console.error('❌ No SQL file provided');
  console.error('Usage: node run-sql.js <path-to-sql-file>');
  process.exit(1);
}

if (!fs.existsSync(sqlFilePath)) {
  console.error(`❌ SQL file not found: ${sqlFilePath}`);
  process.exit(1);
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runSql() {
  console.log(`🔍 Running SQL from ${sqlFilePath}...`);
  
  try {
    // Set the session if available
    if (accessToken && refreshToken) {
      console.log('🔐 Setting authenticated session...');
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      
      if (sessionError) {
        console.error('❌ Error setting session:', sessionError.message);
        console.log('⚠️ Continuing without authentication...');
      } else {
        // Check current user
        const { data: userData } = await supabase.auth.getUser();
        if (userData && userData.user) {
          console.log('✅ Authenticated as:', userData.user.email);
        }
      }
    } else {
      console.log('⚠️ No authentication session found, continuing anonymously...');
    }
    
    // Read the SQL file
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Split the SQL into statements (rudimentary approach)
    const statements = sqlContent.split(';').filter(stmt => stmt.trim());
    
    console.log(`📄 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (!stmt) continue;
      
      try {
        // Add semicolon back for execution
        const { error } = await supabase.rpc('query', { sql_query: stmt + ';' });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (e) {
        console.error(`❌ Exception executing statement ${i + 1}:`, e.message);
        errorCount++;
      }
      
      // Show progress for long scripts
      if (i % 10 === 0 && i > 0) {
        console.log(`🔄 Progress: ${i}/${statements.length} statements processed`);
      }
    }
    
    console.log('\n✅ SQL execution complete');
    console.log(`📊 Results: ${successCount} successful, ${errorCount} failed`);
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

runSql();

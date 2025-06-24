const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

// Create Supabase client with service role (to bypass RLS)
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
  try {
    // Check arguments
    if (process.argv.length < 3) {
      console.error('❌ Usage: node run-sql-file.js <path-to-sql-file>');
      process.exit(1);
    }

    const sqlFilePath = process.argv[2];

    console.log(`📄 Reading SQL file: ${sqlFilePath}`);
    
    // Read SQL file
    let sqlContent;
    try {
      sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    } catch (error) {
      console.error(`❌ Error reading SQL file: ${error.message}`);
      process.exit(1);
    }

    console.log('🔄 Executing SQL...');
    
    // Execute SQL
    const { error } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
    
    if (error) {
      console.error(`❌ Error executing SQL: ${error.message}`);
      if (error.message.includes('function "exec_sql" does not exist')) {
        console.log('\n⚠️ The exec_sql function does not exist in your database.');
        console.log('Creating exec_sql function...');
        
        // Create the exec_sql function
        const createFunctionSql = `
          CREATE OR REPLACE FUNCTION exec_sql(sql_query TEXT)
          RETURNS VOID
          LANGUAGE plpgsql
          SECURITY DEFINER
          AS $$
          BEGIN
            EXECUTE sql_query;
          END;
          $$;
          
          -- Grant execute permission to service role
          GRANT EXECUTE ON FUNCTION exec_sql(TEXT) TO service_role;
        `;
        
        const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql_query: createFunctionSql });
        
        if (createFunctionError) {
          if (createFunctionError.message.includes('function "exec_sql" does not exist')) {
            console.log('⚠️ Cannot create the function automatically.');
            console.log('Please run this SQL in the Supabase SQL Editor first:');
            console.log('```sql');
            console.log(createFunctionSql);
            console.log('```');
            console.log('Then run this script again.');
          } else {
            console.error(`❌ Error creating function: ${createFunctionError.message}`);
          }
          process.exit(1);
        }
        
        // Try executing the original SQL again
        console.log('🔄 Retrying SQL execution...');
        const { error: retryError } = await supabase.rpc('exec_sql', { sql_query: sqlContent });
        
        if (retryError) {
          console.error(`❌ Error executing SQL on retry: ${retryError.message}`);
          process.exit(1);
        }
      } else {
        process.exit(1);
      }
    }
    
    console.log('✅ SQL executed successfully');
  } catch (error) {
    console.error(`❌ Unexpected error: ${error.message}`);
    process.exit(1);
  }
}

main();

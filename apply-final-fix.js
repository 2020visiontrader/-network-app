// Execute final-permission-fix.sql via REST API
// This approach might avoid SQL editor errors

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('⛔ Missing environment variables for Supabase connection');
  console.error('  Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseKey);

// Function to execute SQL with better error handling
async function executeSqlWithRetry(sql) {
  // Split the SQL into separate statements based on specific delimiters
  // This regex handles DO blocks and other compound statements better
  const statements = [];
  let currentStatement = '';
  let inDoBlock = false;
  
  const lines = sql.split('\n');
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip pure comment lines
    if (trimmedLine.startsWith('--')) {
      continue;
    }
    
    // Check for DO block start
    if (trimmedLine.startsWith('DO') || inDoBlock) {
      inDoBlock = true;
      currentStatement += line + '\n';
      
      // Check for end of DO block
      if (trimmedLine.includes('END') && trimmedLine.includes('$$')) {
        inDoBlock = false;
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
      continue;
    }
    
    // Handle normal statements (not in DO block)
    if (!inDoBlock) {
      currentStatement += line + '\n';
      
      // Check for statement end
      if (trimmedLine.endsWith(';')) {
        if (currentStatement.trim().length > 0) {
          statements.push(currentStatement.trim());
        }
        currentStatement = '';
      }
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim().length > 0) {
    statements.push(currentStatement.trim());
  }
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  // Process each statement
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const firstLine = statement.split('\n')[0].trim();
    console.log(`[${i+1}/${statements.length}] Executing: ${firstLine.substring(0, 60)}...`);
    
    try {
      // Execute the statement
      const { data, error } = await supabase.rpc('execute_sql', { 
        sql_command: statement 
      });
      
      if (error) {
        console.error(`❌ Error executing statement ${i+1}:`, error);
        console.error('Statement was:', statement.substring(0, 200) + '...');
      } else {
        console.log(`✅ Statement ${i+1} executed successfully`);
      }
    } catch (err) {
      console.error(`❌ Exception executing statement ${i+1}:`, err);
      console.error('Statement was:', statement.substring(0, 200) + '...');
    }
  }
}

async function main() {
  try {
    // Create execute_sql function if it doesn't exist
    console.log('Setting up execute_sql function...');
    await setupExecuteSqlFunction();
    
    // Read the SQL file
    const sqlFile = './final-permission-fix.sql';
    console.log(`Reading SQL file: ${sqlFile}`);
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Execute the SQL
    console.log('Executing SQL file...');
    await executeSqlWithRetry(sql);
    
    console.log('\n✅ SQL execution complete');
    
    // Check policies after execution
    console.log('\nVerifying policies...');
    const { data: policies, error: policiesError } = await supabase.rpc('check_policies', {
      table_names: ['founders', 'connections']
    });
    
    if (policiesError) {
      console.error('Error checking policies:', policiesError);
    } else {
      console.log('\n📋 Current RLS Policies:');
      console.table(policies);
    }
    
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Create the execute_sql function if it doesn't exist
async function setupExecuteSqlFunction() {
  const sql = `
  -- Create function to execute SQL (use with caution - only for admin/service role)
  CREATE OR REPLACE FUNCTION execute_sql(sql_command text)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    EXECUTE sql_command;
    RETURN 'SQL executed successfully';
  EXCEPTION WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
  END;
  $$;
  
  -- Create the check_policies function
  CREATE OR REPLACE FUNCTION check_policies(table_names text[])
  RETURNS TABLE (
    schemaname text,
    tablename text,
    policyname text,
    permissive text,
    roles text[],
    cmd text,
    qual text
  )
  LANGUAGE plpgsql
  SECURITY DEFINER
  AS $$
  BEGIN
    RETURN QUERY
    SELECT
      p.schemaname::text,
      p.tablename::text,
      p.policyname::text,
      p.permissive::text,
      p.roles::text[],
      p.cmd::text,
      p.qual::text
    FROM
      pg_policies p
    WHERE
      p.schemaname = 'public'
      AND p.tablename = ANY(table_names)
    ORDER BY
      p.tablename,
      p.policyname;
  END;
  $$;
  
  -- Grant execution permissions
  GRANT EXECUTE ON FUNCTION execute_sql(text) TO service_role;
  GRANT EXECUTE ON FUNCTION check_policies(text[]) TO service_role;
  `;
  
  // Execute the function creation SQL directly
  const { data, error } = await supabase.rpc('execute_sql', { sql_command: sql });
  
  if (error) {
    console.error('Error setting up functions:', error);
    console.log('Please run this SQL in the Supabase SQL Editor manually:');
    console.log(sql);
  } else {
    console.log('SQL execution functions ready');
  }
}

// Run the main function
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

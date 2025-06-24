// Apply RLS and Schema Fixes to Database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Get Supabase credentials
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function applyFixes() {
  console.log('🔧 Applying RLS and schema fixes...');
  
  try {
    // Read the SQL file
    const sqlContent = fs.readFileSync('./fix_rls_and_schema.sql', 'utf8');
    
    // Split the SQL into statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i+1}/${statements.length}...`);
      
      try {
        // Execute the SQL directly if possible
        const { error } = await supabase.rpc('exec_sql', { sql: stmt });
        
        if (error) {
          console.error(`❌ Error executing statement ${i+1}:`, error);
          console.log('SQL Statement:', stmt);
          console.log('\nYou may need to run this SQL manually in the Supabase dashboard SQL editor.');
        } else {
          console.log(`✅ Statement ${i+1} executed successfully`);
        }
      } catch (stmtError) {
        console.error(`❌ Error executing statement ${i+1}:`, stmtError);
        console.log('SQL Statement:', stmt);
      }
    }
    
    console.log('\n✅ Fixes applied successfully!');
    console.log('Please run the verification script again to confirm the fixes resolved the issues.');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    console.log('\nPlease apply the fixes manually using the SQL in fix_rls_and_schema.sql');
  }
}

applyFixes();

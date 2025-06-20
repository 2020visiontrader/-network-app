const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Required:');
  console.log('- EXPO_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyRLSPolicies() {
  console.log('🔒 Applying RLS Policies...');
  
  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'COMPLETE_RLS_POLICIES.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by statements (rough splitting on semicolons)
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        
        const { error } = await supabase.rpc('sql', { 
          query: statement + ';' 
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      }
    }
    
    console.log('✅ RLS Policies application completed');
    
  } catch (error) {
    console.error('❌ Error applying RLS policies:', error);
  }
}

applyRLSPolicies();

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPolicies() {
  console.log('🔍 Checking RLS Policies with WITH CHECK clause...');
  
  try {
    // Get policies with both qual and with_check columns
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql: `
        SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM
            pg_policies
        WHERE
            schemaname = 'public'
            AND tablename IN ('founders', 'connections', 'coffee_chats', 'events', 'event_attendees')
        ORDER BY
            tablename,
            policyname;
      `
    });

    if (error) throw error;
    
    console.log('Policy Information:');
    console.log(JSON.stringify(data, null, 2));
    
    // Filter for INSERT policies to check if they have with_check values
    const insertPolicies = data.filter(policy => policy.cmd === 'INSERT');
    
    console.log('\nINSERT Policies with WITH CHECK clauses:');
    insertPolicies.forEach(policy => {
      console.log(`Table: ${policy.tablename}, Policy: ${policy.policyname}`);
      console.log(`  - qual: ${policy.qual ? 'Set' : 'NULL'}`);
      console.log(`  - with_check: ${policy.with_check ? 'Set' : 'NULL'}`);
    });
    
    console.log('\n✅ Check complete');
    
  } catch (error) {
    console.error('❌ Error checking policies:', error);
  }
}

checkPolicies();

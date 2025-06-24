// verify-policies.js
// This script verifies that the RLS policies have been properly applied

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyRLSPolicies() {
  console.log('Verifying RLS policies...\n');

  try {
    // Query to get RLS policies
    const { data: policies, error } = await supabase
      .rpc('check_rls_policies');

    if (error) {
      console.error('Error fetching RLS policies:', error);
      // Try an alternative approach if the RPC fails
      await verifyRLSPoliciesAlternative();
      return;
    }

    console.log('RLS Policies:');
    console.log('--------------');

    if (!policies || policies.length === 0) {
      console.log('No policies found or RPC function not available.');
      await verifyRLSPoliciesAlternative();
      return;
    }

    // Display the policies
    const foundersTablePolicies = policies.filter(p => p.tablename === 'founders');
    const connectionsTablePolicies = policies.filter(p => p.tablename === 'connections');

    console.log('Founders Table Policies:');
    if (foundersTablePolicies.length === 0) {
      console.log('  No policies found on founders table');
    } else {
      foundersTablePolicies.forEach(p => {
        console.log(`  - ${p.policyname} (${p.cmd}): ${p.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`);
      });
    }

    console.log('\nConnections Table Policies:');
    if (connectionsTablePolicies.length === 0) {
      console.log('  No policies found on connections table');
    } else {
      connectionsTablePolicies.forEach(p => {
        console.log(`  - ${p.policyname} (${p.cmd}): ${p.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`);
      });
    }

    // Validate that only our expected policies exist
    const expectedFoundersPolicies = [
      'founders_select_policy',
      'founders_insert_policy', 
      'founders_update_policy', 
      'founders_delete_policy'
    ];

    const expectedConnectionsPolicies = [
      'connections_select_policy',
      'connections_insert_policy',
      'connections_update_policy',
      'connections_delete_policy'
    ];

    // Check founders policies
    const foundersUnexpected = foundersTablePolicies
      .filter(p => !expectedFoundersPolicies.includes(p.policyname))
      .map(p => p.policyname);

    const foundersMissing = expectedFoundersPolicies
      .filter(pName => !foundersTablePolicies.some(p => p.policyname === pName));

    // Check connections policies
    const connectionsUnexpected = connectionsTablePolicies
      .filter(p => !expectedConnectionsPolicies.includes(p.policyname))
      .map(p => p.policyname);

    const connectionsMissing = expectedConnectionsPolicies
      .filter(pName => !connectionsTablePolicies.some(p => p.policyname === pName));

    // Report issues if any
    console.log('\nValidation Results:');
    console.log('-------------------');

    if (foundersUnexpected.length > 0) {
      console.log(`⚠️ Unexpected policies on founders table: ${foundersUnexpected.join(', ')}`);
    }

    if (foundersMissing.length > 0) {
      console.log(`❌ Missing policies on founders table: ${foundersMissing.join(', ')}`);
    }

    if (connectionsUnexpected.length > 0) {
      console.log(`⚠️ Unexpected policies on connections table: ${connectionsUnexpected.join(', ')}`);
    }

    if (connectionsMissing.length > 0) {
      console.log(`❌ Missing policies on connections table: ${connectionsMissing.join(', ')}`);
    }

    if (
      foundersUnexpected.length === 0 &&
      foundersMissing.length === 0 &&
      connectionsUnexpected.length === 0 &&
      connectionsMissing.length === 0
    ) {
      console.log('✅ All policies are correctly applied!');
    } else {
      console.log('\n❌ Policy validation failed. Please run the final-permission-fix.sql script in the Supabase SQL Editor.');
    }

  } catch (error) {
    console.error('Error in verification process:', error);
    await verifyRLSPoliciesAlternative();
  }
}

// Alternative approach using a direct SQL query via a service role
async function verifyRLSPoliciesAlternative() {
  console.log('\nAttempting alternative policy verification...');

  try {
    // This requires service role key to be set in environment variables
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required for alternative verification');
      return;
    }

    // Create a new client with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);
    
    // Query to fetch RLS policies directly
    const { data, error } = await serviceClient.rpc('execute_sql', { 
      sql_query: `
        SELECT
          schemaname,
          tablename,
          policyname,
          permissive,
          roles,
          cmd
        FROM
          pg_policies
        WHERE
          schemaname = 'public'
          AND tablename IN ('founders', 'connections')
        ORDER BY
          tablename,
          policyname;
      `
    });

    if (error) {
      console.error('Error with alternative policy verification:', error);
      console.log('\nPlease manually check policies in the Supabase dashboard.');
      return;
    }

    // Process the results
    if (data && data.length > 0) {
      console.log('\nRLS Policies (alternative method):');
      console.log('--------------------------------');
      
      data.forEach(policy => {
        console.log(`${policy.tablename}: ${policy.policyname} (${policy.cmd}) - ${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'}`);
      });
    } else {
      console.log('No policies found via alternative method.');
    }
  } catch (err) {
    console.error('Error in alternative verification:', err);
    console.log('\nPlease manually check policies in the Supabase dashboard.');
  }
}

// Add RPC function to check policies if it doesn't exist
async function ensureRpcFunction() {
  try {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.log('Skipping RPC function creation (no service role key available)');
      return;
    }

    // Create a new client with service role
    const serviceClient = createClient(supabaseUrl, serviceRoleKey);

    // Create the RPC function if it doesn't exist
    const { error } = await serviceClient.rpc('execute_sql', { 
      sql_query: `
        CREATE OR REPLACE FUNCTION public.check_rls_policies()
        RETURNS TABLE(
          schemaname text,
          tablename text,
          policyname text,
          permissive boolean,
          roles text[],
          cmd text
        )
        LANGUAGE SQL
        SECURITY DEFINER
        AS $$
          SELECT
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd
          FROM
            pg_policies
          WHERE
            schemaname = 'public'
            AND tablename IN ('founders', 'connections')
          ORDER BY
            tablename,
            policyname;
        $$;

        -- Grant execute permission to authenticated users
        GRANT EXECUTE ON FUNCTION public.check_rls_policies() TO authenticated;
        GRANT EXECUTE ON FUNCTION public.check_rls_policies() TO anon;
      `
    });

    if (error) {
      console.log('Note: Unable to create helper RPC function. Will use alternative approach.');
      return false;
    }

    return true;
  } catch (err) {
    console.log('Note: Unable to create helper RPC function:', err.message);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Ensure we have the RPC function
    await ensureRpcFunction();
    
    // Verify the policies
    await verifyRLSPolicies();
  } catch (error) {
    console.error('Error in main process:', error);
  }
}

// Run the main function
main().catch(console.error);

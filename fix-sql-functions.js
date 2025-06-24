const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

// Get credentials from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL in environment variables');
  process.exit(1);
}

// Try to use service key first, fall back to anon key
const key = supabaseServiceKey || supabaseAnonKey;
if (!key) {
  console.error('❌ Missing API key in environment variables');
  process.exit(1);
}

// Create a Supabase client
const supabase = createClient(supabaseUrl, key);
const useServiceRole = !!supabaseServiceKey;

async function executeSql() {
  console.log(`🔧 Executing SQL with ${useServiceRole ? 'service role' : 'anon'} key...`);
  
  try {
    // Fix for the safe_cleanup_founders function
    const foundersFixSql = `
    -- Function to safely clean test records from founders
    CREATE OR REPLACE FUNCTION public.safe_cleanup_founders()
    RETURNS SETOF uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        has_created_at BOOLEAN;
    BEGIN
        -- Check if created_at column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'founders' AND column_name = 'created_at'
        ) INTO has_created_at;
        
        -- Delete up to 100 test records, using appropriate ordering
        IF has_created_at THEN
            RETURN QUERY
            WITH deleted_rows AS (
                DELETE FROM public.founders
                WHERE id IS NOT NULL
                LIMIT 100
                RETURNING id
            )
            SELECT id FROM deleted_rows;
        ELSE
            RETURN QUERY
            WITH deleted_rows AS (
                DELETE FROM public.founders
                WHERE id IS NOT NULL
                LIMIT 100
                RETURNING id
            )
            SELECT id FROM deleted_rows;
        END IF;
    END;
    $$;
    `;
    
    // Fix for the safe_cleanup_connections function
    const connectionsFixSql = `
    -- Function to safely clean test records from connections
    CREATE OR REPLACE FUNCTION public.safe_cleanup_connections()
    RETURNS SETOF uuid
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        has_created_at BOOLEAN;
    BEGIN
        -- Check if created_at column exists
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'connections' AND column_name = 'created_at'
        ) INTO has_created_at;
        
        -- Delete up to 100 test records
        RETURN QUERY
        WITH deleted_rows AS (
            DELETE FROM public.connections
            WHERE id IS NOT NULL
            LIMIT 100
            RETURNING id
        )
        SELECT id FROM deleted_rows;
    END;
    $$;
    `;
    
    // Execute the fixed functions
    console.log('🔧 Fixing the safe_cleanup_founders function...');
    const { error: foundersError } = await supabase.rpc('supabase_functions.http', {
      method: 'POST',
      url: 'pg',
      headers: { 'Content-Type': 'application/json' },
      body: { query: foundersFixSql }
    });
    
    if (foundersError) {
      console.error('❌ Error fixing founders function:', foundersError.message);
    } else {
      console.log('✅ Fixed safe_cleanup_founders function');
    }
    
    console.log('🔧 Fixing the safe_cleanup_connections function...');
    const { error: connectionsError } = await supabase.rpc('supabase_functions.http', {
      method: 'POST',
      url: 'pg',
      headers: { 'Content-Type': 'application/json' },
      body: { query: connectionsFixSql }
    });
    
    if (connectionsError) {
      console.error('❌ Error fixing connections function:', connectionsError.message);
    } else {
      console.log('✅ Fixed safe_cleanup_connections function');
    }
    
    // Grant permissions
    console.log('🔧 Granting function permissions...');
    const permissionsSql = `
    -- Grant execute permissions to authenticated users
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO authenticated;
    
    -- Grant execute permissions to anonymous users for testing
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO anon;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO anon;
    `;
    
    const { error: permissionsError } = await supabase.rpc('supabase_functions.http', {
      method: 'POST',
      url: 'pg',
      headers: { 'Content-Type': 'application/json' },
      body: { query: permissionsSql }
    });
    
    if (permissionsError) {
      console.error('❌ Error granting permissions:', permissionsError.message);
    } else {
      console.log('✅ Granted function permissions');
    }
    
    // Test the functions
    console.log('\n🧪 Testing the functions...');
    
    // Test is_valid_uuid function
    console.log('Testing is_valid_uuid function...');
    const { data: uuidResult, error: uuidError } = await supabase.rpc(
      'is_valid_uuid',
      { str: '123e4567-e89b-12d3-a456-426614174000' }
    );
    
    if (uuidError) {
      console.error('❌ Error calling is_valid_uuid function:', uuidError.message);
    } else {
      console.log('✅ is_valid_uuid function works:', uuidResult);
    }
    
    // Notify for schema refresh
    console.log('\n🔄 Refreshing schema...');
    const refreshSql = `
    -- Update table comments with timestamp to force refresh
    COMMENT ON TABLE public.founders IS 'Founders data - Last refresh: June 24, 2025';
    COMMENT ON TABLE public.connections IS 'Connection data - Last refresh: June 24, 2025';
    
    -- Notify PostgREST to reload schema
    NOTIFY pgrst, 'reload schema';
    `;
    
    const { error: refreshError } = await supabase.rpc('supabase_functions.http', {
      method: 'POST',
      url: 'pg',
      headers: { 'Content-Type': 'application/json' },
      body: { query: refreshSql }
    });
    
    if (refreshError) {
      console.error('❌ Error refreshing schema:', refreshError.message);
    } else {
      console.log('✅ Schema refreshed');
    }
    
    console.log('\n✅ SQL fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

executeSql();

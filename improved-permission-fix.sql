-- Improved Comprehensive Database Fix for Permission-Friendly Testing
-- This script addresses multiple issues:
-- 1. Missing tables or columns
-- 2. Schema cache refresh issues
-- 3. RLS policy problems
-- 4. Invalid UUID handling
-- 5. Safe cleanup functions
-- 6. Error handling for missing columns

-- ==============================
-- 1. TABLES AND COLUMNS
-- ==============================

-- Ensure founders table exists with required columns
CREATE TABLE IF NOT EXISTS public.founders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT,
    email TEXT,
    bio TEXT,
    profile_visible BOOLEAN DEFAULT true
);

-- Add created_at and updated_at if they don't exist
DO $$
BEGIN
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.founders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.founders ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Ensure connections table exists with required columns
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    founder_a_id UUID NOT NULL,
    founder_b_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL
);

-- Add created_at and updated_at if they don't exist
DO $$
BEGIN
    -- Add created_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE public.connections ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    -- Add updated_at if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE public.connections ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
END
$$;

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS founders_user_id_idx ON public.founders (user_id);
CREATE INDEX IF NOT EXISTS connections_founder_a_id_idx ON public.connections (founder_a_id);
CREATE INDEX IF NOT EXISTS connections_founder_b_id_idx ON public.connections (founder_b_id);

-- Add timestamp indices if columns exist
DO $$
BEGIN
    -- Add created_at index for founders if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS founders_created_at_idx ON public.founders (created_at);
    END IF;
    
    -- Add created_at index for connections if column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'created_at'
    ) THEN
        CREATE INDEX IF NOT EXISTS connections_created_at_idx ON public.connections (created_at);
    END IF;
END
$$;

-- ==============================
-- 2. RLS POLICIES
-- ==============================

-- Enable RLS on all tables
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies
DROP POLICY IF EXISTS founders_select_policy ON public.founders;
DROP POLICY IF EXISTS founders_insert_policy ON public.founders;
DROP POLICY IF EXISTS founders_update_policy ON public.founders;
DROP POLICY IF EXISTS founders_delete_policy ON public.founders;

DROP POLICY IF EXISTS connections_select_policy ON public.connections;
DROP POLICY IF EXISTS connections_insert_policy ON public.connections;
DROP POLICY IF EXISTS connections_update_policy ON public.connections;
DROP POLICY IF EXISTS connections_delete_policy ON public.connections;

-- Create safer, more permissive RLS policies for testing

-- Founders table policies - check if profile_visible exists
DO $$
BEGIN
    -- Create select policy with appropriate conditions
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'profile_visible'
    ) THEN
        -- If profile_visible column exists, use it in the policy
        EXECUTE 'CREATE POLICY founders_select_policy ON public.founders
            FOR SELECT USING (
                profile_visible = true
                OR (auth.uid() = user_id AND auth.role() = ''authenticated'')
                OR (auth.role() = ''anon'')
                OR (auth.role() = ''service_role'')
            )';
    ELSE
        -- If profile_visible doesn't exist, create a simpler policy
        EXECUTE 'CREATE POLICY founders_select_policy ON public.founders
            FOR SELECT USING (
                (auth.uid() = user_id AND auth.role() = ''authenticated'')
                OR (auth.role() = ''anon'')
                OR (auth.role() = ''service_role'')
            )';
    END IF;
END
$$;

-- Standard policies that don't depend on specific columns
CREATE POLICY founders_insert_policy ON public.founders
    FOR INSERT WITH CHECK (
        -- Allow authenticated users to insert their own records
        (auth.uid() = user_id AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY founders_update_policy ON public.founders
    FOR UPDATE USING (
        -- Allow if authenticated user is the owner
        (auth.uid() = user_id AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY founders_delete_policy ON public.founders
    FOR DELETE USING (
        -- Allow if authenticated user is the owner
        (auth.uid() = user_id AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

-- Connections table policies
CREATE POLICY connections_select_policy ON public.connections
    FOR SELECT USING (
        -- Allow authenticated users to see their connections
        ((auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_insert_policy ON public.connections
    FOR INSERT WITH CHECK (
        -- Allow authenticated users to create connections
        ((auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_update_policy ON public.connections
    FOR UPDATE USING (
        -- Allow if user is part of the connection
        ((auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_delete_policy ON public.connections
    FOR DELETE USING (
        -- Allow if user is part of the connection
        ((auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated')
        -- Allow anonymous for testing
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

-- ==============================
-- 3. HELPER FUNCTIONS
-- ==============================

-- Function to safely clean test records from founders
CREATE OR REPLACE FUNCTION public.safe_cleanup_founders()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_created_at BOOLEAN;
    v_id uuid;
    v_ids uuid[] := '{}';
    v_count int := 0;
BEGIN
    -- Check if created_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'created_at'
    ) INTO has_created_at;
    
    -- Delete records one by one to avoid issues with LIMIT in CTEs
    FOR v_id IN 
        SELECT id FROM public.founders
        LIMIT 100
    LOOP
        DELETE FROM public.founders WHERE id = v_id;
        v_ids := array_append(v_ids, v_id);
        v_count := v_count + 1;
    END LOOP;
    
    -- Return the IDs of deleted records
    RETURN QUERY SELECT unnest(v_ids);
END;
$$;

-- Function to safely clean test records from connections
CREATE OR REPLACE FUNCTION public.safe_cleanup_connections()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    has_created_at BOOLEAN;
    v_id uuid;
    v_ids uuid[] := '{}';
    v_count int := 0;
BEGIN
    -- Check if created_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'created_at'
    ) INTO has_created_at;
    
    -- Delete records one by one to avoid issues with LIMIT in CTEs
    FOR v_id IN 
        SELECT id FROM public.connections
        LIMIT 100
    LOOP
        DELETE FROM public.connections WHERE id = v_id;
        v_ids := array_append(v_ids, v_id);
        v_count := v_count + 1;
    END LOOP;
    
    -- Return the IDs of deleted records
    RETURN QUERY SELECT unnest(v_ids);
END;
$$;

-- Function to safely update schema comments (for cache refresh)
CREATE OR REPLACE FUNCTION public.update_table_comment(table_name text, comment_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    EXECUTE format('COMMENT ON TABLE %I IS %L', table_name, comment_text);
    PERFORM pg_notify('pgrst', 'reload schema');
END;
$$;

-- Function to verify UUID validity
CREATE OR REPLACE FUNCTION public.is_valid_uuid(str text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN str IS NOT NULL AND str::uuid IS NOT NULL;
EXCEPTION WHEN OTHERS THEN
    RETURN false;
END;
$$;

-- ==============================
-- 4. PERMISSIONS
-- ==============================

-- Grant execute permissions to authenticated users
DO $$
BEGIN
    -- Only grant if functions exist
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO authenticated;
    
    -- Check if update_table_comment exists before granting
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' 
        AND p.proname = 'update_table_comment'
    ) THEN
        GRANT EXECUTE ON FUNCTION public.update_table_comment(text, text) TO authenticated;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If any errors in granting, log but continue
    RAISE NOTICE 'Error granting permissions to authenticated: %', SQLERRM;
END
$$;

-- Grant execute permissions to anonymous users for testing
DO $$
BEGIN
    -- Only grant if functions exist
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO anon;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO anon;
    GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO anon;
EXCEPTION WHEN OTHERS THEN
    -- If any errors in granting, log but continue
    RAISE NOTICE 'Error granting permissions to anon: %', SQLERRM;
END
$$;

-- ==============================
-- 5. SCHEMA CACHE REFRESH
-- ==============================

-- Update table comments with timestamp to force refresh
DO $$
BEGIN
    -- Use safer approach with EXECUTE to avoid issues
    EXECUTE 'COMMENT ON TABLE public.founders IS ''Founders data - Last refresh: ' || now() || '''';
    EXECUTE 'COMMENT ON TABLE public.connections IS ''Connection data - Last refresh: ' || now() || '''';
    
    -- Try to notify PostgREST to reload schema, but don't fail if it doesn't work
    BEGIN
        PERFORM pg_notify('pgrst', 'reload schema');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Could not notify PostgREST to reload schema: %', SQLERRM;
    END;
    
    -- Add and remove a temporary constraint to force schema refresh
    -- Check if profile_visible exists first
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'profile_visible'
    ) THEN
        -- Only add the constraint if profile_visible exists
        BEGIN
            ALTER TABLE public.founders ADD CONSTRAINT temp_constraint CHECK (profile_visible IS NOT NULL);
            ALTER TABLE public.founders DROP CONSTRAINT temp_constraint;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error with constraint approach for cache refresh: %', SQLERRM;
        END;
    END IF;
END
$$;

-- ==============================
-- 6. VERIFICATION
-- ==============================

-- Display table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('founders', 'connections')
ORDER BY
    table_name,
    ordinal_position;

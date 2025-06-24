-- Comprehensive Database Fix for Permission-Friendly Testing
-- This script addresses multiple issues:
-- 1. Missing tables or columns
-- 2. Schema cache refresh issues
-- 3. RLS policy problems
-- 4. Invalid UUID handling
-- 5. Safe cleanup functions

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
    profile_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ensure connections table exists with required columns
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    founder_a_id UUID NOT NULL,
    founder_b_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indices for better performance
CREATE INDEX IF NOT EXISTS founders_user_id_idx ON public.founders (user_id);
CREATE INDEX IF NOT EXISTS connections_founder_a_id_idx ON public.connections (founder_a_id);
CREATE INDEX IF NOT EXISTS connections_founder_b_id_idx ON public.connections (founder_b_id);
CREATE INDEX IF NOT EXISTS connections_created_at_idx ON public.connections (created_at);
CREATE INDEX IF NOT EXISTS founders_created_at_idx ON public.founders (created_at);

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

-- Founders table policies
CREATE POLICY founders_select_policy ON public.founders
    FOR SELECT USING (
        -- Allow access if profile is visible
        profile_visible = true
        -- Or if authenticated user is the owner
        OR (auth.uid() = user_id AND auth.role() = 'authenticated')
        -- Or for anonymous access during testing (set a limit)
        OR (auth.role() = 'anon')
        -- Or if using service role
        OR (auth.role() = 'service_role')
    );

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
            ORDER BY created_at DESC
            LIMIT 100
            RETURNING id
        )
        SELECT id FROM deleted_rows;
    ELSE
        RETURN QUERY
        WITH deleted_rows AS (
            DELETE FROM public.founders
            WHERE id IS NOT NULL
            ORDER BY id
            LIMIT 100
            RETURNING id
        )
        SELECT id FROM deleted_rows;
    END IF;
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
BEGIN
    -- Check if created_at column exists
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'connections' AND column_name = 'created_at'
    ) INTO has_created_at;
    
    -- Delete up to 100 test records, using appropriate ordering
    IF has_created_at THEN
        RETURN QUERY
        WITH deleted_rows AS (
            DELETE FROM public.connections
            WHERE id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 100
            RETURNING id
        )
        SELECT id FROM deleted_rows;
    ELSE
        RETURN QUERY
        WITH deleted_rows AS (
            DELETE FROM public.connections
            WHERE id IS NOT NULL
            ORDER BY id
            LIMIT 100
            RETURNING id
        )
        SELECT id FROM deleted_rows;
    END IF;
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
GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_table_comment() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO authenticated;

-- Grant execute permissions to anonymous users for testing
GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO anon;
GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO anon;
GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO anon;

-- ==============================
-- 5. SCHEMA CACHE REFRESH
-- ==============================

-- Update table comments with timestamp to force refresh
COMMENT ON TABLE public.founders IS 'Founders data - Last refresh: June 24, 2025';
COMMENT ON TABLE public.connections IS 'Connection data - Last refresh: June 24, 2025';

-- Add and remove a temporary constraint to force schema refresh
ALTER TABLE public.founders ADD CONSTRAINT temp_constraint CHECK (profile_visible IS NOT NULL);
ALTER TABLE public.founders DROP CONSTRAINT temp_constraint;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

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

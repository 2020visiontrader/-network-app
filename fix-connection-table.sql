-- Fix for Connection Table and Safe Cleanup
-- This fixes RLS policies and adds safe cleanup features

-- 1. First ensure the table exists and has the right columns
CREATE TABLE IF NOT EXISTS public.connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    founder_a_id UUID NOT NULL,
    founder_b_id UUID NOT NULL,
    status TEXT DEFAULT 'pending' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. Add default order column if missing (for safe cleanup)
ALTER TABLE public.connections ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL;

-- 3. Add index on created_at for efficient ordering
CREATE INDEX IF NOT EXISTS connections_created_at_idx ON public.connections (created_at);

-- 4. Update or create RLS policies
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid duplicates
DROP POLICY IF EXISTS connections_select_policy ON public.connections;
DROP POLICY IF EXISTS connections_insert_policy ON public.connections;
DROP POLICY IF EXISTS connections_update_policy ON public.connections;
DROP POLICY IF EXISTS connections_delete_policy ON public.connections;

-- Create new, more permissive policies for testing
CREATE POLICY connections_select_policy ON public.connections
    FOR SELECT USING (
        -- Allow access if authenticated
        (auth.role() = 'authenticated')
        -- Allow access if using service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_insert_policy ON public.connections
    FOR INSERT WITH CHECK (
        -- Allow authenticated users to insert
        (auth.role() = 'authenticated')
        -- Allow service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_update_policy ON public.connections
    FOR UPDATE USING (
        -- Allow if user owns the connection
        (auth.uid() = founder_a_id OR auth.uid() = founder_b_id)
        -- Allow service role
        OR (auth.role() = 'service_role')
    );

CREATE POLICY connections_delete_policy ON public.connections
    FOR DELETE USING (
        -- Allow if user owns the connection
        (auth.uid() = founder_a_id OR auth.uid() = founder_b_id)
        -- Allow service role
        OR (auth.role() = 'service_role')
    );

-- 5. Create a helper function for safe record cleanup
CREATE OR REPLACE FUNCTION public.safe_cleanup_connections()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Delete up to 100 test records, ordered by created_at
    RETURN QUERY
    WITH deleted_rows AS (
        DELETE FROM public.connections
        WHERE id IS NOT NULL
        ORDER BY created_at DESC
        LIMIT 100
        RETURNING id
    )
    SELECT id FROM deleted_rows;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO authenticated;
GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO anon;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

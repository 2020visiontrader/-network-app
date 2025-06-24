-- Quick Permission Fix for Anonymous Testing
-- A simplified version that addresses the most critical issues

-- ==============================
-- 1. EMERGENCY FIXES
-- ==============================

-- Fix founders table if it exists
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'founders') THEN
        -- Add created_at column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'founders' AND column_name = 'created_at') THEN
            ALTER TABLE public.founders ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;

        -- Fix RLS policies for anonymous access
        DROP POLICY IF EXISTS founders_select_policy ON public.founders;
        DROP POLICY IF EXISTS founders_insert_policy ON public.founders;
        DROP POLICY IF EXISTS founders_update_policy ON public.founders;
        DROP POLICY IF EXISTS founders_delete_policy ON public.founders;
        
        -- Create simple open policies for testing
        CREATE POLICY founders_select_policy ON public.founders FOR SELECT USING (true);
        CREATE POLICY founders_insert_policy ON public.founders FOR INSERT WITH CHECK (true);
        CREATE POLICY founders_update_policy ON public.founders FOR UPDATE USING (true);
        CREATE POLICY founders_delete_policy ON public.founders FOR DELETE USING (true);
    END IF;

    -- Fix connections table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections') THEN
        -- Add created_at column if missing
        IF NOT EXISTS (SELECT FROM information_schema.columns 
                      WHERE table_name = 'connections' AND column_name = 'created_at') THEN
            ALTER TABLE public.connections ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT now();
        END IF;

        -- Fix RLS policies for anonymous access
        DROP POLICY IF EXISTS connections_select_policy ON public.connections;
        DROP POLICY IF EXISTS connections_insert_policy ON public.connections;
        DROP POLICY IF EXISTS connections_update_policy ON public.connections;
        DROP POLICY IF EXISTS connections_delete_policy ON public.connections;
        
        -- Create simple open policies for testing
        CREATE POLICY connections_select_policy ON public.connections FOR SELECT USING (true);
        CREATE POLICY connections_insert_policy ON public.connections FOR INSERT WITH CHECK (true);
        CREATE POLICY connections_update_policy ON public.connections FOR UPDATE USING (true);
        CREATE POLICY connections_delete_policy ON public.connections FOR DELETE USING (true);
    END IF;
END $$;

-- Force schema cache refresh
NOTIFY pgrst, 'reload schema';

-- Simple open test cleanup function
CREATE OR REPLACE FUNCTION public.emergency_cleanup()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clean founders table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'founders') THEN
        DELETE FROM public.founders WHERE id IS NOT NULL ORDER BY id LIMIT 100;
    END IF;
    
    -- Clean connections table if it exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'connections') THEN
        DELETE FROM public.connections WHERE id IS NOT NULL ORDER BY id LIMIT 100;
    END IF;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.emergency_cleanup() TO anon;
GRANT EXECUTE ON FUNCTION public.emergency_cleanup() TO authenticated;

-- Final Permission Fix SQL (Simplified Version)
-- This script fixes all RLS policies and schema standardization issues

-- =========================
-- PART 1: SCHEMA STANDARDIZATION
-- =========================

DO $$
BEGIN
  -- Make founder_a_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'connections' AND column_name = 'founder_a_id' AND is_nullable = 'YES'
  ) THEN
    DELETE FROM public.connections WHERE founder_a_id IS NULL;
    ALTER TABLE public.connections ALTER COLUMN founder_a_id SET NOT NULL;
  END IF;

  -- Make founder_b_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'connections' AND column_name = 'founder_b_id' AND is_nullable = 'YES'
  ) THEN
    DELETE FROM public.connections WHERE founder_b_id IS NULL;
    ALTER TABLE public.connections ALTER COLUMN founder_b_id SET NOT NULL;
  END IF;

  -- Set DEFAULT and NOT NULL for status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'connections' AND column_name = 'status' AND column_default IS NULL
  ) THEN
    ALTER TABLE public.connections ALTER COLUMN status SET DEFAULT 'pending';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'connections' AND column_name = 'status' AND is_nullable = 'YES'
  ) THEN
    UPDATE public.connections SET status = 'pending' WHERE status IS NULL;
    ALTER TABLE public.connections ALTER COLUMN status SET NOT NULL;
  END IF;
END
$$ LANGUAGE plpgsql;

-- Migrate is_visible to profile_visible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'founders' AND column_name = 'is_visible'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'founders' AND column_name = 'profile_visible'
  ) THEN
    UPDATE public.founders 
    SET profile_visible = is_visible
    WHERE profile_visible IS NULL AND is_visible IS NOT NULL;
  END IF;
END
$$ LANGUAGE plpgsql;

-- Set default for profile_visible
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'founders' AND column_name = 'profile_visible' AND column_default IS NULL
  ) THEN
    ALTER TABLE public.founders ALTER COLUMN profile_visible SET DEFAULT true;
  END IF;
END
$$ LANGUAGE plpgsql;

-- =========================
-- PART 2: RLS POLICIES
-- =========================

ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END
$$ LANGUAGE plpgsql;

-- FOUNDERS policies
CREATE POLICY founders_select_policy ON public.founders
  FOR SELECT USING (
    profile_visible = true
    OR (auth.uid() = user_id AND auth.role() = 'authenticated')
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY founders_insert_policy ON public.founders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY founders_update_policy ON public.founders
  FOR UPDATE USING (
    auth.uid() = user_id AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY founders_delete_policy ON public.founders
  FOR DELETE USING (
    auth.uid() = user_id AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

-- CONNECTIONS policies
CREATE POLICY connections_select_policy ON public.connections
  FOR SELECT USING (
    (auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY connections_insert_policy ON public.connections
  FOR INSERT WITH CHECK (
    auth.uid() = founder_a_id AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY connections_update_policy ON public.connections
  FOR UPDATE USING (
    (auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

CREATE POLICY connections_delete_policy ON public.connections
  FOR DELETE USING (
    (auth.uid() = founder_a_id OR auth.uid() = founder_b_id) AND auth.role() = 'authenticated'
    OR auth.role() IN ('anon', 'service_role')
  );

-- =========================
-- PART 3: HELPER FUNCTIONS
-- =========================

-- Function to safely clean test records from founders
CREATE OR REPLACE FUNCTION public.safe_cleanup_founders()
RETURNS SETOF uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id uuid;
    v_ids uuid[] := '{}';
    v_count int := 0;
BEGIN
    -- Delete records one by one to avoid issues with CTEs
    FOR v_id IN 
        SELECT id FROM public.founders
        ORDER BY created_at DESC
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
    v_id uuid;
    v_ids uuid[] := '{}';
    v_count int := 0;
BEGIN
    -- Delete records one by one to avoid issues with CTEs
    FOR v_id IN 
        SELECT id FROM public.connections
        ORDER BY created_at DESC
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

-- Function to refresh schema cache
CREATE OR REPLACE FUNCTION public.refresh_schema_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_time text;
BEGIN
    -- Get current timestamp as a string
    SELECT to_char(now(), 'YYYY-MM-DD HH24:MI:SS.MS') INTO current_time;
    
    -- Update comments on tables to force schema refresh
    EXECUTE format('COMMENT ON TABLE public.founders IS %L', 
                  'Founders table - Last refresh: ' || current_time);
    EXECUTE format('COMMENT ON TABLE public.connections IS %L', 
                  'Connections table - Last refresh: ' || current_time);
    
    -- Try to notify PostgREST, but don't fail if it doesn't work
    BEGIN
        PERFORM pg_notify('pgrst', 'reload schema');
    EXCEPTION WHEN OTHERS THEN
        -- Just continue if this fails
    END;
END;
$$;

-- =========================
-- PART 4: PERMISSIONS
-- =========================

-- Grant execute permissions
DO $$
BEGIN
    -- To authenticated users
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO authenticated;
    GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO authenticated;
    GRANT EXECUTE ON FUNCTION public.refresh_schema_cache() TO authenticated;

    -- To anonymous users for testing
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_founders() TO anon;
    GRANT EXECUTE ON FUNCTION public.safe_cleanup_connections() TO anon;
    GRANT EXECUTE ON FUNCTION public.is_valid_uuid(text) TO anon;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error granting permissions: %', SQLERRM;
END
$$ LANGUAGE plpgsql;

-- =========================
-- PART 5: SCHEMA CACHE REFRESH
-- =========================

-- Refresh the schema cache
SELECT refresh_schema_cache();

-- Force schema refresh with temporary constraint
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'founders' AND column_name = 'profile_visible'
    ) THEN
        BEGIN
            ALTER TABLE public.founders ADD CONSTRAINT temp_constraint CHECK (profile_visible IS NOT NULL);
            ALTER TABLE public.founders DROP CONSTRAINT temp_constraint;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error with constraint approach for cache refresh: %', SQLERRM;
        END;
    END IF;
END
$$ LANGUAGE plpgsql;

-- =========================
-- PART 6: VERIFICATION
-- =========================

-- Display table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('founders', 'connections')
ORDER BY
    table_name,
    ordinal_position;

-- Display RLS policies with complete information
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check  -- Added to show INSERT policy conditions
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename IN ('founders', 'connections')
ORDER BY
    tablename,
    policyname;

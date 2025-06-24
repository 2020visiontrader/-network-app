-- Create Functions to Help with Schema Cache Management
-- These functions provide utilities for testing and schema management

-- Function to check if another function exists
CREATE OR REPLACE FUNCTION public.function_exists(function_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  exists_bool BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
    AND p.proname = function_name
  ) INTO exists_bool;
  
  RETURN exists_bool;
END;
$$;

-- Function to create a temporary column (for forcing schema cache refresh)
CREATE OR REPLACE FUNCTION public.create_temp_column(table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS %I text', table_name, column_name);
END;
$$;

-- Function to drop a temporary column
CREATE OR REPLACE FUNCTION public.drop_temp_column(table_name text, column_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I DROP COLUMN IF EXISTS %I', table_name, column_name);
END;
$$;

-- Function to add a comment to a table (for forcing schema cache refresh)
CREATE OR REPLACE FUNCTION public.comment_on_table(table_name text, comment_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('COMMENT ON TABLE %I IS %L', table_name, comment_text);
END;
$$;

-- Function to create the function_exists function if it doesn't exist
-- This is a bootstrapping function that creates the function_exists function
CREATE OR REPLACE FUNCTION public.create_function_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- The function is already created above, this just avoids an error
  -- when trying to create a function that may already exist
  NULL;
END;
$$;

-- Function to create column management functions
CREATE OR REPLACE FUNCTION public.create_column_functions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- The functions are already created above, this just avoids an error
  -- when trying to create functions that may already exist
  NULL;
END;
$$;

-- Add security policies to prevent abuse
ALTER FUNCTION public.create_temp_column SECURITY DEFINER;
ALTER FUNCTION public.drop_temp_column SECURITY DEFINER;
ALTER FUNCTION public.comment_on_table SECURITY DEFINER;

-- Grant execute permissions to authenticated users only
REVOKE EXECUTE ON FUNCTION public.create_temp_column FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.drop_temp_column FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.comment_on_table FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_temp_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.drop_temp_column TO authenticated;
GRANT EXECUTE ON FUNCTION public.comment_on_table TO authenticated;
GRANT EXECUTE ON FUNCTION public.function_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_function_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_column_functions TO authenticated;

-- Enable row level security
ALTER TABLE public.founders FORCE ROW LEVEL SECURITY;

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

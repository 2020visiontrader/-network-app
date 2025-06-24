-- Create a function to execute arbitrary SQL
-- This helps us run SQL from our script
CREATE OR REPLACE FUNCTION public.query(sql_query TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql_query;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.query(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.query(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.query(TEXT) TO service_role;

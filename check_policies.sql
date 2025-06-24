-- Function to check RLS policies for a given table
-- Usage: SELECT * FROM check_policies('founders');
CREATE OR REPLACE FUNCTION public.check_policies(table_name text)
RETURNS TABLE (
  policyname text,
  tablename text,
  operation text,
  roles text[],
  qual text,
  with_check text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.policyname,
    p.tablename,
    p.operation,
    p.roles,
    p.qual::text,
    p.with_check::text
  FROM
    pg_policies p
  WHERE
    p.tablename = table_name
    AND p.schemaname = 'public';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution privileges to authenticated and anon roles
GRANT EXECUTE ON FUNCTION public.check_policies(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_policies(text) TO anon;

-- Comment on function
COMMENT ON FUNCTION public.check_policies(text) IS 'Retrieves all RLS policies for the specified table';

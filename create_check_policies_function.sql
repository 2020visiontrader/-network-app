-- Function to check RLS policies for a specific table
CREATE OR REPLACE FUNCTION check_policies(table_name text)
RETURNS TABLE(policyname text, tablename text, schemaname text, operation text, cmd text, qual text, with_check text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.policyname,
    p.tablename,
    p.schemaname,
    p.operation,
    p.cmd,
    p.qual::text,
    p.with_check::text
  FROM
    pg_policies p
  WHERE
    p.tablename = check_policies.table_name
    AND p.schemaname = 'public';
END;
$$;

-- Grant execute permission to authenticated and anon users
GRANT EXECUTE ON FUNCTION check_policies(text) TO authenticated, anon;

-- Create a function to get current JWT claims
-- This will help us debug RLS issues
CREATE OR REPLACE FUNCTION get_my_claims()
RETURNS jsonb
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    jsonb_build_object(
      'role', current_setting('request.jwt.claims', true)::json->>'role',
      'sub', current_setting('request.jwt.claims', true)::json->>'sub',
      'email', current_setting('request.jwt.claims', true)::json->>'email',
      'is_anon', pg_has_role('anon', 'authenticated', 'member'),
      'is_authenticated', pg_has_role('authenticated', 'authenticated', 'member')
    );
$$;

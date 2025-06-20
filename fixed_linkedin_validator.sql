-- Create the missing is_valid_linkedin_url function

-- First check if the function already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_proc 
    WHERE proname = 'is_valid_linkedin_url' 
    AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  ) THEN
    -- Create the function if it doesn't exist
    EXECUTE $create_func$
      CREATE OR REPLACE FUNCTION public.is_valid_linkedin_url(url text) 
      RETURNS boolean AS $$
      BEGIN
        RETURN url ~ '^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-\_]+\/?$';
      END;
      $$ LANGUAGE plpgsql IMMUTABLE;
    $create_func$;
  END IF;
END
$$;

-- Test the function
SELECT public.is_valid_linkedin_url('https://www.linkedin.com/in/johndoe/');  -- Should return true
SELECT public.is_valid_linkedin_url('https://linkedin.com/in/jane-doe');      -- Should return true
SELECT public.is_valid_linkedin_url('http://www.linkedin.com/in/user_name');  -- Should return true
SELECT public.is_valid_linkedin_url('https://facebook.com');                  -- Should return false
SELECT public.is_valid_linkedin_url('not-a-url');                             -- Should return false

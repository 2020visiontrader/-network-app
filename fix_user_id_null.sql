-- Fix the user_id NULL issue by recreating the handle_new_user function

-- First drop the existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then drop the existing function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Create the corrected function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Make sure we insert both id and user_id as the same value (auth.users.id)
  INSERT INTO public.founders (id, user_id, email)
  VALUES (NEW.id, NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Verify the function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Run this to see any existing records that might have NULL user_id
SELECT id, user_id, email FROM founders WHERE user_id IS NULL;

-- Cleanup script for any existing records (if needed)
-- UPDATE public.founders SET user_id = id WHERE user_id IS NULL;

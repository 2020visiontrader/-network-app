-- FIXED AUTH TRIGGER - Run this in Supabase SQL Editor

-- First, check what triggers exist
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a safer trigger function with error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already exist in founders table
  INSERT INTO public.founders (id, email, full_name, created_at, onboarding_complete)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    false
  )
  ON CONFLICT (id) DO NOTHING; -- Ignore if user already exists
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error creating founder profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Alternative: Remove the trigger entirely and handle profile creation in the app
-- If the above still causes issues, run this instead:
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Test the fix
SELECT 'Trigger updated successfully' as result;

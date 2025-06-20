-- REMOVE PROBLEMATIC TRIGGER - Run this in Supabase SQL Editor

-- Remove the trigger that's causing auth signup to fail
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Verify trigger is removed
SELECT trigger_name, event_manipulation 
FROM information_schema.triggers 
WHERE event_object_table = 'users';

-- The result should be empty (no triggers)

SELECT 'Auth trigger removed - profile creation will be handled in app' as result;

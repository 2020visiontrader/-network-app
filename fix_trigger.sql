-- REMOVE PROBLEMATIC TRIGGER - Run this in Supabase SQL Editor

-- Drop the trigger that's causing the signup error
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- We'll handle profile creation in the app instead

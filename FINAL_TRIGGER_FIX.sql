-- FINAL FIX - Remove the problematic trigger completely
-- Run this in Supabase SQL Editor

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- The app will handle profile creation manually

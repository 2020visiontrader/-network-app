-- MISSING COLUMNS FIX - Run this in Supabase SQL Editor

-- Add missing columns to founders table
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS tags TEXT;

-- Update existing records with default values
UPDATE founders SET onboarding_complete = false WHERE onboarding_complete IS NULL;
UPDATE founders SET is_visible = true WHERE is_visible IS NULL;

-- Create auth trigger for automatic profile creation
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.founders (id, email, full_name, created_at, onboarding_complete)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NOW(),
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

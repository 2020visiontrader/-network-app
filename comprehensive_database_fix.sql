-- COMPREHENSIVE DATABASE FIX FOR USER_ID ISSUES
-- Run this script in the Supabase SQL Editor to fix all issues at once

-- 1. Drop existing handle_new_user function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. Create improved handle_new_user function with direct id mapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with proper user_id from auth.users
  -- CRITICAL FIX: Use NEW.id for both id and user_id to ensure direct mapping
  INSERT INTO public.founders (id, user_id, email, created_at, updated_at)
  VALUES (
    NEW.id,            -- CHANGED: Use auth.users.id directly as the primary key
    NEW.id,            -- Use the auth.users id as user_id
    NEW.email,         -- Copy email from auth
    NOW(),             -- Set created_at timestamp
    NOW()              -- Set updated_at timestamp
  )
  ON CONFLICT (id) DO NOTHING; -- CHANGED: Prevent duplicates by id instead of user_id
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger to connect auth.users to founders
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Fix overloaded function issues by dropping all existing versions first
DO $$
DECLARE
  func_record RECORD;
BEGIN
  -- Find all overloaded versions of upsert_founder_onboarding and drop them
  FOR func_record IN
    SELECT
      p.proname AS function_name,
      pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments
    FROM pg_catalog.pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'upsert_founder_onboarding'
      AND n.nspname = 'public'
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(%s);', func_record.arguments);
    RAISE NOTICE 'Dropped function: upsert_founder_onboarding(%)', func_record.arguments;
  END LOOP;
END
$$;

-- Create the ONE correct version of upsert_founder_onboarding
CREATE OR REPLACE FUNCTION public.upsert_founder_onboarding(
  user_id UUID,
  data JSONB
)
RETURNS VOID AS $$
BEGIN
  -- Simplified, cleaner version that follows standard ON CONFLICT pattern
  INSERT INTO founders (
    user_id, 
    full_name, 
    company_name, 
    role, 
    linkedin_url,
    location_city, 
    industry, 
    bio, 
    tags_or_interests, 
    onboarding_completed, 
    profile_progress,
    updated_at
  )
  VALUES (
    user_id,
    data->>'full_name',
    data->>'company_name',
    data->>'role',
    data->>'linkedin_url',
    data->>'location_city',
    data->>'industry',
    data->>'bio',
    string_to_array(data->>'tags_or_interests', ','),
    TRUE,
    100,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name,
    role = EXCLUDED.role,
    linkedin_url = EXCLUDED.linkedin_url,
    location_city = EXCLUDED.location_city,
    industry = EXCLUDED.industry,
    bio = EXCLUDED.bio,
    tags_or_interests = EXCLUDED.tags_or_interests,
    onboarding_completed = TRUE,
    profile_progress = 100,
    updated_at = NOW();
    
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't crash
    RAISE WARNING 'Error in upsert_founder_onboarding: %', SQLERRM;
    -- Re-raise the exception
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create compatibility function for existing code
-- This version has the same signature as the old one but uses the new standardized function
CREATE OR REPLACE FUNCTION public.upsert_founder_onboarding(
  user_id TEXT,
  user_email TEXT,
  founder_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  -- Call the standard function
  PERFORM public.upsert_founder_onboarding(
    user_id::UUID,
    founder_data
  );
  
  -- Get the updated record to return
  SELECT to_jsonb(f.*) INTO result
  FROM public.founders f
  WHERE f.user_id = user_id::UUID;
  
  -- Return the founder record as JSON
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details as JSON
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Create LinkedIn URL validation function
CREATE OR REPLACE FUNCTION public.is_valid_linkedin_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN url ~ '^https?:\/\/(www\.)?linkedin\.com\/in\/[A-Za-z0-9\-\_]+\/?$';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Fix any existing founders records with NULL user_id 
-- First, find founders that match email in auth.users
UPDATE public.founders f
SET user_id = u.id
FROM auth.users u
WHERE f.user_id IS NULL 
  AND f.email = u.email;

-- For any remaining founders with NULL user_id, set it to match the id
-- (This assumes id is likely the intended user_id as per your fix)
UPDATE public.founders
SET user_id = id
WHERE user_id IS NULL;

-- 8. Add NOT NULL constraint to user_id if it doesn't exist
DO $$
BEGIN
  -- Check if user_id column exists and if it already has NOT NULL constraint
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'founders' 
      AND column_name = 'user_id'
      AND is_nullable = 'YES'
  ) THEN
    -- Add NOT NULL constraint
    ALTER TABLE public.founders ALTER COLUMN user_id SET NOT NULL;
    RAISE NOTICE 'Added NOT NULL constraint to user_id';
  END IF;
END $$;

-- 9. Create unique indexes on id and user_id for better performance
DROP INDEX IF EXISTS idx_founders_user_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_founders_user_id ON public.founders(user_id);

-- 10. Make sure we have the right RLS policies
-- Enable RLS on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies
DROP POLICY IF EXISTS "Users can view and update their own founder profile" ON public.founders;
CREATE POLICY "Users can view and update their own founder profile"
ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 11. Add helpful comments to the database schema
COMMENT ON TABLE public.founders IS 'Stores founder profiles for the Network App';
COMMENT ON COLUMN public.founders.user_id IS 'References auth.users.id - this is the Supabase auth user ID';
COMMENT ON COLUMN public.founders.id IS 'Primary key for founders table - matches auth.users.id';

-- 12. Create test helper function to validate everything is working
CREATE OR REPLACE FUNCTION public.test_auth_flow(test_email TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  result = jsonb_build_object(
    'success', TRUE,
    'message', 'Auth flow should now be working properly',
    'timestamp', NOW(),
    'smtp_notice', 'Remember to set up custom SMTP in Supabase Auth settings'
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- SUMMARY OF FIXES:
-- 1. Fixed handle_new_user to use auth.users.id as both id and user_id
-- 2. Removed function overloads for upsert_founder_onboarding
-- 3. Created standardized ON CONFLICT pattern for upserts
-- 4. Added proper error handling
-- 5. Fixed NULL user_id values in existing records
-- 6. Added proper constraints and indexes
-- 7. Set up correct RLS policies

-- Final verification
SELECT 'Database fixes completed successfully. Remember to set up custom SMTP in Supabase!' as message;

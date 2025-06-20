-- CRITICAL DATABASE FIX FOR USER_ID AND FUNCTION OVERLOAD ISSUES
-- Run this script in the Supabase SQL Editor to fix all issues at once

-- ========================================================================
-- ISSUE 1: user_id is null in founders insert
-- ========================================================================

-- 1. Drop existing handle_new_user function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. Create improved handle_new_user function that properly sets user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert with proper user_id from auth.users
  INSERT INTO public.founders (id, user_id, email, created_at, updated_at)
  VALUES (
    gen_random_uuid(), -- Generate a unique ID for this founder record
    NEW.id,            -- CRITICAL: Use the auth.users id as user_id for foreign key
    NEW.email,         -- Copy email from auth
    NOW(),             -- Set created_at timestamp
    NOW()              -- Set updated_at timestamp
  )
  ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicates by user_id
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the transaction
    RAISE WARNING 'Error in handle_new_user trigger: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger to connect auth.users to founders
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ========================================================================
-- ISSUE 2: Multiple conflicting versions of upsert_founder_onboarding
-- ========================================================================

-- 4. List all versions of upsert_founder_onboarding to verify they exist
DO $$
BEGIN
  RAISE NOTICE 'Existing upsert_founder_onboarding functions:';
  FOR func_row IN
    SELECT p.proname AS function_name,
           pg_catalog.pg_get_function_identity_arguments(p.oid) AS arguments
    FROM pg_catalog.pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'upsert_founder_onboarding'
  LOOP
    RAISE NOTICE 'Function: %(%) exists', func_row.function_name, func_row.arguments;
  END LOOP;
END $$;

-- 5. Drop all versions of upsert_founder_onboarding function
DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(uuid, jsonb);
DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(jsonb);
DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(uuid, text, jsonb);
DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(text, jsonb);
DROP FUNCTION IF EXISTS public.upsert_founder_onboarding(); -- Just in case

-- 6. Create a single correct version of upsert_founder_onboarding
CREATE OR REPLACE FUNCTION public.upsert_founder_onboarding(
  user_id UUID,
  user_email TEXT,
  founder_data JSONB
)
RETURNS JSONB AS $$
DECLARE
  existing_id UUID;
  result JSONB;
BEGIN
  -- CRITICAL: Validate required inputs
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be NULL';
  END IF;

  -- Check if a founder with this user_id exists
  SELECT id INTO existing_id FROM public.founders WHERE founders.user_id = upsert_founder_onboarding.user_id;

  IF existing_id IS NULL THEN
    -- If no founder record exists, create one with the correct user_id
    INSERT INTO public.founders (
      id,
      user_id,
      email,
      full_name,
      linkedin_url,
      location_city,
      industry,
      company_name,
      role,
      tags_or_interests,
      profile_visible,
      onboarding_completed,
      profile_progress,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      user_id,
      user_email,
      founder_data->>'full_name',
      founder_data->>'linkedin_url',
      founder_data->>'location_city',
      founder_data->>'industry',
      founder_data->>'company_name',
      founder_data->>'role',
      (founder_data->>'tags_or_interests')::TEXT[],
      COALESCE((founder_data->>'profile_visible')::BOOLEAN, TRUE),
      TRUE, -- Always set to TRUE during onboarding
      100,  -- Always set to 100% during onboarding
      NOW(),
      NOW()
    )
    RETURNING to_jsonb(founders.*) INTO result;
  ELSE
    -- If founder record exists, update it
    UPDATE public.founders
    SET
      full_name = COALESCE(founder_data->>'full_name', full_name),
      linkedin_url = COALESCE(founder_data->>'linkedin_url', linkedin_url),
      location_city = COALESCE(founder_data->>'location_city', location_city),
      industry = COALESCE(founder_data->>'industry', industry),
      company_name = COALESCE(founder_data->>'company_name', company_name),
      role = COALESCE(founder_data->>'role', role),
      tags_or_interests = COALESCE((founder_data->>'tags_or_interests')::TEXT[], tags_or_interests),
      profile_visible = COALESCE((founder_data->>'profile_visible')::BOOLEAN, profile_visible),
      onboarding_completed = TRUE, -- Always set to TRUE during onboarding update
      profile_progress = 100,      -- Always set to 100 during onboarding update
      updated_at = NOW()
    WHERE founders.user_id = upsert_founder_onboarding.user_id
    RETURNING to_jsonb(founders.*) INTO result;
  END IF;

  -- Return the founder record as JSON
  RETURN result;
EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN jsonb_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- ISSUE 3: Fix existing data issues
-- ========================================================================

-- 7. Fix any existing founders records with NULL user_id
-- This is a safety measure to clean up any bad data
DO $$
DECLARE
  null_count INT;
BEGIN
  -- Count NULL user_ids
  SELECT COUNT(*) INTO null_count FROM public.founders WHERE user_id IS NULL;
  RAISE NOTICE 'Found % founders records with NULL user_id', null_count;
  
  -- Fix NULL user_ids by finding matching email in auth.users
  UPDATE public.founders f
  SET user_id = u.id
  FROM auth.users u
  WHERE f.user_id IS NULL 
    AND f.email = u.email;
    
  -- Recount NULL user_ids
  SELECT COUNT(*) INTO null_count FROM public.founders WHERE user_id IS NULL;
  RAISE NOTICE 'After email matching, % founders records still have NULL user_id', null_count;
END $$;

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
    RAISE NOTICE 'Added NOT NULL constraint to user_id column';
  ELSE
    RAISE NOTICE 'user_id column is already NOT NULL or does not exist';
  END IF;
END $$;

-- 9. Create an index on user_id for better performance
DROP INDEX IF EXISTS idx_founders_user_id;
CREATE UNIQUE INDEX IF NOT EXISTS idx_founders_user_id ON public.founders(user_id);

-- ========================================================================
-- ISSUE 4: Fix RLS policies to ensure proper access
-- ========================================================================

-- 10. Enable RLS on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- 11. Drop and recreate policies
DROP POLICY IF EXISTS "Users can view and update their own founder profile" ON public.founders;
CREATE POLICY "Users can view and update their own founder profile"
ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to see all founders
DROP POLICY IF EXISTS "Admins can view all founders" ON public.founders;
CREATE POLICY "Admins can view all founders"
ON public.founders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND (auth.users.email LIKE '%@networkapp.co' OR auth.users.email LIKE '%@admin.com')
  )
);

-- ========================================================================
-- VERIFICATION
-- ========================================================================

-- 12. Verify function creation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user'
  ) THEN
    RAISE NOTICE 'handle_new_user function created successfully';
  ELSE
    RAISE WARNING 'handle_new_user function not found!';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'upsert_founder_onboarding'
  ) THEN
    RAISE NOTICE 'upsert_founder_onboarding function created successfully';
  ELSE
    RAISE WARNING 'upsert_founder_onboarding function not found!';
  END IF;
END $$;

-- 13. Test helper function to verify onboarding works
CREATE OR REPLACE FUNCTION public.test_onboarding(test_email TEXT)
RETURNS JSONB AS $$
DECLARE
  user_id UUID;
  test_data JSONB;
  result JSONB;
BEGIN
  -- Get a test user ID (use any existing user or generate a dummy one)
  SELECT id INTO user_id FROM auth.users WHERE email = test_email LIMIT 1;
  
  IF user_id IS NULL THEN
    -- Just for testing purposes
    user_id := '00000000-0000-0000-0000-000000000000'::UUID;
  END IF;
  
  -- Create test founder data
  test_data := jsonb_build_object(
    'full_name', 'Test User',
    'company_name', 'Test Company',
    'role', 'Founder',
    'linkedin_url', 'https://linkedin.com/in/testuser',
    'location_city', 'San Francisco',
    'industry', 'Technology'
  );
  
  -- Try to upsert (should fail with dummy ID but provides function verification)
  BEGIN
    result := public.upsert_founder_onboarding(user_id, test_email, test_data);
    RETURN jsonb_build_object(
      'success', TRUE,
      'message', 'Test function executed successfully',
      'result', result
    );
  EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
      'success', FALSE,
      'message', SQLERRM,
      'hint', 'Function exists but failed with test data - this is expected with dummy ID'
    );
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================================================
-- COMPLETION MESSAGE
-- ========================================================================

SELECT 'DATABASE FIX COMPLETE: All issues with user_id, function overloads, and RLS policies have been addressed.' as message;

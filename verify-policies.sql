-- Complete RLS Policy Verification
-- Run this in the Supabase SQL Editor to verify your RLS policies

-- 1. Check both qual and with_check columns for all policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename IN ('founders', 'connections')
ORDER BY
    tablename,
    policyname;

-- 2. Specifically examine INSERT policies
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public'
    AND tablename IN ('founders', 'connections')
    AND cmd = 'INSERT'
ORDER BY
    tablename,
    policyname;

-- 3. Check schema properties
SELECT
    table_name,
    column_name,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('founders', 'connections')
    AND (
        (table_name = 'connections' AND column_name IN ('founder_a_id', 'founder_b_id', 'status'))
        OR (table_name = 'founders' AND column_name = 'profile_visible')
    )
ORDER BY
    table_name,
    column_name;

-- 4. Test INSERT policy for founders
-- This should fail if the user_id doesn't match auth.uid()
DO $$
DECLARE
    current_user_id uuid;
    different_user_id uuid := gen_random_uuid();
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Try to insert with current user's ID (should succeed)
    BEGIN
        INSERT INTO public.founders (id, user_id, profile_visible)
        VALUES (gen_random_uuid(), current_user_id, true);
        RAISE NOTICE 'INSERT with auth.uid() succeeded as expected';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INSERT with auth.uid() failed: %', SQLERRM;
    END;
    
    -- Try to insert with different user ID (should fail due to RLS)
    BEGIN
        INSERT INTO public.founders (id, user_id, profile_visible)
        VALUES (gen_random_uuid(), different_user_id, true);
        RAISE NOTICE 'WARNING: INSERT with different user_id succeeded when it should have failed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INSERT with different user_id failed as expected due to RLS policy';
    END;
END
$$ LANGUAGE plpgsql;

-- 5. Test INSERT policy for connections
-- This should fail if founder_a_id doesn't match auth.uid()
DO $$
DECLARE
    current_user_id uuid;
    different_user_id uuid := gen_random_uuid();
BEGIN
    -- Get current user ID
    SELECT auth.uid() INTO current_user_id;
    
    -- Try to insert with current user as founder_a_id (should succeed)
    BEGIN
        INSERT INTO public.connections (id, founder_a_id, founder_b_id, status)
        VALUES (gen_random_uuid(), current_user_id, different_user_id, 'pending');
        RAISE NOTICE 'INSERT with auth.uid() as founder_a_id succeeded as expected';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INSERT with auth.uid() as founder_a_id failed: %', SQLERRM;
    END;
    
    -- Try to insert with different user as founder_a_id (should fail due to RLS)
    BEGIN
        INSERT INTO public.connections (id, founder_a_id, founder_b_id, status)
        VALUES (gen_random_uuid(), different_user_id, current_user_id, 'pending');
        RAISE NOTICE 'WARNING: INSERT with different founder_a_id succeeded when it should have failed';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'INSERT with different founder_a_id failed as expected due to RLS policy';
    END;
END
$$ LANGUAGE plpgsql;

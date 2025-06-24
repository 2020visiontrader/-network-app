-- Manual Verification Queries
-- Run these in the Supabase SQL Editor to verify the fixes

-- 1. Check table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM
    information_schema.columns
WHERE
    table_schema = 'public'
    AND table_name IN ('founders', 'connections')
ORDER BY
    table_name,
    ordinal_position;

-- 2. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
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

-- 3. Check helper functions
SELECT 
    routine_name, 
    routine_type,
    data_type AS return_type,
    security_type
FROM 
    information_schema.routines
WHERE 
    routine_schema = 'public' 
    AND routine_name IN (
        'safe_cleanup_founders',
        'safe_cleanup_connections',
        'is_valid_uuid',
        'refresh_schema_cache'
    );

-- 4. Test data access with different roles (run in SQL Editor)
-- This will show what an anonymous user can see
SET LOCAL ROLE anon;

SELECT count(*) FROM founders;
SELECT count(*) FROM connections;

-- Reset role
RESET ROLE;

-- 5. Create test data for manual verification
-- Only run this if you need test data

-- Create test founders
INSERT INTO public.founders (
    id,
    user_id,
    name,
    email,
    profile_visible,
    bio,
    created_at
)
VALUES
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000001',
        'Test User 1',
        'test1@example.com',
        true,
        'Public profile for testing',
        now()
    ),
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000002',
        'Test User 2',
        'test2@example.com',
        false,
        'Private profile for testing',
        now()
    );

-- Create test connection
INSERT INTO public.connections (
    id,
    founder_a_id,
    founder_b_id,
    status,
    created_at
)
VALUES
    (
        gen_random_uuid(),
        '00000000-0000-0000-0000-000000000001',
        '00000000-0000-0000-0000-000000000002',
        'pending',
        now()
    );

-- 6. Clean up test data (run this after testing)
DELETE FROM public.connections
WHERE 
    founder_a_id = '00000000-0000-0000-0000-000000000001'
    OR founder_b_id = '00000000-0000-0000-0000-000000000001'
    OR founder_a_id = '00000000-0000-0000-0000-000000000002'
    OR founder_b_id = '00000000-0000-0000-0000-000000000002';

DELETE FROM public.founders
WHERE 
    user_id = '00000000-0000-0000-0000-000000000001'
    OR user_id = '00000000-0000-0000-0000-000000000002';

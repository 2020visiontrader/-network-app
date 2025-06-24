-- Cleanup duplicate RLS policies on founders table
-- This script removes the duplicated "Can X own profile" policies while keeping the newer set

-- First, let's identify all duplicate policies
SELECT policyname FROM pg_policies WHERE tablename = 'founders';

-- Drop the duplicate "Can X" policies
DROP POLICY IF EXISTS "Can read own profile" ON founders;
DROP POLICY IF EXISTS "Can read public profiles" ON founders;
DROP POLICY IF EXISTS "Can update own profile" ON founders;
DROP POLICY IF EXISTS "Can insert own profile" ON founders;
DROP POLICY IF EXISTS "Can delete own profile" ON founders;

-- Verify remaining policies
SELECT
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
  tablename = 'founders'
ORDER BY
  policyname;

-- Output confirmation message
SELECT 'Duplicate RLS policies removed. The following policies remain:
1. deny_anon_access (RESTRICTIVE)
2. founders_select_own (PERMISSIVE)
3. founders_select_visible (PERMISSIVE)
4. founders_insert_own (PERMISSIVE)
5. founders_update_own (PERMISSIVE)
6. founders_delete_own (PERMISSIVE)
7. founders_restrict_update_others (RESTRICTIVE)
8. founders_restrict_delete_others (RESTRICTIVE)
';

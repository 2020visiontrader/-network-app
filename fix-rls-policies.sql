-- NETWORK FOUNDER APP - ENHANCED RLS POLICY FIX
-- Run this in your Supabase SQL Editor

-- First, ensure RLS is enabled on the founders table
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Remove ALL existing policies on the founders table
DROP POLICY IF EXISTS "Users can view own founder profile" ON founders;
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON founders;
DROP POLICY IF EXISTS "Can read own profile" ON founders;
DROP POLICY IF EXISTS "Can read public profiles" ON founders;
DROP POLICY IF EXISTS "Can update own profile" ON founders;
DROP POLICY IF EXISTS "Can insert own profile" ON founders;
DROP POLICY IF EXISTS "Can delete own profile" ON founders;
-- Also drop any other potentially conflicting policies
DROP POLICY IF EXISTS "Enable read access for all users" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable update for users based on email" ON founders;
DROP POLICY IF EXISTS "Enable delete for users based on email" ON founders;

-- Now create new, clear, restrictive policies

-- Policy 1: Authenticated users can read their own profiles
CREATE POLICY "Auth users can read own profiles"
  ON founders FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: Authenticated users can read other users' profiles that are visible
CREATE POLICY "Auth users can read visible profiles"
  ON founders FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = TRUE
  );

-- Policy 3: Authenticated users can update their own profiles
CREATE POLICY "Auth users can update own profiles"
  ON founders FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy 4: Authenticated users can insert their own profiles
CREATE POLICY "Auth users can insert own profiles"
  ON founders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 5: Authenticated users can delete their own profiles
CREATE POLICY "Auth users can delete own profiles"
  ON founders FOR DELETE
  USING (auth.uid() = user_id);

-- CRITICAL: Explicitly deny all anonymous access
-- This ensures anonymous users cannot access any data
CREATE POLICY "Deny anonymous access"
  ON founders FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Verify the policies have been set up correctly
SELECT
  tablename,
  policyname,
  cmd,
  roles,
  permissive
FROM
  pg_policies
WHERE
  tablename = 'founders'
ORDER BY
  policyname;

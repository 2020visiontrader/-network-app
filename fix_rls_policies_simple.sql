-- Additional RLS Policy Fix for Onboarding Flow
-- Run this in Supabase Dashboard > SQL Editor if onboarding still fails

-- First, let's see what policies exist
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'founders';

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Founders can view own profile" ON founders;
DROP POLICY IF EXISTS "Founders can update own profile" ON founders;
DROP POLICY IF EXISTS "Allow founder creation" ON founders;
DROP POLICY IF EXISTS "Verified founders can view others" ON founders;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON founders;
DROP POLICY IF EXISTS "Enable select for authenticated users based on user_id" ON founders;
DROP POLICY IF EXISTS "Enable update for authenticated users based on user_id" ON founders;

-- Create simple, working policies
-- 1. Allow authenticated users to insert their own record
CREATE POLICY "Enable insert for authenticated users" ON founders
    FOR INSERT 
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 2. Allow authenticated users to view their own record
CREATE POLICY "Enable select for own record" ON founders
    FOR SELECT 
    TO authenticated
    USING (auth.uid() = id);

-- 3. Allow authenticated users to update their own record
CREATE POLICY "Enable update for own record" ON founders
    FOR UPDATE 
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4. Allow verified users to view other verified users
CREATE POLICY "Enable select for verified users" ON founders
    FOR SELECT 
    TO authenticated
    USING (
        is_verified = true 
        AND is_active = true 
        AND profile_visible = true
    );

-- Verify policies are created
SELECT policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'founders';

-- Fix RLS Policies for founders table
-- This script ensures proper RLS policies are in place to prevent users from modifying other users' profiles

-- First, let's drop all existing policies for the founders table to start fresh
DROP POLICY IF EXISTS "Allow users to view their own records" ON "public"."founders";
DROP POLICY IF EXISTS "Allow users to view visible profiles" ON "public"."founders";
DROP POLICY IF EXISTS "Users can only update their own founder profile" ON "public"."founders";
DROP POLICY IF EXISTS "Enable all operations for users based on user_id" ON "public"."founders";
DROP POLICY IF EXISTS "Users can delete their own founder profile" ON "public"."founders";
DROP POLICY IF EXISTS "Users can create their own founder profile" ON "public"."founders";
DROP POLICY IF EXISTS "Allow users to access their own founder profile" ON "public"."founders";
DROP POLICY IF EXISTS "founders_self_access" ON "public"."founders";
DROP POLICY IF EXISTS "founders_visible_access" ON "public"."founders";
DROP POLICY IF EXISTS "founders_self_modification" ON "public"."founders";

-- Make sure RLS is enabled for the founders table
ALTER TABLE "public"."founders" ENABLE ROW LEVEL SECURITY;

-- Create policies with proper restrictions

-- 1. Allow users to view their own records (regardless of visibility)
CREATE POLICY "founders_self_access" ON "public"."founders"
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Allow users to view visible profiles (public discovery)
CREATE POLICY "founders_visible_access" ON "public"."founders"
FOR SELECT
USING (profile_visible = true);

-- 3. Allow users to create/update/delete ONLY their own records
CREATE POLICY "founders_self_modification" ON "public"."founders"
FOR ALL
USING (auth.uid() = user_id);

-- Output confirmation message
SELECT 'RLS policies updated for founders table. The following policies are now in place:
1. Users can view their own records
2. Users can view any record with profile_visible = true
3. Users can only create/update/delete their own records
';

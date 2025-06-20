-- FIX RLS POLICIES FOR AUTH - Run this in Supabase SQL Editor

-- Drop existing policies that might be too restrictive
DROP POLICY IF EXISTS "Users can read their own profile" ON founders;
DROP POLICY IF EXISTS "Users can update their own profile" ON founders;
DROP POLICY IF EXISTS "Allow user registration" ON founders;
DROP POLICY IF EXISTS "Public read access for discovery" ON founders;

-- Create new, properly configured RLS policies
CREATE POLICY "Enable insert for authenticated users only" ON founders
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for users based on user_id" ON founders
  FOR SELECT USING (auth.uid() = id OR is_visible = true);

CREATE POLICY "Enable update for users based on user_id" ON founders
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable delete for users based on user_id" ON founders
  FOR DELETE USING (auth.uid() = id);

-- Also create a policy to allow service role access for profile creation
CREATE POLICY "Allow service role full access" ON founders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Ensure RLS is enabled
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

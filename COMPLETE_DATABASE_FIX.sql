-- NETWORK FOUNDER APP - DATABASE SCHEMA FIX
-- Run this entire script in your Supabase SQL editor to fix user creation issues

-- ==========================================
-- 1. FIX FOUNDERS TABLE SCHEMA
-- ==========================================

-- Add missing columns to founders table
ALTER TABLE founders ADD COLUMN IF NOT EXISTS preferred_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT false;

-- Update existing founders to have default values
UPDATE founders SET onboarding_complete = false WHERE onboarding_complete IS NULL;
UPDATE founders SET is_visible = true WHERE is_visible IS NULL;

-- ==========================================
-- 2. CREATE TRIGGER FOR AUTO USER CREATION
-- ==========================================

-- Create function to handle new user signup
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==========================================
-- 3. FIX RLS POLICIES
-- ==========================================

-- Enable RLS on founders table
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own profile" ON founders;
DROP POLICY IF EXISTS "Users can update their own profile" ON founders;
DROP POLICY IF EXISTS "Allow user registration" ON founders;
DROP POLICY IF EXISTS "Public read access for discovery" ON founders;

-- Create new RLS policies
CREATE POLICY "Users can read their own profile" ON founders
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON founders
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow user registration" ON founders
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read access for discovery" ON founders
  FOR SELECT USING (is_visible = true);

-- ==========================================
-- 4. CREATE ADDITIONAL TABLES
-- ==========================================

-- Create enums
DO $$ BEGIN
  CREATE TYPE coffee_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status connection_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- Create coffee_chats table
CREATE TABLE IF NOT EXISTS coffee_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  requested_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  message TEXT,
  status coffee_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  event_date TIMESTAMP WITH TIME ZONE,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create event_attendees table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Create masterminds table
CREATE TABLE IF NOT EXISTS masterminds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 8,
  current_members INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mastermind_members table
CREATE TABLE IF NOT EXISTS mastermind_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mastermind_id UUID REFERENCES masterminds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mastermind_id, user_id)
);

-- ==========================================
-- 5. SET UP RLS FOR ALL TABLES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastermind_members ENABLE ROW LEVEL SECURITY;

-- Connections policies
CREATE POLICY "Users can manage their connections" ON connections
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = connected_user_id);

-- Coffee chats policies
CREATE POLICY "Users can manage their coffee chats" ON coffee_chats
  FOR ALL USING (auth.uid() = requester_id OR auth.uid() = requested_id);

-- Events policies
CREATE POLICY "Anyone can read events" ON events FOR SELECT USING (true);
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Users can update their events" ON events FOR UPDATE USING (auth.uid() = host_id);

-- Event attendees policies
CREATE POLICY "Anyone can read event attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users can manage their event attendance" ON event_attendees 
  FOR ALL USING (auth.uid() = user_id);

-- Masterminds policies
CREATE POLICY "Anyone can read masterminds" ON masterminds FOR SELECT USING (true);
CREATE POLICY "Users can create masterminds" ON masterminds FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Users can update their masterminds" ON masterminds FOR UPDATE USING (auth.uid() = host_id);

-- Mastermind members policies
CREATE POLICY "Anyone can read mastermind members" ON mastermind_members FOR SELECT USING (true);
CREATE POLICY "Users can manage their mastermind membership" ON mastermind_members 
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- 6. CREATE HELPER FUNCTIONS
-- ==========================================

-- Function to get user profile
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  preferred_name TEXT,
  role TEXT,
  company_name TEXT,
  location TEXT,
  bio TEXT,
  avatar_url TEXT,
  onboarding_complete BOOLEAN,
  is_visible BOOLEAN
) 
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT f.id, f.email, f.full_name, f.preferred_name, f.role, 
         f.company_name, f.location, f.bio, f.avatar_url, 
         f.onboarding_complete, f.is_visible
  FROM founders f
  WHERE f.id = user_id;
END;
$$;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check if everything is set up correctly
SELECT 'Schema fix completed!' as message;

-- Verify founders table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'founders' 
ORDER BY ordinal_position;

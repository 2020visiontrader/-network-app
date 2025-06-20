-- NETWORK FOUNDER APP MOBILE - COMPLETE DATABASE SCHEMA
-- Run this in your Supabase SQL editor

-- 1. Create custom types/enums
CREATE TYPE coffee_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
CREATE TYPE connection_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE availability_status AS ENUM ('available', 'busy', 'offline');

-- 2. Update founders table with all required fields for onboarding
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
ALTER TABLE founders ADD COLUMN IF NOT EXISTS availability_status availability_status DEFAULT 'available';

-- 3. Create connections table
CREATE TABLE IF NOT EXISTS connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  connected_user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status connection_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- 4. Create coffee_chats table
CREATE TABLE IF NOT EXISTS coffee_chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  requested_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  message TEXT,
  status coffee_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  capacity INTEGER,
  anonymous_post BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create event_rsvps table
CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- 7. Create masterminds table
CREATE TABLE IF NOT EXISTS masterminds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_members INTEGER,
  anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create mastermind_members table
CREATE TABLE IF NOT EXISTS mastermind_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mastermind_id UUID REFERENCES masterminds(id) ON DELETE CASCADE,
  user_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mastermind_id, user_id)
);

-- 9. Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Set up Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastermind_members ENABLE ROW LEVEL SECURITY;

-- Founders policies
CREATE POLICY "Users can view their own profile" ON founders
  FOR SELECT USING (true); -- Allow all to view for discovery

CREATE POLICY "Users can update their own profile" ON founders
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Connections policies
CREATE POLICY "Users can view their connections" ON connections
  FOR SELECT USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = connected_user_id::text
  );

CREATE POLICY "Users can create connection requests" ON connections
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their connection requests" ON connections
  FOR UPDATE USING (
    auth.uid()::text = user_id::text OR 
    auth.uid()::text = connected_user_id::text
  );

-- Coffee chats policies
CREATE POLICY "Users can view their coffee chats" ON coffee_chats
  FOR SELECT USING (
    auth.uid()::text = requester_id::text OR 
    auth.uid()::text = requested_id::text
  );

CREATE POLICY "Connected users can create coffee chat requests" ON coffee_chats
  FOR INSERT WITH CHECK (
    auth.uid()::text = requester_id::text AND
    EXISTS (
      SELECT 1 FROM connections 
      WHERE user_id = requester_id 
      AND connected_user_id = requested_id 
      AND status = 'accepted'
    )
  );

CREATE POLICY "Users can update their coffee chats" ON coffee_chats
  FOR UPDATE USING (
    auth.uid()::text = requester_id::text OR 
    auth.uid()::text = requested_id::text
  );

-- Events policies
CREATE POLICY "All users can view events" ON events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON events
  FOR INSERT WITH CHECK (auth.uid()::text = host_id::text);

CREATE POLICY "Event hosts can update their events" ON events
  FOR UPDATE USING (auth.uid()::text = host_id::text);

-- Event RSVPs policies
CREATE POLICY "Users can view event RSVPs" ON event_rsvps
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can RSVP to events" ON event_rsvps
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own RSVPs" ON event_rsvps
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- Masterminds policies
CREATE POLICY "All users can view masterminds" ON masterminds
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create masterminds" ON masterminds
  FOR INSERT WITH CHECK (auth.uid()::text = host_id::text);

CREATE POLICY "Mastermind hosts can update their masterminds" ON masterminds
  FOR UPDATE USING (auth.uid()::text = host_id::text);

-- Mastermind members policies
CREATE POLICY "Users can view mastermind members" ON mastermind_members
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can join masterminds" ON mastermind_members
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can leave masterminds" ON mastermind_members
  FOR DELETE USING (auth.uid()::text = user_id::text);

-- 11. Storage policies for avatars
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 12. Helper functions
CREATE OR REPLACE FUNCTION public.get_founder_count()
RETURNS INTEGER
LANGUAGE sql
AS $$
  SELECT count(*)::integer FROM founders;
$$;

CREATE OR REPLACE FUNCTION public.can_create_new_founder()
RETURNS BOOLEAN
LANGUAGE sql
AS $$
  SELECT true;
$$;

-- 13. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_connected_user_id ON connections(connected_user_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);

CREATE INDEX IF NOT EXISTS idx_coffee_chats_requester_id ON coffee_chats(requester_id);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_requested_id ON coffee_chats(requested_id);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_status ON coffee_chats(status);

CREATE INDEX IF NOT EXISTS idx_events_host_id ON events(host_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event_id ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user_id ON event_rsvps(user_id);

CREATE INDEX IF NOT EXISTS idx_masterminds_host_id ON masterminds(host_id);
CREATE INDEX IF NOT EXISTS idx_masterminds_time ON masterminds(time);

CREATE INDEX IF NOT EXISTS idx_mastermind_members_mastermind_id ON mastermind_members(mastermind_id);
CREATE INDEX IF NOT EXISTS idx_mastermind_members_user_id ON mastermind_members(user_id);

-- 14. Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_founders_updated_at BEFORE UPDATE ON founders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffee_chats_updated_at BEFORE UPDATE ON coffee_chats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masterminds_updated_at BEFORE UPDATE ON masterminds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Network Founder App mobile database schema created successfully!' as message;

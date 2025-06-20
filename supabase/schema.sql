-- Network App Database Schema
-- Run this in your Supabase SQL editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    referral_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    is_ambassador BOOLEAN DEFAULT FALSE,
    profile_progress INTEGER DEFAULT 0 CHECK (profile_progress >= 0 AND profile_progress <= 100),
    last_login TIMESTAMP WITH TIME ZONE,
    linkedin_url VARCHAR(500),
    tagline VARCHAR(200),
    niche VARCHAR(100),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table
CREATE TABLE IF NOT EXISTS connections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    initiator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
    type VARCHAR(20) DEFAULT 'direct' CHECK (type IN ('direct', 'intro', 'referral')),
    intro_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(initiator_id, receiver_id)
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    location VARCHAR(500),
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('workshop', 'mastermind', 'social', 'charity', 'launch')),
    visibility VARCHAR(20) DEFAULT 'connections' CHECK (visibility IN ('connections', 'open_invite')),
    max_attendees INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Coffee chats table
CREATE TABLE IF NOT EXISTS coffee_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled')),
    topic VARCHAR(255),
    location VARCHAR(255),
    agenda_bullets TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (user1_id != user2_id)
);

-- Masterminds table
CREATE TABLE IF NOT EXISTS masterminds (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    members UUID[] DEFAULT '{}',
    goal TEXT NOT NULL,
    cadence VARCHAR(20) NOT NULL CHECK (cadence IN ('weekly', 'biweekly', 'monthly')),
    max_members INTEGER DEFAULT 6 CHECK (max_members > 0),
    tags TEXT[] DEFAULT '{}',
    resource_links TEXT[] DEFAULT '{}',
    next_session TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('buy', 'sell', 'invest', 'co_founder')),
    sector VARCHAR(100) NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    description TEXT NOT NULL,
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    referrer_code VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'declined')),
    reason TEXT,
    linkedin_url VARCHAR(500),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    visibility BOOLEAN DEFAULT TRUE,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('alert', 'info', 'warning', 'maintenance')),
    show_banner BOOLEAN DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Usage metrics table
CREATE TABLE IF NOT EXISTS usage_metrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('coffee_chat', 'event_rsvp', 'mastermind_created', 'intro_made', 'event_hosted')),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_connections_initiator ON connections(initiator_id);
CREATE INDEX IF NOT EXISTS idx_connections_receiver ON connections(receiver_id);
CREATE INDEX IF NOT EXISTS idx_connections_status ON connections(status);
CREATE INDEX IF NOT EXISTS idx_events_creator ON events(creator_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_users ON coffee_chats(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_coffee_chats_time ON coffee_chats(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_masterminds_creator ON masterminds(creator_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_user ON opportunities(user_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_type ON opportunities(type);
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_announcements_visibility ON announcements(visibility);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_user ON usage_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_type ON usage_metrics(event_type);
CREATE INDEX IF NOT EXISTS idx_usage_metrics_timestamp ON usage_metrics(timestamp);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connections_updated_at BEFORE UPDATE ON connections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_coffee_chats_updated_at BEFORE UPDATE ON coffee_chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_masterminds_updated_at BEFORE UPDATE ON masterminds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_metrics ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can view connections they're part of
CREATE POLICY "Users can view own connections" ON connections FOR SELECT USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create connections" ON connections FOR INSERT WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Users can update own connections" ON connections FOR UPDATE USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- Users can view events they created or are invited to
CREATE POLICY "Users can view events" ON events FOR SELECT USING (true); -- Public events for now
CREATE POLICY "Users can create events" ON events FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own events" ON events FOR UPDATE USING (auth.uid() = creator_id);

-- Users can view coffee chats they're part of
CREATE POLICY "Users can view own coffee chats" ON coffee_chats FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create coffee chats" ON coffee_chats FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update own coffee chats" ON coffee_chats FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Users can view masterminds they created or are members of
CREATE POLICY "Users can view masterminds" ON masterminds FOR SELECT USING (auth.uid() = creator_id OR auth.uid() = ANY(members));
CREATE POLICY "Users can create masterminds" ON masterminds FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Users can update own masterminds" ON masterminds FOR UPDATE USING (auth.uid() = creator_id);

-- Users can view and manage their own opportunities
CREATE POLICY "Users can view opportunities" ON opportunities FOR SELECT USING (true); -- Public for discovery
CREATE POLICY "Users can create opportunities" ON opportunities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own opportunities" ON opportunities FOR UPDATE USING (auth.uid() = user_id);

-- Waitlist is publicly readable for admin, insertable by anyone
CREATE POLICY "Anyone can join waitlist" ON waitlist FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view waitlist" ON waitlist FOR SELECT USING (true); -- Will be restricted to admin users

-- Announcements are publicly readable
CREATE POLICY "Anyone can view announcements" ON announcements FOR SELECT USING (visibility = true);
CREATE POLICY "Admins can manage announcements" ON announcements FOR ALL USING (true); -- Will be restricted to admin users

-- Usage metrics are viewable by the user and admins
CREATE POLICY "Users can view own metrics" ON usage_metrics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create metrics" ON usage_metrics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert sample data (optional - remove in production)
-- This creates a sample admin user and some test data
INSERT INTO users (id, email, name, referral_code, status, is_ambassador, profile_progress) VALUES
('00000000-0000-0000-0000-000000000001', 'admin@network.app', 'Admin User', 'ADMIN001', 'active', true, 100)
ON CONFLICT (email) DO NOTHING;

-- Create a sample announcement
INSERT INTO announcements (title, text, type, created_by, visibility) VALUES
('Welcome to Network', 'Welcome to the Network platform! Start by completing your profile and scheduling your first coffee chat.', 'info', '00000000-0000-0000-0000-000000000001', true)
ON CONFLICT DO NOTHING;

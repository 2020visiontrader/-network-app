-- Combined migration file for Network App
-- This file should be executed in the Supabase Dashboard SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables in reverse order of dependencies
DROP TABLE IF EXISTS travel_checkins;
DROP TABLE IF EXISTS coffee_chats;
DROP TABLE IF EXISTS birthday_reminders;
DROP TABLE IF EXISTS introductions;
DROP TABLE IF EXISTS contacts;
DROP TABLE IF EXISTS users;

-- Create tables
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  role TEXT CHECK (role IN ('member', 'mentor', 'mentee', 'ambassador')) NOT NULL DEFAULT 'member',
  city TEXT,
  niche_tags TEXT[], -- e.g. ["founder", "wellness"]
  birthday DATE,
  profile_visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  contact_name TEXT NOT NULL,
  relationship_type TEXT,
  notes TEXT,
  last_interaction_date DATE,
  birthdate DATE,
  reminder_frequency TEXT CHECK (reminder_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduced_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_1_id UUID REFERENCES contacts(id),
  contact_2_id UUID REFERENCES contacts(id),
  intro_message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE birthday_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  reminder_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE
);

CREATE TABLE coffee_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  date_available DATE,
  public_visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE travel_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  checkin_date DATE DEFAULT CURRENT_DATE,
  visible_to_others BOOLEAN DEFAULT TRUE
);

-- Add indexes for better query performance
CREATE INDEX idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX idx_introductions_introduced_by_id ON introductions(introduced_by_id);
CREATE INDEX idx_birthday_reminders_contact_id ON birthday_reminders(contact_id);
CREATE INDEX idx_coffee_chats_user_id ON coffee_chats(user_id);
CREATE INDEX idx_coffee_chats_city ON coffee_chats(city);
CREATE INDEX idx_travel_checkins_user_id ON travel_checkins(user_id);
CREATE INDEX idx_travel_checkins_city ON travel_checkins(city);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_checkins ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Users table policies
CREATE POLICY "Users can view their own profile"
ON users FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON users FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view other users with visible profiles"
ON users FOR SELECT 
USING (profile_visibility = true OR auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Contacts table policies
CREATE POLICY "Users can manage their own contacts"
ON contacts FOR ALL 
USING (auth.uid() = owner_id);

-- Introductions table policies
CREATE POLICY "Users can manage their own introductions"
ON introductions FOR ALL 
USING (auth.uid() = introduced_by_id);

CREATE POLICY "Users can view introductions they are part of"
ON introductions FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM contacts c
    WHERE (c.id = contact_1_id OR c.id = contact_2_id)
    AND c.owner_id = auth.uid()
  )
);

-- Birthday reminders policies
CREATE POLICY "Users can manage their own birthday reminders"
ON birthday_reminders FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM contacts
    WHERE contacts.id = birthday_reminders.contact_id
    AND contacts.owner_id = auth.uid()
  )
);

-- Coffee chats policies
CREATE POLICY "Users can manage their own coffee chat posts"
ON coffee_chats FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public coffee chats"
ON coffee_chats FOR SELECT 
USING (public_visibility = true OR auth.uid() = user_id);

-- Travel check-ins policies
CREATE POLICY "Users can manage their own travel check-ins"
ON travel_checkins FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public travel check-ins"
ON travel_checkins FOR SELECT 
USING (visible_to_others = true OR auth.uid() = user_id);

-- Enable Realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE introductions;
ALTER PUBLICATION supabase_realtime ADD TABLE coffee_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE travel_checkins;

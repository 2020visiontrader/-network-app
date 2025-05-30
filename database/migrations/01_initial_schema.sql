-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- USERS
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

-- CONTACTS
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

-- INTRODUCTIONS
CREATE TABLE introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  introduced_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
  contact_1_id UUID REFERENCES contacts(id),
  contact_2_id UUID REFERENCES contacts(id),
  intro_message TEXT,
  status TEXT CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now()
);

-- BIRTHDAY REMINDERS
CREATE TABLE birthday_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  reminder_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE
);

-- COFFEE CHAT MEETUPS
CREATE TABLE coffee_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  date_available DATE,
  public_visibility BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

-- TRAVEL CITY CHECK-INS
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

-- Enable Row Level Security for all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE introductions ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthday_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_checkins ENABLE ROW LEVEL SECURITY;

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

-- Add default policies to prevent unauthorized inserts
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Enable Realtime for relevant tables (optional, but useful for notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE introductions;
ALTER PUBLICATION supabase_realtime ADD TABLE coffee_chats;
ALTER PUBLICATION supabase_realtime ADD TABLE travel_checkins;

-- Sample data for Network App testing
-- This file should be executed after complete_setup.sql

-- Insert sample users
INSERT INTO users (id, email, full_name, preferred_name, role, city, niche_tags, birthday, profile_visibility) VALUES
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'brandon@example.com', 'Brandon Chi', 'Brandon', 'member', 'San Francisco', ARRAY['founder', 'tech'], '1990-01-15', true),
  ('f6d93332-a562-4c87-b12d-816a74a4fb6c', 'sarah@example.com', 'Sarah Lee', 'Sarah', 'mentor', 'New York', ARRAY['investor', 'fintech'], '1985-03-22', true),
  ('c5b89624-d157-4e8a-a687-4ce5c2c68964', 'michael@example.com', 'Michael Wong', 'Mike', 'mentee', 'Los Angeles', ARRAY['startup', 'product'], '1992-07-08', true),
  ('a4c67590-f343-4cde-9d42-6479e3bf8ba2', 'lisa@example.com', 'Lisa Johnson', 'Lisa', 'ambassador', 'Seattle', ARRAY['wellness', 'community'], '1988-11-30', true);

-- Insert sample contacts for Brandon
INSERT INTO contacts (owner_id, contact_name, relationship_type, notes, last_interaction_date, birthdate, reminder_frequency) VALUES
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'Alex Thompson', 'professional', 'Met at YC Demo Day', '2025-05-15', '1991-06-20', 'monthly'),
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'Emma Davis', 'mentor', 'Angel investor, quarterly catch-up', '2025-04-30', '1980-09-12', 'quarterly'),
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'David Kim', 'friend', 'College roommate, catch up regularly', '2025-05-01', '1990-03-15', 'monthly');

-- Insert sample contacts for Sarah
INSERT INTO contacts (owner_id, contact_name, relationship_type, notes, last_interaction_date, birthdate, reminder_frequency) VALUES
  ('f6d93332-a562-4c87-b12d-816a74a4fb6c', 'John Smith', 'professional', 'Portfolio company CEO', '2025-05-20', '1987-08-25', 'weekly'),
  ('f6d93332-a562-4c87-b12d-816a74a4fb6c', 'Rachel Green', 'mentee', 'Promising founder', '2025-05-10', '1993-04-18', 'monthly');

-- Insert sample introductions
INSERT INTO introductions (introduced_by_id, contact_1_id, contact_2_id, intro_message, status) VALUES
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 
   (SELECT id FROM contacts WHERE contact_name = 'Alex Thompson' AND owner_id = 'd0d54666-e686-4b7b-8603-576f2a0575d3'),
   (SELECT id FROM contacts WHERE contact_name = 'Emma Davis' AND owner_id = 'd0d54666-e686-4b7b-8603-576f2a0575d3'),
   'Hey Emma, I''d like to introduce you to Alex. He''s working on an interesting AI startup that aligns with your investment thesis.',
   'pending');

-- Insert sample birthday reminders
INSERT INTO birthday_reminders (contact_id, reminder_date, reminder_sent)
SELECT 
  id,
  birthdate - INTERVAL '1 week',
  false
FROM contacts
WHERE birthdate IS NOT NULL;

-- Insert sample coffee chats
INSERT INTO coffee_chats (user_id, city, date_available, public_visibility) VALUES
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'San Francisco', '2025-06-15', true),
  ('f6d93332-a562-4c87-b12d-816a74a4fb6c', 'New York', '2025-06-20', true),
  ('c5b89624-d157-4e8a-a687-4ce5c2c68964', 'Los Angeles', '2025-06-10', true);

-- Insert sample travel check-ins
INSERT INTO travel_checkins (user_id, city, checkin_date, visible_to_others) VALUES
  ('d0d54666-e686-4b7b-8603-576f2a0575d3', 'New York', '2025-06-01', true),
  ('f6d93332-a562-4c87-b12d-816a74a4fb6c', 'San Francisco', '2025-06-05', true),
  ('a4c67590-f343-4cde-9d42-6479e3bf8ba2', 'Los Angeles', '2025-06-10', true);

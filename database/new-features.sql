-- Mastermind Sessions Table
CREATE TABLE IF NOT EXISTS mastermind_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  topic TEXT NOT NULL,
  date_time TIMESTAMP NOT NULL,
  format TEXT CHECK (format IN ('virtual', 'in-person')) DEFAULT 'virtual',
  location TEXT,
  description TEXT,
  max_capacity INT DEFAULT 8 CHECK (max_capacity > 0),
  attendees UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Event Suggestions Table
CREATE TABLE IF NOT EXISTS event_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  niche_tag TEXT NOT NULL,
  city TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  external_link TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mastermind_sessions_host_id ON mastermind_sessions(host_id);
CREATE INDEX IF NOT EXISTS idx_mastermind_sessions_date_time ON mastermind_sessions(date_time);
CREATE INDEX IF NOT EXISTS idx_mastermind_sessions_attendees ON mastermind_sessions USING GIN(attendees);

CREATE INDEX IF NOT EXISTS idx_event_suggestions_city ON event_suggestions(city);
CREATE INDEX IF NOT EXISTS idx_event_suggestions_niche_tag ON event_suggestions(niche_tag);
CREATE INDEX IF NOT EXISTS idx_event_suggestions_event_date ON event_suggestions(event_date);

-- Row Level Security (RLS) Policies
ALTER TABLE mastermind_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_suggestions ENABLE ROW LEVEL SECURITY;

-- Mastermind Sessions Policies
CREATE POLICY "Users can view all mastermind sessions" ON mastermind_sessions
  FOR SELECT USING (true);

CREATE POLICY "Users can create mastermind sessions" ON mastermind_sessions
  FOR INSERT WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their sessions" ON mastermind_sessions
  FOR UPDATE USING (auth.uid() = host_id);

CREATE POLICY "Hosts can delete their sessions" ON mastermind_sessions
  FOR DELETE USING (auth.uid() = host_id);

-- Event Suggestions Policies (read-only for users)
CREATE POLICY "Users can view event suggestions" ON event_suggestions
  FOR SELECT USING (true);

-- Sample data for testing
INSERT INTO event_suggestions (niche_tag, city, title, description, event_date, external_link) VALUES
('Tech', 'San Francisco', 'AI & Machine Learning Meetup', 'Join us for an evening of AI discussions and networking with industry leaders.', '2024-02-15', 'https://example.com/ai-meetup'),
('Startup', 'New York', 'Founder Breakfast Series', 'Monthly breakfast for early-stage founders to share experiences and insights.', '2024-02-20', 'https://example.com/founder-breakfast'),
('Design', 'Los Angeles', 'UX/UI Design Workshop', 'Hands-on workshop covering the latest design trends and tools.', '2024-02-25', 'https://example.com/design-workshop'),
('Finance', 'Chicago', 'Investment Strategy Seminar', 'Learn about modern investment strategies from financial experts.', '2024-03-01', 'https://example.com/investment-seminar'),
('Health', 'Austin', 'Wellness & Productivity Conference', 'Explore the intersection of health, wellness, and professional productivity.', '2024-03-05', 'https://example.com/wellness-conf'),
('Marketing', 'Seattle', 'Digital Marketing Trends 2024', 'Stay ahead with the latest digital marketing strategies and tools.', '2024-03-10', 'https://example.com/marketing-trends'),
('Tech', 'Boston', 'Blockchain & Web3 Summit', 'Deep dive into blockchain technology and its real-world applications.', '2024-03-15', 'https://example.com/blockchain-summit'),
('Startup', 'Miami', 'Venture Capital Pitch Night', 'Present your startup to a panel of VCs and angel investors.', '2024-03-20', 'https://example.com/vc-pitch'),
('Design', 'Portland', 'Creative Collaboration Workshop', 'Learn how to foster creativity and collaboration in design teams.', '2024-03-25', 'https://example.com/creative-workshop'),
('Finance', 'Denver', 'Cryptocurrency Investment Forum', 'Discuss crypto investment strategies with fellow enthusiasts.', '2024-03-30', 'https://example.com/crypto-forum');

-- Sample mastermind sessions
INSERT INTO mastermind_sessions (host_id, title, topic, date_time, format, location, description, max_capacity, attendees) VALUES
((SELECT id FROM users LIMIT 1), 'Creative Founders Circle', 'Entrepreneurship', '2024-02-18 10:00:00', 'virtual', '', 'A supportive space for creative entrepreneurs to share challenges and solutions.', 6, ARRAY[(SELECT id FROM users LIMIT 1)]),
((SELECT id FROM users LIMIT 1), 'Tech Leadership Mastermind', 'Leadership', '2024-02-22 14:00:00', 'in-person', 'WeWork Downtown', 'Monthly gathering for tech leaders to discuss management strategies.', 8, ARRAY[(SELECT id FROM users LIMIT 1)]),
((SELECT id FROM users LIMIT 1), 'Financial Wellness Group', 'Finance', '2024-02-28 18:00:00', 'virtual', '', 'Learn and share strategies for personal and business financial health.', 10, ARRAY[(SELECT id FROM users LIMIT 1)]);

-- Smart Introductions Table
CREATE TABLE IF NOT EXISTS smart_introductions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_by TEXT DEFAULT 'system',
  user_1_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_2_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT CHECK (status IN ('pending', 'accepted', 'ignored')) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Add new fields to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS niche TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Indexes for smart introductions
CREATE INDEX IF NOT EXISTS idx_smart_introductions_user_1_id ON smart_introductions(user_1_id);
CREATE INDEX IF NOT EXISTS idx_smart_introductions_user_2_id ON smart_introductions(user_2_id);
CREATE INDEX IF NOT EXISTS idx_smart_introductions_status ON smart_introductions(status);

-- Smart Introductions Policies
ALTER TABLE smart_introductions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own introductions" ON smart_introductions
  FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

CREATE POLICY "System can create introductions" ON smart_introductions
  FOR INSERT WITH CHECK (suggested_by = 'system');

CREATE POLICY "Users can update their introduction status" ON smart_introductions
  FOR UPDATE USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Update triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mastermind_sessions_updated_at BEFORE UPDATE ON mastermind_sessions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_event_suggestions_updated_at BEFORE UPDATE ON event_suggestions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_smart_introductions_updated_at BEFORE UPDATE ON smart_introductions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

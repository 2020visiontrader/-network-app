-- ============================================================================
-- NETWORKING FEATURES - TABLE 2: COFFEE CHATS
-- ============================================================================

-- ☕ 1-on-1 Coffee Chat Scheduling
CREATE TABLE coffee_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  requested_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  proposed_time TIMESTAMP WITH TIME ZONE,
  confirmed_time TIMESTAMP WITH TIME ZONE,
  meeting_type TEXT DEFAULT 'virtual', -- virtual or in-person
  location_or_link TEXT,
  requester_message TEXT,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔐 RLS Policy for coffee_chats
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;

-- Founders can view chats they're part of
CREATE POLICY "Chat participants only" ON coffee_chats
  FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = requested_id
  );

-- ⚠️ Coffee Chat Rate Limiting (3 per day)
CREATE OR REPLACE FUNCTION check_coffee_chat_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (
    SELECT COUNT(*) 
    FROM coffee_chats 
    WHERE requester_id = NEW.requester_id 
    AND created_at > NOW() - INTERVAL '24 hours'
  ) >= 3 THEN
    RAISE EXCEPTION 'Daily coffee chat limit reached (3/day)';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_coffee_chat_limit
BEFORE INSERT ON coffee_chats
FOR EACH ROW
EXECUTE FUNCTION check_coffee_chat_limit();

-- Test query
-- SELECT 'coffee_chats table with rate limiting created successfully' as status;

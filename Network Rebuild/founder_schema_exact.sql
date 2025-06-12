-- ============================================================================
-- NETWORK APP - EXACT FOUNDER SCHEMA (250 FOUNDERS FREE TIER)
-- Backend-First Mobile Architecture - Following Exact Specifications
-- ============================================================================

-- Drop existing tables (clean slate)
DROP TABLE IF EXISTS event_attendees CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS location_shares CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS device_tokens CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS coffee_chats CASCADE;
DROP TABLE IF EXISTS connections CASCADE;
DROP TABLE IF EXISTS referrals CASCADE;
DROP TABLE IF EXISTS founder_applications CASCADE;
DROP TABLE IF EXISTS availability_status CASCADE;
DROP TABLE IF EXISTS founders CASCADE;

-- ============================================================================
-- 1. FOUNDERS TABLE (Core user profiles - 250 max)
-- ============================================================================
CREATE TABLE founders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role TEXT NOT NULL, -- CEO, CTO, Co-founder, etc.
  company_stage TEXT, -- pre-seed, seed, series-a, etc.
  industry TEXT,
  tagline TEXT, -- one-liner about their startup
  bio TEXT,
  profile_photo_url TEXT,
  location_city TEXT,
  location_country TEXT,
  linkedin_url TEXT,
  twitter_handle TEXT,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  member_number INTEGER UNIQUE, -- 1-250 for founding members
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 2. FOUNDER_APPLICATIONS TABLE (Waitlist/approval system)
-- ============================================================================
CREATE TABLE founder_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_website TEXT,
  linkedin_url TEXT NOT NULL,
  funding_stage TEXT,
  brief_description TEXT NOT NULL, -- What they're building
  referral_code TEXT, -- Who referred them
  application_status TEXT DEFAULT 'pending', -- pending, approved, rejected
  admin_notes TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES founders(id)
);

-- ============================================================================
-- 3. CONNECTIONS TABLE (Founder networking)
-- ============================================================================
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_a_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  founder_b_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected', -- connected, blocked
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connection_source TEXT DEFAULT 'app', -- app, event, referral
  UNIQUE(founder_a_id, founder_b_id),
  CONSTRAINT no_self_connection CHECK (founder_a_id != founder_b_id)
);

-- ============================================================================
-- 4. COFFEE_CHATS TABLE (1:1 meeting booking)
-- ============================================================================
CREATE TABLE coffee_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  requested_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- pending, confirmed, completed, cancelled
  proposed_time TIMESTAMP WITH TIME ZONE,
  confirmed_time TIMESTAMP WITH TIME ZONE,
  meeting_type TEXT DEFAULT 'virtual', -- virtual, in-person
  location_or_link TEXT,
  requester_message TEXT,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 5. CHAT_MESSAGES TABLE (Simple messaging for coordinating chats)
-- ============================================================================
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_chat_id UUID REFERENCES coffee_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- ============================================================================
-- 6. DEVICE_TOKENS TABLE (Push notifications)
-- ============================================================================
CREATE TABLE device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  platform TEXT NOT NULL, -- ios, android
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(founder_id, device_token)
);

-- ============================================================================
-- 7. NOTIFICATIONS TABLE (Mobile alerts)
-- ============================================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- coffee_request, chat_confirmed, new_connection, system
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB, -- Additional data for deep linking
  is_read BOOLEAN DEFAULT false,
  is_pushed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 8. AVAILABILITY_STATUS TABLE (Real-time status)
-- ============================================================================
CREATE TABLE availability_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE UNIQUE,
  status TEXT DEFAULT 'available', -- available, busy, coffee_break, building
  status_emoji TEXT DEFAULT '💼',
  custom_message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 9. EVENTS TABLE (Founder meetups)
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  organizer_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  event_type TEXT DEFAULT 'networking', -- networking, demo_day, workshop
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  virtual_link TEXT,
  max_attendees INTEGER DEFAULT 20,
  is_free BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 10. EVENT_ATTENDEES TABLE
-- ============================================================================
CREATE TABLE event_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'attending', -- attending, maybe, cancelled
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, founder_id)
);

-- ============================================================================
-- 11. REFERRALS TABLE (Simple referral tracking)
-- ============================================================================
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  email_referred TEXT,
  status TEXT DEFAULT 'sent', -- sent, joined, expired
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 12. LOCATION_SHARES TABLE (Founder discovery)
-- ============================================================================
CREATE TABLE location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  is_traveling BOOLEAN DEFAULT false,
  available_for_meetups BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (FOUNDER-ONLY ACCESS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffee_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES (FOUNDER-ONLY ACCESS)
-- ============================================================================

-- FOUNDERS TABLE POLICIES
CREATE POLICY "Founders can view own profile" ON founders
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Founders can update own profile" ON founders
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Verified founders can view others" ON founders
  FOR SELECT USING (
    is_verified = true AND is_active = true
    AND EXISTS (
      SELECT 1 FROM founders
      WHERE id = auth.uid()
      AND is_verified = true
      AND is_active = true
    )
  );

-- FOUNDER APPLICATIONS POLICIES
CREATE POLICY "Admin access to applications" ON founder_applications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM founders
      WHERE id = auth.uid()
      AND email = 'admin@networkapp.com'
    )
  );

CREATE POLICY "Anyone can submit application" ON founder_applications
  FOR INSERT WITH CHECK (true);

-- COFFEE CHATS POLICIES
CREATE POLICY "Chat participants only" ON coffee_chats
  FOR ALL USING (
    auth.uid() = requester_id OR auth.uid() = requested_id
  );

-- CONNECTIONS POLICIES
CREATE POLICY "Founders can view own connections" ON connections
  FOR SELECT USING (
    founder_a_id = auth.uid() OR founder_b_id = auth.uid()
  );

CREATE POLICY "Founders can create connections" ON connections
  FOR INSERT WITH CHECK (founder_a_id = auth.uid());

-- NOTIFICATIONS POLICIES
CREATE POLICY "Founders can view own notifications" ON notifications
  FOR SELECT USING (founder_id = auth.uid());

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- DEVICE TOKENS POLICIES
CREATE POLICY "Founders can manage own device tokens" ON device_tokens
  FOR ALL USING (founder_id = auth.uid());

-- AVAILABILITY STATUS POLICIES
CREATE POLICY "Founders can view availability" ON availability_status
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM founders
      WHERE id = auth.uid()
      AND is_verified = true
    )
  );

CREATE POLICY "Founders can manage own availability" ON availability_status
  FOR ALL USING (founder_id = auth.uid());

-- ============================================================================
-- MOBILE RATE LIMITING & FUNCTIONS
-- ============================================================================

-- Prevent spam: 3 coffee requests per day
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

-- Apply coffee chat rate limiting trigger
CREATE TRIGGER coffee_chat_rate_limit
  BEFORE INSERT ON coffee_chats
  FOR EACH ROW EXECUTE FUNCTION check_coffee_chat_limit();

-- Ensure we don't exceed 250 founders
CREATE OR REPLACE FUNCTION check_founder_limit()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT COUNT(*) FROM founders WHERE is_active = true) >= 250 THEN
    RAISE EXCEPTION 'Founder limit reached (250 max for free tier)';
  END IF;

  -- Auto-assign member number
  NEW.member_number := (SELECT COALESCE(MAX(member_number), 0) + 1 FROM founders);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply founder limit trigger
CREATE TRIGGER enforce_founder_limit
  BEFORE INSERT ON founders
  FOR EACH ROW EXECUTE FUNCTION check_founder_limit();

-- Auto-send push for coffee chat requests
CREATE OR REPLACE FUNCTION notify_coffee_request()
RETURNS TRIGGER AS $$
DECLARE
  requester_name TEXT;
BEGIN
  -- Get requester name
  SELECT full_name INTO requester_name
  FROM founders WHERE id = NEW.requester_id;

  -- Insert notification
  INSERT INTO notifications (founder_id, type, title, body, data)
  VALUES (
    NEW.requested_id,
    'coffee_request',
    'Coffee Chat Request ☕',
    requester_name || ' wants to grab coffee!',
    jsonb_build_object('chat_id', NEW.id, 'requester_id', NEW.requester_id)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply coffee chat notification trigger
CREATE TRIGGER coffee_chat_notification
  AFTER INSERT ON coffee_chats
  FOR EACH ROW EXECUTE FUNCTION notify_coffee_request();

-- Welcome new founders and suggest connections
CREATE OR REPLACE FUNCTION welcome_new_founder()
RETURNS TRIGGER AS $$
BEGIN
  -- Send welcome notification
  INSERT INTO notifications (founder_id, type, title, body, data)
  VALUES (
    NEW.id,
    'welcome',
    'Welcome to Network App! 🚀',
    'You''re founder #' || NEW.member_number || ' in our community!',
    jsonb_build_object('onboarding', true)
  );

  -- Auto-connect with similar industry founders (max 3)
  INSERT INTO connections (founder_a_id, founder_b_id, connection_source)
  SELECT NEW.id, f.id, 'auto_match'
  FROM founders f
  WHERE f.industry = NEW.industry
  AND f.id != NEW.id
  AND f.is_active = true
  LIMIT 3;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply welcome trigger
CREATE TRIGGER welcome_new_founder_trigger
  AFTER INSERT ON founders
  FOR EACH ROW EXECUTE FUNCTION welcome_new_founder();

-- Limit founder applications to 1 per email
CREATE UNIQUE INDEX unique_application_email ON founder_applications(email)
WHERE application_status != 'rejected';

-- ============================================================================
-- SCHEMA DEPLOYMENT COMPLETE
-- ============================================================================

/*
✅ EXACT FOUNDER SCHEMA COMPLETED:

📱 MOBILE-FIRST FEATURES:
- founders → Core user profiles (250 max)
- founder_applications → Waitlist/approval system
- connections → Founder networking
- coffee_chats → 1:1 meeting booking
- notifications → Mobile alerts
- events → Founder meetups
- device_tokens → Push notifications
- availability_status → Real-time status

🔐 SECURITY REQUIREMENTS:
- Row-Level Security (RLS) on all tables
- Founder-only access (no public data)
- Rate limiting (3 coffee chats/day max)
- Admin approval for all new founders

⚡ MOBILE OPTIMIZATIONS:
- 250 founder cap with auto-numbering
- Coffee chat rate limiting
- Push notification automation
- Auto-connection suggestions
- Welcome flow triggers

🚀 READY FOR FRONTEND DEVELOPMENT
*/

-- ============================================================================
-- NETWORKING FEATURES - TABLE 1: CONNECTIONS
-- ============================================================================

-- 🫱🏽‍🫲🏽 Founder-to-Founder Connections
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_a_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  founder_b_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'connected', -- Options: connected, blocked
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  connection_source TEXT DEFAULT 'app', -- app, event, referral
  UNIQUE(founder_a_id, founder_b_id),
  CONSTRAINT no_self_connection CHECK (founder_a_id != founder_b_id)
);

-- 🔐 RLS Policy for connections
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Only show connections where founder is involved
CREATE POLICY "Founder view connections" ON connections
  FOR SELECT USING (
    auth.uid() = founder_a_id OR auth.uid() = founder_b_id
  );

-- Allow founders to create connections
CREATE POLICY "Founder create connections" ON connections
  FOR INSERT WITH CHECK (
    auth.uid() = founder_a_id
  );

-- Test query
-- SELECT 'connections table created successfully' as status;

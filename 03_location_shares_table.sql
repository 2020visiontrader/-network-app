-- ============================================================================
-- LOCATION & EVENTS - TABLE 1: LOCATION SHARES
-- ============================================================================

-- 🧭 For Local Discovery & Travel Sync
CREATE TABLE location_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  is_traveling BOOLEAN DEFAULT false,
  available_for_meetups BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 🔐 RLS Policy for location_shares
ALTER TABLE location_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Founders manage own location" ON location_shares
  FOR ALL USING (auth.uid() = founder_id);

-- Allow viewing other founders' locations for discovery
CREATE POLICY "View available locations" ON location_shares
  FOR SELECT USING (available_for_meetups = true);

-- Test query
-- SELECT 'location_shares table created successfully' as status;

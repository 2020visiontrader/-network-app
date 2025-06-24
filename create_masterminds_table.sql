-- Create masterminds table
CREATE TABLE IF NOT EXISTS masterminds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 6,
  meeting_cadence TEXT DEFAULT 'weekly', -- weekly, biweekly, monthly
  meeting_day TEXT, -- monday, tuesday, etc.
  meeting_time TIME,
  timezone TEXT DEFAULT 'UTC',
  is_active BOOLEAN DEFAULT true,
  tags TEXT[], -- Array of tags for categorization
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mastermind_members table for participants
CREATE TABLE IF NOT EXISTS mastermind_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mastermind_id UUID REFERENCES masterminds(id) ON DELETE CASCADE,
  founder_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, co-host
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(mastermind_id, founder_id)
);

-- Enable RLS
ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mastermind_members ENABLE ROW LEVEL SECURITY;

-- RLS Policies for masterminds
CREATE POLICY "Users can view active masterminds" ON masterminds
  FOR SELECT USING (is_active = true);

CREATE POLICY "Users can create masterminds" ON masterminds
  FOR INSERT WITH CHECK (auth.uid()::text = host_id::text);

CREATE POLICY "Hosts can update their masterminds" ON masterminds
  FOR UPDATE USING (auth.uid()::text = host_id::text);

-- RLS Policies for mastermind_members
CREATE POLICY "Members can view mastermind memberships" ON mastermind_members
  FOR SELECT USING (
    founder_id::text = auth.uid()::text OR
    mastermind_id IN (SELECT id FROM masterminds WHERE host_id::text = auth.uid()::text)
  );

CREATE POLICY "Users can join masterminds" ON mastermind_members
  FOR INSERT WITH CHECK (auth.uid()::text = founder_id::text);

CREATE POLICY "Members can leave masterminds" ON mastermind_members
  FOR DELETE USING (
    founder_id::text = auth.uid()::text OR
    mastermind_id IN (SELECT id FROM masterminds WHERE host_id::text = auth.uid()::text)
  );

SELECT 'Masterminds tables created successfully' as status;

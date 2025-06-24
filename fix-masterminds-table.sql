-- ============================================================================
-- CREATE MISSING MASTERMINDS TABLE
-- ============================================================================

-- Create masterminds table
CREATE TABLE IF NOT EXISTS masterminds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  description TEXT,
  max_members INTEGER DEFAULT 6,
  current_members INTEGER DEFAULT 1,
  meeting_cadence TEXT DEFAULT 'weekly', -- weekly, biweekly, monthly
  meeting_day TEXT, -- monday, tuesday, etc
  meeting_time TIME,
  timezone TEXT,
  duration_minutes INTEGER DEFAULT 60,
  tags TEXT[], -- array of tags
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE masterminds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view active masterminds" ON masterminds
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Users can create masterminds" ON masterminds
  FOR INSERT 
  WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts can update their masterminds" ON masterminds
  FOR UPDATE 
  USING (auth.uid() = host_id);

-- Create mastermind_members table for tracking membership
CREATE TABLE IF NOT EXISTS mastermind_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mastermind_id UUID REFERENCES masterminds(id) ON DELETE CASCADE,
  member_id UUID REFERENCES founders(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(mastermind_id, member_id)
);

-- Enable RLS for members table
ALTER TABLE mastermind_members ENABLE ROW LEVEL SECURITY;

-- Create policies for members table
CREATE POLICY "Users can view mastermind members" ON mastermind_members
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can join masterminds" ON mastermind_members
  FOR INSERT 
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Users can leave masterminds" ON mastermind_members
  FOR UPDATE 
  USING (auth.uid() = member_id);

SELECT 'Masterminds table created successfully' as status;

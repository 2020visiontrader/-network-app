# 🗄️ Database Schema - CONFIRMED Structure

## ✅ **Working Table Structures (June 23, 2025)**

### **`founders` Table**
```sql
CREATE TABLE founders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),  -- NOT just 'id'
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  linkedin_url TEXT,
  location_city TEXT,
  industry TEXT,
  tagline TEXT,
  profile_photo_url TEXT,
  onboarding_completed BOOLEAN DEFAULT false,
  profile_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **`connections` Table** 
```sql
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  founder_a_id UUID REFERENCES founders(id),  -- NOTE: _id suffix!
  founder_b_id UUID REFERENCES founders(id),  -- NOTE: _id suffix!
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **`coffee_chats` Table**
```sql
CREATE TABLE coffee_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID REFERENCES founders(id),   -- NOTE: requester_id NOT creator_id
  requested_id UUID REFERENCES founders(id),   -- NOTE: requested_id NOT target_user_id
  status TEXT DEFAULT 'pending',
  proposed_time TIMESTAMP WITH TIME ZONE,
  confirmed_time TIMESTAMP WITH TIME ZONE,
  location_or_link TEXT,
  requester_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **`masterminds` Table**
```sql
CREATE TABLE masterminds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES founders(id),
  topic TEXT NOT NULL,                    -- NOTE: 'topic' NOT 'title'
  description TEXT,
  max_participants INTEGER DEFAULT 6,
  tags TEXT[],
  meeting_frequency TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🔍 **Critical Column Name Mappings**

### **WRONG → CORRECT**
- `founder_a` → `founder_a_id`
- `founder_b` → `founder_b_id`
- `creator_id` → `requester_id` (coffee_chats)
- `target_user_id` → `requested_id` (coffee_chats)
- `title` → `topic` (masterminds)

## 🔐 **Working RLS Policies**

### **Founders Table - SINGLE Policy (no conflicts)**
```sql
-- Remove conflicting policies first
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON founders;

-- Keep only the essential one
CREATE POLICY "Users can manage own founder profile" ON founders
  USING (auth.uid() = user_id);
```

## 🔗 **Supabase Connection**
```bash
# Working connection string
psql "postgresql://postgres:Y!sNow63@db.gbdodttegdctxvvavlqq.supabase.co:5432/postgres"
```

**Last Verified:** June 23, 2025 ✅

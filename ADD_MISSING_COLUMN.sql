-- Comprehensive fix for missing columns in founders table
-- This resolves the "Column Does Not Exist" errors

-- Add core required columns that are definitely missing
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE NOT NULL;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS full_name TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS profile_progress INTEGER DEFAULT 0;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT TRUE;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS tags_or_interests TEXT[];

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS member_number INTEGER;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS last_active TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add additional columns that may be referenced in the app
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS linkedin_url TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS location_city TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS location_country TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS role TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS industry TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS tagline TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS twitter_handle TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS company_website TEXT;

ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS preferred_name TEXT;

-- Update existing records to set intelligent defaults
UPDATE founders 
SET 
    onboarding_completed = CASE 
        WHEN profile_progress >= 100 THEN TRUE 
        ELSE FALSE 
    END,
    profile_progress = COALESCE(profile_progress, 0),
    onboarding_step = COALESCE(onboarding_step, 1),
    profile_visible = COALESCE(profile_visible, TRUE),
    is_verified = COALESCE(is_verified, FALSE),
    is_active = COALESCE(is_active, TRUE),
    last_active = COALESCE(last_active, NOW())
WHERE id IS NOT NULL;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_founders_onboarding_completed 
ON founders(onboarding_completed);

CREATE INDEX IF NOT EXISTS idx_founders_profile_progress 
ON founders(profile_progress);

CREATE INDEX IF NOT EXISTS idx_founders_is_active 
ON founders(is_active);

CREATE INDEX IF NOT EXISTS idx_founders_email 
ON founders(email);

-- Verify the columns were added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default 
FROM information_schema.columns 
WHERE table_name = 'founders' 
AND column_name IN (
    'onboarding_completed', 
    'full_name',
    'profile_progress', 
    'onboarding_step',
    'profile_visible',
    'is_verified',
    'is_active',
    'bio',
    'linkedin_url',
    'location_city',
    'company_name',
    'role',
    'industry'
)
ORDER BY column_name;

-- Show sample data to verify the updates worked
SELECT 
    id, 
    email, 
    full_name,
    profile_progress, 
    onboarding_completed,
    onboarding_step,
    profile_visible,
    is_active
FROM founders 
LIMIT 3;

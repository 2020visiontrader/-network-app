-- COMPREHENSIVE FIX: Add missing columns one by one
-- Run this in your Supabase SQL Editor after the simple test works

-- Step 1: Add onboarding_completed (most critical)
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Step 2: Add full_name (causing errors)
ALTER TABLE founders ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Step 3: Add other missing columns
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_progress INTEGER DEFAULT 0;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS profile_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS tags_or_interests TEXT[];
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS location_city TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS location_country TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS role TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE founders ADD COLUMN IF NOT EXISTS preferred_name TEXT;

-- Step 4: Update existing records with sensible defaults
UPDATE founders 
SET 
    onboarding_completed = COALESCE(onboarding_completed, FALSE),
    profile_progress = COALESCE(profile_progress, 0),
    onboarding_step = COALESCE(onboarding_step, 1),
    profile_visible = COALESCE(profile_visible, TRUE),
    is_verified = COALESCE(is_verified, FALSE),
    is_active = COALESCE(is_active, TRUE)
WHERE id IS NOT NULL;

-- Step 5: Verify all columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'founders'
AND column_name IN (
    'onboarding_completed', 'full_name', 'profile_progress', 
    'onboarding_step', 'profile_visible', 'bio', 'linkedin_url',
    'location_city', 'company_name', 'role', 'industry'
)
ORDER BY column_name;

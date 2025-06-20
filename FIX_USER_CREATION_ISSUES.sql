-- Fix User Creation Issues
-- This script addresses schema mismatches and missing required columns

-- 1. Make password_hash nullable (it shouldn't be required for modern auth)
ALTER TABLE founders ALTER COLUMN password_hash DROP NOT NULL;

-- 2. Add missing columns that the mobile app expects
-- These are used in the onboarding flow

-- Add availability column (used in onboarding)
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS availability TEXT DEFAULT 'available' 
CHECK (availability IN ('available', 'busy', 'offline'));

-- Add experience_level column (used in onboarding)
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'intermediate'
CHECK (experience_level IN ('beginner', 'intermediate', 'expert'));

-- Add interests array column (used in onboarding)
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Add status column (used for user state management)
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
CHECK (status IN ('active', 'inactive', 'pending', 'suspended'));

-- Ensure bio column exists and is not required
ALTER TABLE founders 
ALTER COLUMN bio DROP NOT NULL;

-- 3. Create a unified location column if it doesn't exist
-- This combines location_city and location_country for mobile app compatibility
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS unified_location TEXT 
GENERATED ALWAYS AS (
    CASE 
        WHEN location_city IS NOT NULL AND location_country IS NOT NULL 
        THEN location_city || ', ' || location_country
        WHEN location_city IS NOT NULL 
        THEN location_city
        WHEN location_country IS NOT NULL 
        THEN location_country
        ELSE location
    END
) STORED;

-- 4. Update RLS policies to ensure users can create their own profiles
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can insert their own founder profile" ON founders;
DROP POLICY IF EXISTS "Users can view their own founder profile" ON founders;
DROP POLICY IF EXISTS "Users can update their own founder profile" ON founders;

-- Create new, simplified policies
CREATE POLICY "Enable insert for authenticated users" ON founders
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable select for authenticated users" ON founders
    FOR SELECT USING (auth.uid() = id OR is_active = true);

CREATE POLICY "Enable update for profile owners" ON founders
    FOR UPDATE USING (auth.uid() = id);

-- 5. Create a view for mobile app compatibility
-- This maps the database columns to what the mobile app expects
CREATE OR REPLACE VIEW mobile_founders AS
SELECT 
    id,
    email,
    full_name,
    COALESCE(bio, '') as bio,
    COALESCE(unified_location, location, location_city, '') as location,
    COALESCE(experience_level, 'intermediate') as experience_level,
    COALESCE(interests, '{}') as interests,
    COALESCE(availability, 'available') as availability,
    COALESCE(status, 'active') as status,
    COALESCE(avatar_url, profile_photo_url, profile_picture) as avatar_url,
    company_name as company,
    industry,
    company_stage as stage,
    role,
    tagline,
    linkedin_url,
    twitter_handle,
    company_website,
    is_verified,
    is_active,
    onboarding_completed,
    onboarding_complete,
    created_at,
    updated_at,
    last_active
FROM founders;

-- Grant access to the view
GRANT SELECT ON mobile_founders TO authenticated;
GRANT SELECT ON mobile_founders TO anon;

-- 6. Create a function to handle mobile app user creation
CREATE OR REPLACE FUNCTION create_mobile_founder(
    user_id UUID,
    user_email TEXT,
    user_full_name TEXT,
    user_bio TEXT DEFAULT '',
    user_location TEXT DEFAULT '',
    user_experience_level TEXT DEFAULT 'intermediate',
    user_interests TEXT[] DEFAULT '{}',
    user_availability TEXT DEFAULT 'available'
)
RETURNS SETOF founders
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Insert with mobile app compatible data
    RETURN QUERY
    INSERT INTO founders (
        id,
        email,
        full_name,
        bio,
        location,
        experience_level,
        interests,
        availability,
        status,
        is_active,
        onboarding_completed,
        onboarding_complete,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        user_email,
        user_full_name,
        user_bio,
        user_location,
        user_experience_level,
        user_interests,
        user_availability,
        'active',
        true,
        NOW(),
        true,
        NOW(),
        NOW()
    )
    RETURNING *;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_mobile_founder TO authenticated;

-- 7. Add helpful indexes for mobile app queries
CREATE INDEX IF NOT EXISTS idx_founders_mobile_active ON founders (is_active, status) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_founders_mobile_location ON founders (location, location_city);
CREATE INDEX IF NOT EXISTS idx_founders_mobile_interests ON founders USING GIN (interests);

COMMENT ON TABLE founders IS 'Founders table with mobile app compatibility fixes applied';
COMMENT ON VIEW mobile_founders IS 'Mobile-friendly view of founders table with unified column mapping';
COMMENT ON FUNCTION create_mobile_founder IS 'Function to create founder profiles from mobile app';

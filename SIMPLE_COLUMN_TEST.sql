-- SIMPLE TEST: Add ONE critical column to test database access
-- Run this FIRST in your Supabase SQL Editor

-- Test 1: Add the most critical missing column
ALTER TABLE founders 
ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- Test 2: Verify it was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'founders' 
AND column_name = 'onboarding_completed';

-- Test 3: Show current table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'founders'
ORDER BY ordinal_position;

-- SIMPLE PERMISSIONS FIX (Run this first)
-- This addresses the core permission issues without sequence errors

-- ===========================================
-- STEP 1: BASIC TABLE PERMISSIONS
-- ===========================================

-- Grant basic permissions on founders table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founders TO authenticated;

-- ===========================================
-- STEP 2: ENABLE ROW LEVEL SECURITY
-- ===========================================

-- Enable RLS on founders table
ALTER TABLE public.founders ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 3: CREATE ESSENTIAL RLS POLICIES
-- ===========================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage own founder profile" ON public.founders;

-- Create a single comprehensive policy for own records
CREATE POLICY "Users can manage own founder profile"
ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- STEP 4: SERVICE ROLE ACCESS
-- ===========================================

-- Grant service role full access (needed for database functions)
GRANT ALL ON public.founders TO service_role;

-- ===========================================
-- STEP 5: VERIFY THE FIX
-- ===========================================

-- Check if policies were created
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'founders';

-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'founders';

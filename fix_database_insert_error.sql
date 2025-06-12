-- ============================================================================
-- FIX DATABASE ERROR - NEW USER CREATION
-- ============================================================================

-- STEP 1: Check current founders table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'founders' 
ORDER BY ordinal_position;

-- STEP 2: Temporarily disable RLS for debugging
ALTER TABLE founders DISABLE ROW LEVEL SECURITY;
ALTER TABLE founder_applications DISABLE ROW LEVEL SECURITY;

-- STEP 3: Drop existing problematic policies
DROP POLICY IF EXISTS "founders_select_own" ON founders;
DROP POLICY IF EXISTS "founders_update_own" ON founders;
DROP POLICY IF EXISTS "founders_select_verified" ON founders;
DROP POLICY IF EXISTS "founders_insert" ON founders;

-- STEP 4: Create simple, working RLS policies
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own founder record
CREATE POLICY "Allow authenticated insert" ON founders
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to view their own founder record
CREATE POLICY "Allow own select" ON founders
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own founder record
CREATE POLICY "Allow own update" ON founders
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow viewing verified founders (for networking)
CREATE POLICY "Allow view verified" ON founders
  FOR SELECT 
  USING (is_verified = true AND is_active = true);

-- STEP 5: Fix founder_applications table
ALTER TABLE founder_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert applications (for signup)
CREATE POLICY "Allow application insert" ON founder_applications
  FOR INSERT 
  WITH CHECK (true);

-- Allow users to view their own applications
CREATE POLICY "Allow own application view" ON founder_applications
  FOR SELECT 
  USING (email = auth.email());

-- STEP 6: Create trigger to auto-populate founder ID from auth
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Set the founder ID to match the auth user ID
  NEW.id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON founders;

-- Create trigger for new founder inserts
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON founders
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- STEP 7: Test insert (replace with actual values)
-- INSERT INTO founders (email, full_name, company_name, role, is_verified, is_active)
-- VALUES ('test@example.com', 'Test User', 'Test Company', 'Founder', false, true);

-- STEP 8: Verify policies are working
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('founders', 'founder_applications');

-- Success message
SELECT 'Database insert policies fixed! Ready to test user creation.' as status;

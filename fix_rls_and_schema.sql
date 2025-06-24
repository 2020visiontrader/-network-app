-- Fix RLS Policies and Schema Issues

-- Part 1: Fix connection policies
-- First, drop existing problematic policies
DROP POLICY IF EXISTS connections_insert_policy ON connections;
DROP POLICY IF EXISTS connections_select_policy ON connections;
DROP POLICY IF EXISTS connections_update_policy ON connections;
DROP POLICY IF EXISTS connections_delete_policy ON connections;

-- Create proper insert policy
CREATE POLICY connections_insert_policy
  ON connections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (founder_a_id IN (SELECT id FROM founders WHERE user_id = auth.uid()))
  );

-- Create proper select policy
CREATE POLICY connections_select_policy
  ON connections
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (
      founder_a_id IN (SELECT id FROM founders WHERE user_id = auth.uid()) OR
      founder_b_id IN (SELECT id FROM founders WHERE user_id = auth.uid())
    )
  );

-- Create proper update policy
CREATE POLICY connections_update_policy
  ON connections
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (
      founder_a_id IN (SELECT id FROM founders WHERE user_id = auth.uid()) OR
      founder_b_id IN (SELECT id FROM founders WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    (
      founder_a_id IN (SELECT id FROM founders WHERE user_id = auth.uid()) OR
      founder_b_id IN (SELECT id FROM founders WHERE user_id = auth.uid())
    )
  );

-- Create proper delete policy
CREATE POLICY connections_delete_policy
  ON connections
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (
      founder_a_id IN (SELECT id FROM founders WHERE user_id = auth.uid()) OR
      founder_b_id IN (SELECT id FROM founders WHERE user_id = auth.uid())
    )
  );

-- Part 2: Fix founders policies
-- First, drop existing problematic policies
DROP POLICY IF EXISTS founders_select_policy ON founders;

-- Create proper select policy
CREATE POLICY founders_select_policy
  ON founders
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND
    (
      user_id = auth.uid() OR
      profile_visible = true
    )
  );

-- Part 3: Schema cleanup - migrate is_visible to profile_visible
-- Make sure all records are migrated
UPDATE founders
SET profile_visible = is_visible
WHERE profile_visible IS NULL;

-- Add a comment to remind about dropping the column
COMMENT ON COLUMN founders.is_visible IS 'DEPRECATED: Use profile_visible instead. This column should be dropped after migration verification.';

-- Note: Uncomment the line below after verifying the migration is complete
-- ALTER TABLE founders DROP COLUMN is_visible;

-- ============================================================================
-- CHECK FOUNDERS TABLE SCHEMA FOR REQUIRED FIELDS
-- ============================================================================

-- Check all columns in founders table with their constraints
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for NOT NULL constraints that might cause insert failures
SELECT 
  column_name,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'founders' 
  AND table_schema = 'public'
  AND is_nullable = 'NO'
  AND column_default IS NULL
ORDER BY column_name;

-- Check current RLS policies on founders table
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'founders'
ORDER BY policyname;

-- Test if the insert policy allows auth.uid() inserts
SELECT 'Founders table schema check complete' as status;

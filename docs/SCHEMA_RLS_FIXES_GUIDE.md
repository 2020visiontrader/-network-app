# NetworkFounder App: Schema and RLS Fixes Documentation

## ✅ Issues Fixed

1. **Schema Cache Issue with `is_visible` Column**
   - Column is now accessible via Supabase API
   - Verified by successful query and filter operations
   - Schema cache is properly refreshed

2. **UUID Format Validation**
   - All tests use proper UUID formats via `crypto.randomUUID()` or `uuidv4()`
   - Invalid UUID formats are properly rejected with clear errors

3. **Conflicting RLS Policies**
   - Removed all conflicting and redundant policies
   - Implemented a clean set of non-overlapping policies
   - Anonymous access is properly restricted
   - Authenticated users can only access appropriate data

## 🔧 Technical Details

### Schema Cache Fix

The schema cache issue was fixed by:

1. Ensuring the column exists with proper data type:
   ```sql
   ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
   ```

2. Forcing schema cache refresh using multiple methods:
   ```sql
   -- Update table comment
   COMMENT ON TABLE founders IS 'Founders profile data - Schema cache refresh: June 23, 2025';
   
   -- Add/remove constraint
   ALTER TABLE founders ADD CONSTRAINT temp_constraint CHECK (is_visible IS NOT NULL);
   ALTER TABLE founders DROP CONSTRAINT temp_constraint;
   
   -- Alter column definition
   ALTER TABLE founders ALTER COLUMN is_visible SET DEFAULT true;
   ```

### RLS Policy Fix

The RLS policies were fixed by:

1. Removing all existing policies:
   ```sql
   -- Dynamic approach to remove ALL policies
   DO $$
   DECLARE
       policy_name text;
   BEGIN
       FOR policy_name IN 
           SELECT policyname FROM pg_policies WHERE tablename = 'founders'
       LOOP
           EXECUTE format('DROP POLICY IF EXISTS %I ON founders', policy_name);
       END LOOP;
   END $$;
   ```

2. Creating a minimal set of non-overlapping policies:
   ```sql
   -- Read own profile
   CREATE POLICY "founders_read_own"
     ON founders FOR SELECT
     USING (auth.uid() = user_id);
   
   -- Read other visible profiles
   CREATE POLICY "founders_read_others_visible"
     ON founders FOR SELECT
     USING (
       auth.uid() IS NOT NULL AND
       auth.uid() != user_id AND
       profile_visible = TRUE
     );
   
   -- [Other specific policies for update, insert, delete]
   
   -- Restrictive policy to deny anonymous access
   CREATE POLICY "founders_deny_anon"
     ON founders
     AS RESTRICTIVE
     FOR ALL
     USING (auth.uid() IS NOT NULL);
   ```

## 💻 Code Best Practices

### 1. Use `.maybeSingle()` Instead of `.single()`

Always use `.maybeSingle()` to avoid PGRST116 errors:

```javascript
// AVOID:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .single(); // ❌ Will throw PGRST116 if record not found

// RECOMMENDED:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle(); // ✅ Returns null if not found, no error
```

### 2. Proper UUID Generation

Always use standard UUID generation:

```javascript
// Node.js crypto module
const { randomUUID } = require('crypto');
const validUUID = randomUUID();

// OR uuid package
import { v4 as uuidv4 } from 'uuid';
const validUUID = uuidv4();
```

### 3. Proper Error Handling with `.maybeSingle()`

```javascript
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
  
if (error) {
  // Handle database/query error
} else if (data === null) {
  // Handle case where no record was found
} else {
  // Process the data - you have exactly one record
}
```

## 🧪 Verification Scripts

1. **Schema Cache Verification**:
   ```bash
   node verify-schema-fix.js
   ```

2. **Anonymous Access Test**:
   ```bash
   node test-anonymous-access.js
   ```

3. **Authenticated Access Test** (update with valid credentials first):
   ```bash
   node test-authenticated-rls.js
   ```

## 🔍 How to Monitor for Future Issues

1. **Watch for Schema Cache Issues**:
   - When adding new columns, use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
   - After schema changes, update the table comment to refresh the cache
   - Run the verification script if schema-related errors occur

2. **Watch for RLS Policy Conflicts**:
   - Add new policies using the established naming pattern
   - Keep policies focused on specific operations (SELECT, INSERT, etc.)
   - Avoid overlapping conditions that could create security gaps
   - Test with both anonymous and authenticated users after changes

## 👥 Who to Contact for Help

If you encounter issues with:
- Schema cache: [Your Database Admin Contact]
- RLS policies: [Your Security Team Contact]
- UUID validation: [Your Backend Team Contact]

## 📅 Last Updated

June 23, 2025

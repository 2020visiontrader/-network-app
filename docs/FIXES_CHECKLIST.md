# Schema, UUID, and RLS Fixes Checklist

## ✅ UUID Format Issues - FIXED
- ✅ Using `crypto.randomUUID()` or `uuidv4()` in test scripts
- ✅ Test scripts properly handle UUID validation
- ✅ All UUID-related tests are passing

## ✅ Schema Cache Issue - FIXED
- ✅ The database schema is properly cached
- ✅ The visibility column is now accessible through the Supabase API
- ✅ Can successfully query and filter by the column

## ⚠️ Column Name Standardization - NEEDS ATTENTION
- ⚠️ Standardize on `profile_visible` (remove `is_visible`)
- ⚠️ Update all code to use `profile_visible` consistently
- ⚠️ Ensure RLS policies use the correct column name

## ⏳ RLS Policy Issues - PENDING
- ⏳ Run the updated SQL script in Supabase SQL Editor
- ⏳ Verify RLS policies are correctly applied
- ⏳ Test with authenticated and anonymous users

## 📋 Action Items

### 1. Fix Column Name Standardization
- Run `fix-visibility-column-mismatch.sql` in Supabase SQL Editor
- Run `./update-visibility-column-in-code.sh` to update code references
- Run `node verify-column-standardization.js` to verify the changes

### 2. Execute Schema Cache Fix (if needed)
- Open your Supabase project dashboard
- Navigate to the SQL Editor
- Copy and paste the entire content of `fix-schema-cache.sql`
- Run the script
- Check the results of the verification queries at the end

### 2. Verify RLS Policies
After running the SQL script:
- Run `node verify-rls-policies.js` again
- Anonymous access should now be restricted
- Check the policy list in Supabase dashboard:
  - Navigate to Database → Tables → founders → Policies
  - Confirm the 5 specific policies are present

### 3. Test with Authenticated Users (If Possible)
- Create test users through the Supabase Auth UI
- Sign in as these users
- Test access to own profile vs. other profiles
- Test profiles with different visibility settings

### 4. Update Frontend Code
- Replace all instances of `.single()` with `.maybeSingle()`
- Add proper error handling for null results
- Test the application with different user scenarios

## 🧪 Verification Commands

```bash
# Verify schema cache fix
node verify-schema-fix.js

# Verify UUID fixes
node test-uuid-fixes.js

# Verify RLS policies
node verify-rls-policies.js
```

## 📚 Documentation

Review these documents for detailed information:
- `docs/solutions/schema-uuid-fixes.md` - Schema and UUID issues
- `docs/solutions/rls-policy-fixes.md` - RLS policy fixes
- `docs/solutions/FIXES_COMPLETE.md` - Status update on all fixes

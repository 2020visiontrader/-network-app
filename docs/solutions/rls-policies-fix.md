# 🔐 RLS Policies Fix Documentation

## Overview
This document explains the Row Level Security (RLS) policies fix for the `founders` table, which resolves conflicts and ensures reliable data access.

## The Problem

### Symptoms
- Intermittent access denied errors during onboarding
- PGRST301 errors when accessing founder profiles
- Inconsistent behavior between development and production
- Policy conflicts causing unpredictable access patterns

### Root Cause
Multiple conflicting RLS policies were created over time, causing:
1. **Policy Conflicts**: Multiple policies with overlapping conditions
2. **Naming Inconsistencies**: Similar policy names with different logic
3. **Over-Permissive Policies**: Some policies granted too much access
4. **Under-Restrictive Policies**: Some policies blocked legitimate access

## The Solution

### Final Policy Structure
After applying `FINAL_RLS_POLICIES_FIX.sql`, the `founders` table has exactly **2-3 policies**:

1. **`founders_self_complete_access`** - Users can manage their own profiles
2. **`founders_service_role_access`** - Service role has full backend access  
3. **`founders_public_profiles_read`** - *(Optional)* Public profile discovery

### Policy Details

#### 1. Self-Access Policy
```sql
CREATE POLICY "founders_self_complete_access" ON public.founders
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

**What it does:**
- Allows authenticated users to SELECT, INSERT, UPDATE, DELETE their own records
- Uses `auth.uid() = user_id` to match the authenticated user with their profile
- Covers all CRUD operations in a single policy

**Why it works:**
- Simple condition reduces complexity
- No conflicts with other policies
- Handles onboarding (INSERT) and profile management (UPDATE/SELECT)

#### 2. Service Role Policy
```sql
CREATE POLICY "founders_service_role_access" ON public.founders
FOR ALL
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
```

**What it does:**
- Allows backend operations and admin functions
- Used by server-side code and database triggers
- Bypasses user-level restrictions for system operations

#### 3. Public Read Policy (Optional)
```sql
-- Currently commented out - uncomment if needed
CREATE POLICY "founders_public_profiles_read" ON public.founders
FOR SELECT
USING (
    auth.role() = 'authenticated' 
    AND profile_visible = true 
    AND auth.uid() != user_id
);
```

**What it does:**
- Allows discovery of other users' public profiles
- Only works for profiles marked as `profile_visible = true`
- Excludes the user's own profile (handled by self-access policy)

## How to Apply the Fix

### Step 1: Run the SQL Script
Execute `FINAL_RLS_POLICIES_FIX.sql` in your Supabase SQL Editor:

```bash
# Copy the script content and paste it into Supabase SQL Editor
# Or run via CLI if you have supabase CLI setup
```

### Step 2: Test the Policies
```bash
# Test the RLS policies
node scripts/working/test-rls-policies.js

# Test the full onboarding flow
node scripts/working/test-onboarding-flow.js
```

### Step 3: Verify in Application
1. Test user registration and onboarding
2. Verify dashboard loads correctly
3. Check that profile updates work
4. Ensure no unauthorized access

## Troubleshooting

### Common Issues After Fix

#### Issue: "Permission denied" during onboarding
**Cause:** User not properly authenticated or `user_id` mismatch
**Solution:**
```typescript
// Ensure user_id is set correctly in onboarding
const { data: { user } } = await supabase.auth.getUser();
const founderData = {
  user_id: user.id, // Must match auth.uid()
  // ... other fields
};
```

#### Issue: Can't access profiles in dashboard
**Cause:** Profile not marked as visible or RLS blocking access
**Solution:**
```typescript
// Check if profile_visible is set correctly
await supabase
  .from('founders')
  .update({ profile_visible: true })
  .eq('user_id', user.id);
```

#### Issue: Service operations failing
**Cause:** Not using service role client for backend operations
**Solution:**
```typescript
// Use service role client for backend operations
const supabaseService = createClient(url, serviceKey);
```

### Policy Conflicts
If you still see policy conflicts:

1. **Check for duplicate policies:**
```sql
SELECT policyname, cmd FROM pg_policies 
WHERE tablename = 'founders' 
ORDER BY policyname;
```

2. **Drop conflicting policies manually:**
```sql
DROP POLICY IF EXISTS "problematic_policy_name" ON public.founders;
```

3. **Re-run the fix script**

## Best Practices

### 1. Keep Policies Simple
- Use minimal conditions
- Avoid complex JOIN conditions in policies
- Prefer single policies that handle multiple operations

### 2. Use Consistent Naming
- Use descriptive, unique policy names
- Follow the pattern: `table_purpose_operation`
- Example: `founders_self_complete_access`

### 3. Test Thoroughly
- Test with different user roles
- Test edge cases (no profile, incomplete profile)
- Test both authenticated and unauthenticated access

### 4. Monitor Policy Performance
- Complex policies can slow down queries
- Use EXPLAIN ANALYZE to check query performance
- Consider indexing columns used in policy conditions

## Testing Checklist

After applying the RLS fix, verify:

- [ ] User can complete onboarding
- [ ] User can access their own profile in dashboard
- [ ] User can update their profile
- [ ] User cannot access other users' private data
- [ ] Service role operations work (if applicable)
- [ ] No policy conflict errors in logs
- [ ] Performance is acceptable

## Related Files

- `FINAL_RLS_POLICIES_FIX.sql` - The definitive policy fix
- `scripts/working/test-rls-policies.js` - Policy testing script
- `src/services/FounderService.ts` - Application service layer
- `app/onboarding/page.tsx` - Onboarding implementation
- `docs/solutions/database-fixes.md` - Additional database solutions

## Migration History

1. **Initial Setup**: Basic RLS policies created
2. **Conflict Period**: Multiple overlapping policies added
3. **Debug Phase**: Various temporary policies for testing
4. **Final Fix**: Consolidated to minimal, conflict-free policies

## Future Considerations

### Profile Discovery
If you need public profile discovery:
1. Uncomment the public read policy in the fix script
2. Ensure `profile_visible` column exists and is set appropriately
3. Test that discovery works without compromising privacy

### Advanced Permissions
For role-based access (admin, moderator, etc.):
1. Add role columns to the founders table
2. Create additional policies for role-based access
3. Test thoroughly to avoid conflicts with existing policies

### Performance Optimization
If queries become slow:
1. Add indexes on columns used in policy conditions
2. Consider materialized views for complex queries
3. Monitor query performance with database insights

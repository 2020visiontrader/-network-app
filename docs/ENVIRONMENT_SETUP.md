# NetworkFounder App: Environment Setup Guide

This guide helps new developers set up their environment correctly to avoid schema cache, UUID, and RLS policy issues.

## Prerequisites

- Node.js 16+
- npm or yarn
- Supabase CLI (optional but recommended)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-org/NetworkFounderApp.git
   cd NetworkFounderApp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit `.env` with your Supabase credentials:
   ```
   # Required Supabase connection variables
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   # For authenticated tests
   TEST_USER_EMAIL=your-test-user@example.com
   TEST_USER_PASSWORD=your-test-user-password
   ```

5. Validate your environment:
   ```bash
   node scripts/working/env-validator.js
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Schema Verification

Run this command to verify the database schema is correctly set up:

```bash
node verify-schema-fix.js
```

You should see successful test results for the `is_visible` column and other schema elements.

## RLS Policy Verification

Run this command to verify RLS policies are correctly applied:

```bash
node test-anonymous-access.js
```

This should confirm that anonymous users cannot access restricted data.

## Common Issues and Solutions

### Schema Cache Issues

**Symptoms:**
- Error: "Could not find the 'X' column of 'Y' in the schema cache"
- Queries failing even though columns exist in the database

**Solution:**
1. Run the schema cache fix script:
   ```bash
   # In your Supabase SQL Editor, run:
   ALTER TABLE founders ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;
   COMMENT ON TABLE founders IS 'Table comment - refresh: YYYY-MM-DD';
   ```

2. Verify the fix:
   ```bash
   node verify-schema-fix.js
   ```

### UUID Format Issues

**Symptoms:**
- Error: "invalid input syntax for type uuid: 'custom-string-here'"
- Test user creation failing

**Solution:**
1. Always use proper UUID generation:
   ```javascript
   // Node.js crypto module
   const { randomUUID } = require('crypto');
   const validUUID = randomUUID();

   // OR uuid package
   import { v4 as uuidv4 } from 'uuid';
   const validUUID = uuidv4();
   ```

2. Never use custom string formats for UUID fields

### RLS Policy Issues

**Symptoms:**
- Unexpected access to data
- Permission errors when querying data

**Solution:**
1. Verify current policies:
   ```bash
   # In Supabase SQL Editor:
   SELECT tablename, policyname, cmd, roles, permissive
   FROM pg_policies
   WHERE tablename = 'founders'
   ORDER BY policyname;
   ```

2. If policies need to be reset, run:
   ```bash
   # In Supabase SQL Editor, run the contents of:
   reset-rls-policies.sql
   ```

## Development Best Practices

### Always Use `.maybeSingle()` Instead of `.single()`

```javascript
// AVOID:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .single();  // ❌ Will throw PGRST116 if record not found

// RECOMMENDED:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle();  // ✅ Returns null if not found, no error

// Handle both error and null data cases
if (error) {
  // Handle database errors
} else if (data === null) {
  // Handle not found condition
} else {
  // Process the data
}
```

### Use Service Role for Admin Operations

```javascript
// For admin operations that need to bypass RLS
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Use Standardized Column Names

Always use the standard column names in the codebase:
- `profile_visible` (not `is_visible`) for profile visibility
- `user_id` for the reference to auth.users
- Refer to database schema documentation for other columns

### Check for Schema Issues After Database Changes

After making database schema changes:

1. Update any affected TypeScript types
2. Force a schema cache refresh if needed
3. Run verification scripts to confirm changes

## Verification Scripts

| Script | Purpose |
| ------ | ------- |
| `verify-schema-fix.js` | Verifies schema cache is working |
| `test-anonymous-access.js` | Tests anonymous access restrictions |
| `test-authenticated-rls.js` | Tests authenticated access (needs credentials) |
| `find-single-calls.js` | Helps find `.single()` calls to replace |

## Documentation

Refer to these documents for more detailed information:

- `docs/SCHEMA_RLS_FIXES_GUIDE.md` - Comprehensive guide to schema and RLS fixes
- `docs/solutions/schema-uuid-fixes.md` - Details on schema cache and UUID issues
- `docs/solutions/rls-policy-fixes.md` - Details on RLS policy fixes

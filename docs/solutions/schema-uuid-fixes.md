# Schema Cache and UUID Issues: Solutions Guide

## Background

The NetworkFounder App encountered two main issues that needed to be resolved:

1. **Schema Cache Issue with `is_visible` Column**: The column exists in the database but wasn't visible to the Supabase API due to a schema cache problem.
2. **Invalid UUID Format in Test Users**: Tests were failing due to using non-standard UUID formats in database queries.

## Problem Details

### Problem A: Schema Cache Issue

```
❌ Could not find the 'is_visible' column of 'founders' in the schema cache
```

This error occurs when the Supabase PostgREST layer's schema cache is out of sync with the actual database schema. Even though the column exists in the database (as confirmed by the information_schema query), the API can't "see" it.

### Problem B: Invalid UUID Format

```
❌ invalid input syntax for type uuid: "test-concurrent-1-1750659173503"
```

This error happens when test scripts use custom string formats for UUID fields instead of the standard UUID format (8-4-4-4-12 hexadecimal characters).

## Solutions Implemented

### 1. Schema Cache Fix

We've created a comprehensive SQL script (`fix-schema-cache.sql`) that:

- Ensures the `is_visible` column exists
- Forces a schema cache refresh using multiple methods:
  - Updates the table comment
  - Adds and removes a temporary constraint
  - Makes minor column definition changes
- Verifies the column exists in the database schema

After running this script in the Supabase SQL Editor, you should run the verification script (`verify-schema-fix.js`) to confirm the fix worked.

### 2. UUID Format Fix

We've updated all test scripts to use proper UUID generation:

```javascript
// Method 1: Using Node.js crypto module
const { randomUUID } = require('crypto');
const validUUID = randomUUID();

// Method 2: Using uuid package
import { v4 as uuidv4 } from 'uuid';
const validUUID = uuidv4();
```

These methods generate valid UUIDs in the format: `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`

## Verification

To verify both fixes have been applied correctly:

1. Run `node verify-schema-fix.js` to check if the schema cache issue is resolved
2. Run `node test-uuid-fixes.js` to verify UUID handling works correctly

## Preventing Future Issues

### For Schema Cache Issues

- Always use `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` when adding new columns
- After schema changes, consider updating table comments to force cache refresh
- If issues persist, a project restart or server reload may be necessary

### For UUID Issues

- Always use `crypto.randomUUID()` or `uuidv4()` for test user IDs
- Never use custom string formats for UUID fields
- For debugging identification, consider adding a separate `test_label` column:

```sql
ALTER TABLE founders ADD COLUMN IF NOT EXISTS test_label TEXT;
```

```javascript
// Then you can use:
const testUser = {
  id: crypto.randomUUID(), // Valid UUID
  test_label: 'test-user-123' // For easy identification
};
```

## Additional Resources

- [PostgREST Schema Cache Documentation](https://postgrest.org/en/stable/schema_cache.html)
- [UUID Format Specification (RFC 4122)](https://tools.ietf.org/html/rfc4122)

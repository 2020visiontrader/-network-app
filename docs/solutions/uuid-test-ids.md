# Using Valid UUIDs in Test Files

This document provides guidance on properly using UUIDs in test files to ensure compatibility with Supabase's UUID column types.

## Problem

Many tests were failing with errors like:

```
❌ Test failed: invalid input syntax for type uuid: "test-1750659123094-84xa7h6yr"
```

This happens because Supabase expects columns of type `uuid` to contain valid UUID strings in the format `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`, but our tests were using string-based IDs like `test-<timestamp>-<suffix>`.

## Solution

All test files should use the `uuid` package to generate proper UUIDs for test user IDs.

### Installation

The UUID package is already installed in the project. If you need to install it in a different project:

```bash
npm install uuid
```

### Implementation

Replace manually constructed test IDs with proper UUID generation:

```javascript
// Before (invalid):
const testUserId = `test-${Date.now()}-${suffix}`;

// After (valid UUID):
import { v4 as uuidv4 } from 'uuid';
const testUserId = uuidv4();
```

For CommonJS modules:

```javascript
// Before (invalid):
const testUserId = `test-${Date.now()}-${suffix}`;

// After (valid UUID):
const { v4: uuidv4 } = require('uuid');
const testUserId = uuidv4();
```

### Automated Fix

We've created a utility script that automatically finds and fixes invalid UUID patterns in test files:

```bash
npm run fix-uuids
```

This script:
1. Searches all JavaScript and TypeScript files in the project
2. Identifies patterns like `id: 'test-123'` or `const testId = 'test-user-1'`
3. Replaces them with proper UUID generation using `uuidv4()`
4. Adds the necessary import/require statement if not already present

### Why This Matters

Using valid UUIDs in tests ensures:

1. **Type Compatibility**: Supabase's PostgreSQL database expects columns of type `uuid` to contain proper UUID values
2. **Error Prevention**: Avoids runtime errors from type mismatches
3. **Realistic Testing**: Tests with valid UUIDs better represent real-world usage
4. **Consistency**: Aligns test behavior with production behavior

## Database Considerations

If you absolutely need to use non-UUID values in a testing environment (not recommended), you would need to alter the column type in the database:

```sql
-- Only for testing environments (NOT recommended for production)
ALTER TABLE founders ALTER COLUMN user_id TYPE text;
```

However, it's strongly recommended to adapt your tests to use proper UUIDs rather than changing the database schema, as this ensures consistency between testing and production environments.

## Testing the Fix

After running the fix script, run your tests to ensure they pass without UUID syntax errors:

```bash
npm run test-system
```

## Common Test Patterns

Here are some common patterns for using UUIDs in tests:

### User Creation

```javascript
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  const userId = uuidv4();
  const email = `test-${userId.slice(0, 8)}@example.com`;
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'password123',
    user_metadata: { test_user: true }
  });
  
  if (error) throw error;
  return data.user;
}
```

### Database Insertions

```javascript
const { v4: uuidv4 } = require('uuid');

async function createTestFounder() {
  const userId = uuidv4();
  
  const { data, error } = await supabase
    .from('founders')
    .insert({
      user_id: userId,
      name: 'Test Founder',
      email: `founder-${userId.slice(0, 8)}@example.com`,
      profile_visible: true
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}
```

## Conclusion

By using proper UUIDs in tests, we ensure our tests are accurate representations of real-world usage and avoid database type mismatch errors.

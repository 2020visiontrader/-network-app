# Test Authentication Guide

This guide explains how to authenticate for running tests with full database access.

## Authentication Options

There are several ways to authenticate for tests:

### 1. Use Existing Credentials

If you already have a user account in your Supabase project:

```bash
# Login with specific credentials
npm run auth-login --email=your@email.com --password=yourpassword

# Or use the script directly
node scripts/working/auth-for-tests.js --email=your@email.com --password=yourpassword
```

### 2. Create a Test User (Requires Service Role Key)

For automated testing, you can create temporary test users:

```bash
# Create a random test user
npm run auth-create-user

# Or use the script directly with options
node scripts/working/auth-for-tests.js --create-test-user --auto-cleanup
```

This requires the `SUPABASE_SERVICE_ROLE_KEY` in your `.env` file.

### 3. Run Tests with Authentication in One Step

To run a test with authentication in a single command:

```bash
# Run with existing credentials
npm run auth-test scripts/working/test-database.js

# Run with a new test user
npm run auth-test scripts/working/test-database.js --create-test-user
```

## Authentication Management

Check your current authentication status:

```bash
npm run auth-status
```

Sign out when finished:

```bash
npm run auth-logout
```

## Environment Setup

For full authentication capabilities, add these to your `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key is only required for creating test users.

## Programmatic Usage

You can use the TestAuth class in your own scripts:

```javascript
const { TestAuth } = require('./scripts/working/test-auth');

async function runTest() {
  // Check current auth status
  const status = await TestAuth.getCurrentUser();
  
  if (!status.authenticated) {
    // Option 1: Sign in with credentials
    const { success, data } = await TestAuth.signInWithPassword('test@example.com', 'password');
    
    // Option 2: Create a test user (requires service role key)
    const { success, data, cleanup } = await TestAuth.createAndSignInTestUser();
    
    // Don't forget to clean up when done
    await cleanup();
  }
  
  // Run your test code here...
  
  // Sign out when done
  await TestAuth.signOut();
}
```

## Best Practices

1. **Use Temporary Test Users**: For CI/CD environments, create temporary users with `--create-test-user`
2. **Clean Up After Tests**: Always sign out and clean up test users with `--auto-cleanup`
3. **Separate Test Database**: Use a separate database for testing if possible
4. **Never Commit Keys**: Never commit your service role key to version control
5. **RLS Policies**: Design your RLS policies to allow proper testing

## Troubleshooting

If authentication fails:

1. Check your environment variables
2. Ensure your Supabase project allows email/password sign-ins
3. If creating test users fails, check your service role key permissions
4. If using CI/CD, ensure environment variables are properly set

# Database Fix Verification and Testing Guide

## Overview

This document outlines the process for verifying that the database fixes have been correctly applied and persist across application restarts. The verification script tests:

1. Schema constraints (NOT NULL, DEFAULT values)
2. RLS policy enforcement
3. Data access control
4. Helper function operation

## Prerequisites

- Node.js installed
- Supabase credentials in `.env` file
- Database fixes already applied via `final-permission-fix.sql`

## Running the Verification

You can run the verification test with:

```bash
npm run test:persistence
```

This script will:

1. Create test users and authenticate as them
2. Create founder profiles with different visibility settings
3. Test profile visibility rules based on RLS policies
4. Create and update connections between users
5. Test connection policy enforcement
6. Verify helper functions operation
7. Clean up test data when complete

## Expected Results

A successful test should show:

- ✅ Schema constraints verified
- ✅ Test users created and authenticated
- ✅ Founder profiles created with different visibility settings
- ✅ Visibility policies correctly enforced
- ✅ Connection policies correctly enforced
- ✅ Helper functions operating correctly
- ✅ Test data cleaned up successfully

## Persistence Testing

To test persistence across restarts:

1. Run the verification test
2. Restart your Supabase instance or application
3. Run the verification test again

If both tests pass, the database fixes are correctly applied and persistent.

## Troubleshooting

If tests fail, check:

1. **Policy Issues**:
   - Review the RLS policies in the Supabase dashboard
   - Make sure all policies are correctly configured with proper USING and WITH CHECK conditions

2. **Schema Issues**:
   - Verify column constraints in the Table Editor
   - Check that defaults are set correctly

3. **Authentication Issues**:
   - Ensure the Service Role Key has sufficient permissions
   - Check that user creation and authentication are working

4. **Connection Issues**:
   - Verify the URL and API keys in the .env file
   - Check that the database is accessible

## Next Steps

After successful verification:

1. Document the fix implementation date
2. Monitor application performance
3. Run application integration tests
4. Update documentation for developers

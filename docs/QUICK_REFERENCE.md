# NetworkFounderApp Quick Reference Guide

## Database Schema

### Founders Table

| Column Name       | Type      | Description                     | Default |
|-------------------|-----------|---------------------------------|---------|
| id                | UUID      | Primary key                     | uuid_generate_v4() |
| user_id           | UUID      | Foreign key to auth.users       | null    |
| email             | TEXT      | User email                      | null    |
| full_name         | TEXT      | Full name                       | null    |
| company_name      | TEXT      | Company name                    | null    |
| role              | TEXT      | User role                       | null    |
| profile_visible   | BOOLEAN   | Whether profile is discoverable | true    |
| onboarding_completed | BOOLEAN | Onboarding status              | false   |

## RLS Policies

### Founders Table

| Policy Name                | Operation | Description                               |
|----------------------------|-----------|-------------------------------------------|
| founders_deny_anon         | ALL       | Block anonymous access (restrictive)      |
| founders_read_own          | SELECT    | Users can read their own profiles         |
| founders_read_others_visible | SELECT  | Users can read other visible profiles     |
| founders_update_own        | UPDATE    | Users can update their own profiles       |
| founders_insert_own        | INSERT    | Users can insert their own profiles       |
| founders_delete_own        | DELETE    | Users can delete their own profiles       |
| founders_service_role_all  | ALL       | Service role has full access              |

## Best Practices

### Database Queries

#### Use `.maybeSingle()` instead of `.single()`

```typescript
// RECOMMENDED:
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle(); // ✅ Returns null if not found, no error

if (error) {
  // Handle database errors
} else if (data === null) {
  // Handle not found condition
} else {
  // Process the data
}
```

### Authentication

#### Service Role for Admin Operations

```typescript
// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

#### User Role for Regular Operations

```typescript
// Use anon key for user operations (RLS will apply)
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);
```

## Common Issues & Solutions

### RLS Policy Errors

If you get "violates row-level security policy" errors:
1. Check if you're authenticated properly
2. Verify you're using the correct user ID in queries
3. For admin operations, use the service role key

### Schema Cache Issues

If database columns aren't recognized:
1. Run the schema cache refresh SQL
2. Restart your application
3. Use only documented column names

### Testing

For complete testing:
1. Test with anonymous access (should be blocked)
2. Test with authenticated users (should work with restrictions)
3. Test with service role (should have full access)

## Documentation Reference

See these files for detailed information:
- `docs/solutions/visibility-column-standardization.md`
- `docs/solutions/COLUMN_RLS_FIX_STATUS.md`
- `docs/solutions/single-vs-maybeSingle.md`
- `docs/IMPLEMENTATION_REPORT.md`

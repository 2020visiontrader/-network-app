# Network App - Database Schema Guide for AI Builder

## Supabase Structure

In our Supabase setup, `auth.users` is a system table managed by Supabase Auth. We do not have a `public.users` table. Instead, we use `public.founders` as our main user profile table.

## Correct Table Structure

These are the tables in our database schema:

1. `founders` - Main user profile table, linked to `auth.users` via `id`
2. `connections` - User connections/network relationships
3. `masterminds` - Mastermind groups and sessions
4. `location_shares` - Geographic location sharing between users
5. `notifications` - User notifications and alerts
6. `travel_plans` - User travel itineraries
7. `event_attendees` - Users attending events
8. `coffee_chats` - 1:1 meeting arrangements
9. `event_hosting` - Events created by users (NOT "events")
10. `availability_status` - User availability for meetings

## Key Fields

- **User Identity**: When referring to a user's identity, use the `id` field from `auth.users` which is also the `id` field in the `founders` table. 
- **User Relationships**: User relationships should reference the `id` field, not email.

## Common Errors to Avoid

1. Do not reference a `public.users` table - it doesn't exist
2. Always use `event_hosting` instead of `events`
3. The `founders` table's primary key (`id`) is the same as the user's ID in `auth.users`
4. The `user_id` field in `founders` must match the user's ID in `auth.users`

## Example Query

```sql
-- Correct way to query a user's profile
SELECT f.*
FROM public.founders f
WHERE f.id = auth.uid();

-- Correct way to join founders with connections
SELECT f.full_name, f.company_name
FROM public.connections c
JOIN public.founders f ON f.id = c.connected_user_id
WHERE c.user_id = auth.uid();
```

## AI Builder Instructions

When building SQL or code, always:
1. Reference `auth.users` when referring to authentication data
2. Use `founders` for user profile data
3. Use `event_hosting` instead of `events`
4. Remember that all user relations connect to the `id` field
5. Use `user_id` and `id` consistently according to table definitions

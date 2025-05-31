# Supabase Admin Setup Guide

## Overview
Network app now uses Supabase as the primary admin interface and data provider. All user management, analytics, and system administration is handled through the Supabase Dashboard.

## Admin Access

### 1. Supabase Dashboard
- **URL**: https://supabase.com/dashboard
- **Login**: Use your Supabase account credentials
- **Project**: Select your Network app project

### 2. Key Admin Functions

#### User Management
- **Table**: `users`
- **Actions**:
  - View all users and their status
  - Update user status (active, pending, waitlisted, suspended)
  - Modify profile completion progress
  - Toggle ambassador status
  - View user creation dates and activity

#### Waitlist Management
- **Table**: `waitlist`
- **Actions**:
  - Review pending applications
  - Approve/decline users
  - View referral information
  - Track application timestamps

#### Analytics & Metrics
- **Tables**: `coffee_chats`, `masterminds`, `introductions`, `events`, `usage_metrics`
- **Views**:
  - Real-time activity counts
  - User engagement metrics
  - Feature usage statistics
  - Growth tracking

#### System Alerts (Optional)
- **Table**: `system_alerts`
- **Actions**:
  - Create system-wide notifications
  - Set expiration dates
  - Toggle active/inactive status
  - Manage maintenance messages

## Database Schema

### Core Tables
```sql
-- Users table
users (
  id uuid primary key,
  email text unique,
  name text,
  status text check (status in ('active', 'pending', 'waitlisted', 'suspended')),
  profile_progress integer default 0,
  is_ambassador boolean default false,
  approved_at timestamp,
  is_active boolean default true,
  created_at timestamp default now()
)

-- Waitlist table
waitlist (
  id uuid primary key,
  name text,
  email text,
  linkedin_url text,
  reason text,
  status text check (status in ('pending', 'approved', 'declined')),
  referred_by text,
  created_at timestamp default now()
)

-- Activity tables
coffee_chats (
  id uuid primary key,
  user_id uuid references users(id),
  partner_id uuid references users(id),
  status text,
  scheduled_at timestamp,
  created_at timestamp default now()
)

masterminds (
  id uuid primary key,
  host_id uuid references users(id),
  title text,
  description text,
  max_participants integer,
  scheduled_at timestamp,
  created_at timestamp default now()
)

introductions (
  id uuid primary key,
  requester_id uuid references users(id),
  person_a_id uuid references users(id),
  person_b_id uuid references users(id),
  status text,
  created_at timestamp default now()
)

events (
  id uuid primary key,
  host_id uuid references users(id),
  title text,
  description text,
  event_date timestamp,
  location text,
  max_attendees integer,
  created_at timestamp default now()
)
```

## Admin Workflows

### 1. User Approval Process
1. Go to `waitlist` table in Supabase
2. Filter by `status = 'pending'`
3. Review application details
4. Update `status` to 'approved' or 'declined'
5. For approved users, create entry in `users` table with:
   - `status = 'active'`
   - `profile_progress = 0`
   - `approved_at = now()`

### 2. User Management
1. Go to `users` table
2. Use filters to find specific users
3. Update fields directly:
   - Change status for suspensions
   - Toggle ambassador privileges
   - Monitor profile completion

### 3. Analytics Monitoring
1. Use SQL queries in Supabase SQL Editor:
```sql
-- User growth
SELECT DATE(created_at) as date, COUNT(*) as new_users
FROM users 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;

-- Activity summary
SELECT 
  (SELECT COUNT(*) FROM coffee_chats WHERE created_at >= NOW() - INTERVAL '7 days') as coffee_chats_week,
  (SELECT COUNT(*) FROM masterminds WHERE created_at >= NOW() - INTERVAL '7 days') as masterminds_week,
  (SELECT COUNT(*) FROM introductions WHERE created_at >= NOW() - INTERVAL '7 days') as introductions_week,
  (SELECT COUNT(*) FROM events WHERE created_at >= NOW() - INTERVAL '7 days') as events_week;

-- User status breakdown
SELECT status, COUNT(*) as count
FROM users
GROUP BY status;
```

### 4. System Maintenance
1. Use Row Level Security (RLS) policies for data protection
2. Set up automated backups
3. Monitor database performance
4. Use Supabase Edge Functions for automated tasks

## Security & Permissions

### Row Level Security (RLS)
Enable RLS on all tables and create policies:

```sql
-- Example: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Admins can see all data (replace with actual admin user IDs)
CREATE POLICY "Admins can view all data" ON users
FOR ALL USING (auth.uid() IN ('admin-uuid-1', 'admin-uuid-2'));
```

### Admin User Setup
1. Create admin users in Supabase Auth
2. Add their UUIDs to admin policies
3. Grant necessary permissions for data management

## Monitoring & Alerts

### Database Monitoring
- Use Supabase Dashboard metrics
- Set up alerts for high usage
- Monitor query performance

### Application Monitoring
- Track user growth trends
- Monitor feature adoption
- Watch for error patterns

## Backup & Recovery

### Automated Backups
- Supabase provides automatic backups
- Configure retention period
- Test restore procedures

### Data Export
- Use Supabase CLI for data exports
- Regular CSV exports for analytics
- API-based data synchronization

## Support & Troubleshooting

### Common Issues
1. **User can't log in**: Check user status in `users` table
2. **Features not working**: Verify user profile completion
3. **Data inconsistencies**: Run data validation queries

### Escalation
- Supabase Support for platform issues
- Database performance optimization
- Custom function development

---

**Note**: This setup eliminates the need for a custom admin panel while providing full administrative control through Supabase's robust interface.

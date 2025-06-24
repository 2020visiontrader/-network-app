# Row Level Security (RLS) Policy Guide for NetworkFounderApp

## Overview

This guide explains the Row Level Security (RLS) policies implemented for the NetworkFounderApp, focusing on the `founders` table. Proper RLS policies are crucial for ensuring that users can only access and modify data they're authorized to interact with.

## Final RLS Policies for Founders Table

### Policy Strategy

We've implemented a comprehensive approach to RLS with multiple layers of security:

1. **Primary Restrictive Policy**: Blocks anonymous access completely
2. **Permissive Policies**: Allow specific operations for authenticated users on their own records
3. **Secondary Restrictive Policies**: Prevent specific destructive operations on other users' records

This multi-layered approach ensures maximum security while allowing appropriate access.

### Specific Policies

#### Primary Restrictive Policy

```sql
CREATE POLICY "founders_deny_anon"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR ALL
  USING (auth.uid() IS NOT NULL);
```

This policy blocks all operations for non-authenticated users. It's marked as `RESTRICTIVE`, which means it overrides any permissive policies. This ensures that anonymous users cannot access the table, regardless of other policies.

#### Permissive Policies for Authenticated Users

1. **SELECT Own Records**:
```sql
CREATE POLICY "founders_select_own"
  ON "public"."founders" 
  FOR SELECT
  USING (auth.uid() = user_id);
```
This policy allows users to view their own profile, regardless of its visibility status.

2. **SELECT Visible Profiles**:
```sql
CREATE POLICY "founders_select_visible"
  ON "public"."founders"
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    auth.uid() != user_id AND
    profile_visible = true
  );
```
This policy allows users to discover other founders' profiles that are marked as visible.

3. **INSERT Own Records**:
```sql
CREATE POLICY "founders_insert_own"
  ON "public"."founders"
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```
This policy ensures users can only create profiles linked to their own user ID.

4. **UPDATE Own Records**:
```sql
CREATE POLICY "founders_update_own"
  ON "public"."founders"
  FOR UPDATE
  USING (auth.uid() = user_id);
```
This policy ensures users can only update their own profile.

5. **DELETE Own Records**:
```sql
CREATE POLICY "founders_delete_own"
  ON "public"."founders"
  FOR DELETE
  USING (auth.uid() = user_id);
```
This policy ensures users can only delete their own profile.

#### Secondary Restrictive Policies

6. **RESTRICT UPDATE on Others' Records**:
```sql
CREATE POLICY "founders_restrict_update_others"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR UPDATE
  USING (auth.uid() = user_id);
```
This restrictive policy adds an extra layer of security by explicitly preventing updates to other users' records.

7. **RESTRICT DELETE on Others' Records**:
```sql
CREATE POLICY "founders_restrict_delete_others"
  ON "public"."founders"
  AS RESTRICTIVE
  FOR DELETE
  USING (auth.uid() = user_id);
```
This restrictive policy adds an extra layer of security by explicitly preventing deletion of other users' records.

## Security Principles

The final RLS policies follow these security principles:

1. **Defense in Depth**: Multiple layers of policies (primary restrictive + permissive + secondary restrictive)
2. **Least Privilege**: Users can only perform operations they specifically need
3. **Separation of Concerns**: Each policy handles a specific operation type
4. **Redundant Protection**: Critical operations (UPDATE, DELETE) are protected by both permissive and restrictive policies
5. **Visibility Control**: Profiles can be public or private based on `profile_visible`

## Verification

To verify these policies are working correctly, we've created a comprehensive verification script:

```
node enhanced-rls-verification.js
```

This script tests:
- Anonymous access restrictions
- Operations on own records
- Operations on other users' records
- Visibility access control

## Common Issues and Solutions

### Issue: Users can modify other users' profiles

**Solution**: Use both permissive and restrictive policies for UPDATE and DELETE operations. The permissive policies allow users to modify their own records, while the restrictive policies block modifications to others' records.

### Issue: Anonymous users can access the database

**Solution**: Implement a RESTRICTIVE policy that blocks all operations for non-authenticated users.

### Issue: RLS policies not being applied

**Solution**: Make sure RLS is enabled for the table:

```sql
ALTER TABLE "public"."founders" ENABLE ROW LEVEL SECURITY;
```

## Best Practices

1. **Use Defense in Depth**: Implement multiple layers of security through both permissive and restrictive policies
2. **Test Thoroughly**: Always verify RLS policies with comprehensive tests
3. **Use Specific Operations**: Prefer specific operation policies (SELECT, UPDATE, etc.) over general FOR ALL policies
4. **Document Policies**: Keep documentation of all RLS policies up to date
5. **Regular Audits**: Periodically review and test RLS policies to ensure they're working as expected

## Conclusion

The final RLS policies implemented for NetworkFounderApp provide robust security with multiple layers of protection. By combining permissive policies for specific operations with restrictive policies that block anonymous access and prevent modification of others' records, we've created a secure system that still allows appropriate access for collaboration and discovery.

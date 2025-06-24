# Understanding PostgreSQL RLS Policies

## Background

When working with Row Level Security (RLS) in PostgreSQL, it's important to understand how policies are stored and displayed in system views like `pg_policies`.

## How PostgreSQL Stores Policy Conditions

PostgreSQL uses different columns in `pg_policies` for different types of policy conditions:

1. `qual` column: Stores conditions for SELECT, UPDATE, and DELETE policies (from USING clause)
2. `with_check` column: Stores conditions for INSERT policies (from WITH CHECK clause)

When you query `pg_policies`, you might see:

```
| cmd    | qual                  | with_check            |
|--------|----------------------|----------------------|
| SELECT | (user_id = auth.uid()) | null                 |
| INSERT | null                 | (user_id = auth.uid()) |
```

## Common Misunderstanding

A common misunderstanding is thinking that INSERT policies with `null` in the `qual` column are broken or missing conditions. This is actually normal and expected behavior. For INSERT policies:

- `qual` will show as `null` (this is normal)
- The actual condition is stored in the `with_check` column

## How to Properly Verify Policies

To properly verify your RLS policies, always include both the `qual` and `with_check` columns in your query:

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM
    pg_policies
WHERE
    schemaname = 'public';
```

## Policy Types and Their Required Clauses

| Policy Type | Required Clause | Where Condition is Stored |
|-------------|----------------|--------------------------|
| SELECT      | USING          | qual                     |
| INSERT      | WITH CHECK     | with_check               |
| UPDATE      | USING          | qual                     |
| DELETE      | USING          | qual                     |

## Example of Correct Policy Definition

```sql
-- SELECT policy (condition in qual column)
CREATE POLICY select_policy ON my_table
  FOR SELECT USING (user_id = auth.uid());

-- INSERT policy (condition in with_check column)
CREATE POLICY insert_policy ON my_table
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

## Debugging Tips

1. If your INSERT policy doesn't work as expected, check the `with_check` column, not the `qual` column.
2. For testing INSERT policies, use test data that should both pass and fail the policy to confirm it's working.
3. Remember that RLS policies are additive - if multiple policies apply to the same operation, access is granted if ANY of them allows it.

## Conclusion

Understanding how PostgreSQL stores and applies RLS policies is critical for proper security implementation. By checking both `qual` and `with_check` columns, you can ensure your policies are correctly defined and applied.

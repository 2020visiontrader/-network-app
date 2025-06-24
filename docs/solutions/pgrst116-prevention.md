# PGRST116 Error Prevention Guide

## ✅ SAFE PATTERN: Use .maybeSingle()

```typescript
// ✅ CORRECT: Safe for 0 or 1 rows
const { data: founder, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();

if (error) {
  console.error('Database error:', error);
  return;
}

if (!founder) {
  console.log('No founder found - this is safe');
  return;
}

// founder exists, proceed safely
console.log('Found founder:', founder.full_name);
```

## ❌ AVOID: .single() throws PGRST116

```typescript
// ❌ DANGEROUS: Throws if 0 rows or >1 rows
const { data: founder, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .single(); // THROWS PGRST116 if no rows!
```

## 🔄 ALTERNATIVE: .limit(1) + manual check

```typescript
// ✅ ALTERNATIVE: Manual limit + array check
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .limit(1);

const founder = data?.[0] || null;
```

## 🛡️ Error Handling Best Practices

1. **Always check for error first**
2. **Always check for null/undefined data**
3. **Use .maybeSingle() for single-row expectations**
4. **Use .limit(1) + array access for manual control**
5. **Never use .single() in production code**

Generated: 2025-06-23T05:52:07.229Z

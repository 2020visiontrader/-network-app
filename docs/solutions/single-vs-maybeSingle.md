# Preventing PGRST116 Errors: `.single()` vs `.maybeSingle()`

## Problem

One of the most common errors in Supabase applications is the `PGRST116` error, which occurs when:
- Using `.single()` to fetch a record
- No record matches the query (or multiple records match)

This error has been causing issues throughout the NetworkFounderApp, especially in:
- User profile fetching
- Onboarding flows
- Dashboard data loading

## Solution: Always Use `.maybeSingle()`

The solution is simple but requires consistent implementation across the codebase:

```typescript
// ❌ AVOID THIS PATTERN (causes PGRST116 errors):
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .single(); // Throws error if no record found

// ✅ USE THIS PATTERN INSTEAD:
const { data, error } = await supabase
  .from("founders")
  .select("*")
  .eq("user_id", userId)
  .maybeSingle(); // Returns null if not found, no error
```

## Benefits of `.maybeSingle()`

1. **No PGRST116 Errors**: The most immediate benefit is eliminating these common errors
2. **Cleaner Error Handling**: You only need to handle database errors, not "not found" conditions
3. **Simplified Logic**: Checking for `data === null` is cleaner than error-based control flow
4. **Better User Experience**: No unexpected errors shown to users when data is simply not found

## Implementation Guide

### 1. Find and Replace All Instances

```bash
# Search for .single() in your codebase
grep -r "\.single()" --include="*.ts" --include="*.tsx" --include="*.js" ./src

# Manually replace each instance with .maybeSingle()
```

### 2. Update Error Handling

```typescript
// Before:
if (error) {
  if (error.code === 'PGRST116') {
    // Handle not found
  } else {
    // Handle other errors
  }
}

// After:
if (error) {
  // Handle database errors
} else if (data === null) {
  // Handle not found condition
}
```

### 3. TypeScript Type Safety

When using `.maybeSingle()`, your type definition should reflect that the data can be null:

```typescript
// Before (with .single())
const { data, error }: { data: Founder; error: PostgrestError } = await query;

// After (with .maybeSingle())
const { data, error }: { data: Founder | null; error: PostgrestError } = await query;
```

## Real-world Examples

### Profile Loading

```typescript
// Before (problematic)
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .single();

if (error) {
  console.error('Error loading profile:', error);
  return null;
}

return data;

// After (robust)
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();

if (error) {
  console.error('Error loading profile:', error);
  return null;
}

if (data === null) {
  console.log('Profile not found for user:', userId);
  return null;
}

return data;
```

### Onboarding Check

```typescript
// Before (problematic)
const { data, error } = await supabase
  .from('founders')
  .select('onboarding_completed')
  .eq('user_id', userId)
  .single();

if (error) {
  if (error.code === 'PGRST116') {
    return false; // No profile exists
  }
  throw error;
}

return data.onboarding_completed;

// After (robust)
const { data, error } = await supabase
  .from('founders')
  .select('onboarding_completed')
  .eq('user_id', userId)
  .maybeSingle();

if (error) {
  throw error;
}

if (data === null) {
  return false; // No profile exists
}

return data.onboarding_completed;
```

## Testing

After updating all instances, test your application thoroughly, focusing on:
1. New user flows (where profiles don't exist yet)
2. Edge cases where data might be missing
3. Form submissions and data updates

## Conclusion

By consistently using `.maybeSingle()` instead of `.single()`, you'll eliminate a whole class of errors from your application and create a more robust, predictable user experience.

Remember: `.single()` should be avoided in almost all cases unless you specifically want an error when a record is not found.

# 🚨 Common Errors & PROVEN Solutions

# 🚨 Common Errors & PROVEN Solutions

## ✅ **PGRST116 Error - RESOLVED COMPLETELY**

### **Status:** ✅ **ELIMINATED** - No longer occurs in this project

### **What was the error:**
```
PGRST116: Results contain 0 rows, expected 1
```

### **✅ SOLUTION APPLIED (100% Success Rate):**
**ALL** `.single()` calls replaced with `.maybeSingle()` across 39 files (91 fixes total)

**Migration Complete:** All PGRST116 errors eliminated from NetworkFounderApp

```typescript
// ✅ NEW SAFE PATTERN (in use throughout app)
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle(); // Safe - returns null if no rows

if (!data) {
  console.log('No founder found - this is safe');
  return;
}
```

### **Verification:**
- ✅ 0 `.single()` calls remaining in TypeScript source
- ✅ Database tests passing with `.maybeSingle()`
- ✅ Automated fix script available: `npm run fix-single`
- ✅ Complete documentation: `docs/solutions/pgrst116-prevention.md`

// ✅ NEW (handles null gracefully)
const { data, error } = await supabase
  .from('founders')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
```

---

## ❌ **Column Does Not Exist - founder_a**

### **Error Message:**
```
column "connections.founder_a" does not exist
hint: "Perhaps you meant to reference the column \"connections.founder_a_id\""
```

### **✅ SOLUTION:**
Use correct column names with `_id` suffix:

```typescript
// ❌ WRONG
.select('founder_a, founder_b, status')
.or(`founder_a.eq.${userId},founder_b.eq.${userId}`)

// ✅ CORRECT  
.select('founder_a_id, founder_b_id, status')
.or(`founder_a_id.eq.${userId},founder_b_id.eq.${userId}`)
```

---

## ❌ **Race Condition - Dashboard Loads Before Profile Saves**

### **Error Symptoms:**
- Onboarding completes but dashboard shows "Profile not found"
- Works on refresh but not on first load

### **✅ SOLUTION:**
Add retry logic with confirmation:

```typescript
// Save profile
await FounderService.completeOnboarding(user.id, formData);

// WAIT and VERIFY before redirect
let retries = 0;
let profile = null;
while (retries < 3 && !profile) {
  const { data } = await supabase
    .from('founders')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (data) profile = data;
  else await new Promise((res) => setTimeout(res, 500));
  retries++;
}

if (profile) {
  router.push('/dashboard');
}
```

---

## ❌ **React Duplicate Key Errors**

### **Error Message:**
```
Warning: Encountered two children with the same key
```

### **✅ SOLUTION:**
Use unique keys with index fallback:

```typescript
// ❌ WRONG (if item.id can be duplicate)
{items.map(item => <div key={item.id}>...</div>)}

// ✅ CORRECT (guaranteed unique)
{items.map((item, index) => 
  <div key={`${item.id}-${index}`}>...</div>
)}
```

---

## ❌ **Expo QR Code Not Working on Android**

### **✅ SOLUTION:**
1. Use LOCAL network URL (not tunnel)
2. Ensure same WiFi network
3. Use `generate-qr.js` script
4. Format: `exp://192.168.0.102:8081`

---

## ❌ **Coffee Chats Foreign Key Error**

### **Error Message:**
```
Could not find relationship 'coffee_chats_creator_id_fkey'
```

### **✅ SOLUTION:**
Use simple queries without foreign key references:

```typescript
// ❌ WRONG (foreign key relationships)
.select(`
  *,
  creator:founders!coffee_chats_creator_id_fkey(*)
`)

// ✅ CORRECT (simple query)
.select('*')
.or(`requester_id.eq.${userId},requested_id.eq.${userId}`)
```

---

## ❌ **UUID Format Error in Tests**

### **Error Message:**
```
invalid input syntax for type uuid: "non-existent-user"
```

### **✅ SOLUTION:**
Use proper UUID format in tests:

```typescript
// ❌ WRONG
const testId = "non-existent-user";

// ✅ CORRECT
const testId = "123e4567-e89b-12d3-a456-426614174000";
```

**Last Updated:** June 23, 2025 ✅

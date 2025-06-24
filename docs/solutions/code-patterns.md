# 🔧 Working Code Patterns & Best Practices

## ✅ **PROVEN Patterns (Tested June 23, 2025)**

### **1. Supabase Query Pattern**
```typescript
// ✅ ALWAYS use this pattern
const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('column_name', value)
  .maybeSingle(); // NEVER use .single()

// Handle result properly
if (error) {
  console.error('Database error:', error);
  return { success: false, error: error.message };
}

if (!data) {
  console.log('No record found');
  return { success: true, data: null };
}

return { success: true, data };
```

### **2. Race Condition Prevention**
```typescript
// ✅ ALWAYS verify data exists before redirect
async function saveAndRedirect(userId, formData) {
  // Save data
  const saveResult = await service.save(userId, formData);
  if (!saveResult.success) return;

  // VERIFY data exists before redirect
  let retries = 0;
  let verified = false;
  
  while (retries < 3 && !verified) {
    const { data } = await supabase
      .from('table')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (data) {
      verified = true;
    } else {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
  }
  
  if (verified) {
    router.push('/next-page');
  } else {
    console.error('Data verification failed after retries');
  }
}
```

### **3. React List Rendering**
```typescript
// ✅ ALWAYS use unique keys
{items.map((item, index) => (
  <Component 
    key={`${item.id || 'item'}-${index}`}  // Guaranteed unique
    data={item}
  />
))}

// For nested data
{categories.map((category, catIndex) => (
  <div key={`category-${catIndex}`}>
    {category.items.map((item, itemIndex) => (
      <Item 
        key={`${category.id}-${item.id}-${itemIndex}`}
        data={item}
      />
    ))}
  </div>
))}
```

### **4. Error Handling Pattern**
```typescript
// ✅ COMPREHENSIVE error handling
async function apiCall() {
  try {
    const { data, error } = await supabase
      .from('table')
      .select('*')
      .maybeSingle();

    // Supabase-specific error
    if (error) {
      console.error('[Supabase Error]', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      return { success: false, error: error.message };
    }

    // No data found (not an error with maybeSingle)
    if (!data) {
      console.log('[Info] No record found');
      return { success: true, data: null };
    }

    return { success: true, data };

  } catch (err) {
    // Unexpected JavaScript error
    console.error('[Unexpected Error]', err);
    return { 
      success: false, 
      error: 'An unexpected error occurred' 
    };
  }
}
```

### **5. Loading State Management**
```typescript
// ✅ PROPER loading states
const [loadState, setLoadState] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');
const [data, setData] = useState(null);
const [error, setError] = useState('');

async function loadData() {
  setLoadState('loading');
  
  try {
    const result = await apiCall();
    
    if (!result.success) {
      setLoadState('error');
      setError(result.error);
      return;
    }
    
    if (!result.data) {
      setLoadState('empty');
      return;
    }
    
    setData(result.data);
    setLoadState('success');
    
  } catch (err) {
    setLoadState('error');
    setError('Failed to load data');
  }
}

// UI rendering
if (loadState === 'loading') return <LoadingSpinner />;
if (loadState === 'error') return <ErrorMessage error={error} onRetry={loadData} />;
if (loadState === 'empty') return <EmptyState />;
return <DataDisplay data={data} />;
```

### **6. Database Column Reference**
```typescript
// ✅ ALWAYS use correct column names (with _id suffix)
const connections = await supabase
  .from('connections')
  .select('founder_a_id, founder_b_id, status')  // NOT founder_a, founder_b
  .or(`founder_a_id.eq.${userId},founder_b_id.eq.${userId}`);

const coffeeChats = await supabase
  .from('coffee_chats')
  .select('requester_id, requested_id, status')  // NOT creator_id, target_user_id
  .or(`requester_id.eq.${userId},requested_id.eq.${userId}`);
```

### **7. Deduplication Utility**
```typescript
// ✅ REUSABLE deduplication function
function dedupeBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// Usage
const uniqueFounders = dedupeBy(allFounders, 'id');
const uniqueConnections = dedupeBy(connections, 'founder_a_id');
```

## 🚨 **AVOID These Patterns**

```typescript
// ❌ NEVER use .single()
.single()

// ❌ NEVER use hardcoded column names without verification
.select('founder_a, founder_b')  // Check actual schema!

// ❌ NEVER redirect without verification
await save();
router.push('/dashboard');  // Race condition risk

// ❌ NEVER use non-unique keys
key={item.id}  // Could be duplicate

// ❌ NEVER ignore error details
if (error) return;  // Log the error details!
```

**Last Updated:** June 23, 2025 ✅

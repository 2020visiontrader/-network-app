# Advanced Race Condition Prevention Patterns

This document provides detailed guidance on implementing advanced race condition prevention patterns beyond simple retries.

## Table of Contents
1. [Circuit Breaker Pattern](#circuit-breaker-pattern)
2. [Queue-based Processing](#queue-based-processing)
3. [Real-time Database Listeners](#real-time-database-listeners)
4. [Server-side Verification](#server-side-verification)

## Available Implementations

These patterns are available in the `src/lib/advanced-race-patterns.ts` module:

```typescript
import { 
  CircuitBreaker, 
  QueueProcessor,
  RealtimeListener,
  ServerSideVerification
} from '../lib/advanced-race-patterns';
```

## Circuit Breaker Pattern

The Circuit Breaker pattern prevents cascading failures during system-wide issues by temporarily "opening the circuit" after multiple failures.

### When to Use

- When your application makes calls to external services that may be unavailable
- When specific operations consistently fail and need to be temporarily disabled
- To prevent overwhelming an already struggling system with repeated retry attempts

### Example Usage

```typescript
import { CircuitBreaker } from '../lib/advanced-race-patterns';
import { supabase } from '../lib/supabase';

// Create a circuit breaker for database operations
const databaseCircuit = new CircuitBreaker({
  failureThreshold: 5,       // Open after 5 consecutive failures
  resetTimeout: 30000,       // Try again after 30 seconds
  onOpen: () => {
    // Notify developers that the database is having issues
    console.error('⚠️ Database circuit opened - experiencing issues');
    // Maybe show a maintenance message to users
  },
  onClose: () => {
    console.log('✅ Database circuit closed - operations normal');
  }
});

// Use the circuit breaker to protect database operations
async function saveUserProfile(userId, profileData) {
  try {
    return await databaseCircuit.execute(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...profileData })
        .select()
        .maybeSingle();
        
      if (error) throw error;
      return data;
    });
  } catch (error) {
    if (error.message.includes('Circuit breaker is OPEN')) {
      // Handle gracefully - maybe use cached data or show maintenance message
      console.log('Using fallback due to circuit breaker');
      return null;
    }
    throw error;
  }
}
```

## Queue-based Processing

Queue-based processing prevents race conditions by managing concurrent operations and providing controlled retries for time-consuming tasks.

### When to Use

- For processing large batches of data without overwhelming the database
- When managing complex workflows that should happen in a specific order
- For background tasks that shouldn't block the main application flow

### Example Usage

```typescript
import { QueueProcessor } from '../lib/advanced-race-patterns';
import { supabase } from '../lib/supabase';

// Create a queue processor for user onboarding tasks
const onboardingQueue = new QueueProcessor(
  // Process function - what to do with each item
  async (userData) => {
    // 1. Create user profile
    await supabase.from('profiles').upsert({
      id: userData.id,
      full_name: userData.name,
      email: userData.email
    });
    
    // 2. Set up initial preferences
    await supabase.from('preferences').insert({
      user_id: userData.id,
      theme: 'default',
      notifications_enabled: true
    });
    
    // 3. Send welcome email (via external API)
    await sendWelcomeEmail(userData.email);
    
    console.log(`Onboarding completed for ${userData.email}`);
  },
  // Options
  {
    concurrency: 2,       // Process 2 users at a time
    retryDelay: 5000,     // Wait 5 seconds between retries
    maxRetries: 3,        // Try up to 3 times
    onError: (error, item) => {
      console.error(`Error processing user ${item.data.email}:`, error);
    }
  }
);

// Add users to the onboarding queue
function queueUserOnboarding(userData, priority = 0) {
  const queueId = onboardingQueue.enqueue(userData, priority);
  console.log(`User ${userData.email} added to onboarding queue with ID: ${queueId}`);
  return queueId;
}

// Example usage in an API route
app.post('/api/users', async (req, res) => {
  const userData = req.body;
  
  try {
    // Create auth user immediately
    const { user, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password
    });
    
    if (error) throw error;
    
    // Queue the rest of the onboarding process
    const queueId = queueUserOnboarding({
      id: user.id,
      email: userData.email,
      name: userData.name
    });
    
    res.status(200).json({ 
      success: true, 
      message: 'User created, onboarding in progress',
      queueId
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

## Real-time Database Listeners

Real-time listeners prevent race conditions by receiving push notifications about data changes instead of polling, ensuring immediate updates.

### When to Use

- When you need immediate notification of database changes
- For collaborative features where multiple users might modify the same data
- To keep UI in sync with backend data without repeated fetching

### Example Usage

```typescript
import { RealtimeListener } from '../lib/advanced-race-patterns';
import { supabase } from '../lib/supabase';

// Create a listener for changes to the projects table
const projectsListener = new RealtimeListener(supabase, {
  table: 'projects',
  event: 'UPDATE',  // Only listen for updates
  filter: 'team_id=eq.123' // Only for specific team
});

// Start listening
projectsListener.start();

// Add a change handler
projectsListener.onChange('project-list-component', (payload) => {
  console.log('Project updated:', payload);
  
  // Update UI with new data
  if (payload.new && payload.new.id) {
    updateProjectInUI(payload.new);
  }
});

// In component cleanup
function cleanup() {
  // Remove listener when component unmounts
  projectsListener.removeListener('project-list-component');
  projectsListener.stop();
}

// Example function to update UI
function updateProjectInUI(project) {
  // Find project in list and update it
  const index = projectList.findIndex(p => p.id === project.id);
  if (index >= 0) {
    projectList[index] = { ...projectList[index], ...project };
    renderProjectList();
  }
}
```

## Server-side Verification

Server-side verification prevents race conditions by periodically checking data consistency and fixing issues automatically.

### When to Use

- For critical data that must remain consistent
- When client-side operations might fail to complete properly
- As a safety net for important business processes

### Example Usage

```typescript
import { ServerSideVerification } from '../lib/advanced-race-patterns';
import { supabase } from '../lib/supabase';

// Create a verification job for the orders table
const ordersVerification = new ServerSideVerification(
  supabase,
  {
    table: 'orders',
    idColumn: 'id',
    // Validator function - what makes a record valid?
    dataValidator: (order) => {
      return (
        // Order must have status
        order.status !== null &&
        // If completed, must have completion_date
        (order.status !== 'completed' || order.completion_date !== null) &&
        // If paid, must have payment_id
        (order.payment_status !== 'paid' || order.payment_id !== null)
      );
    },
    // Fix function - how to fix invalid records
    fixMissingData: async (orderId) => {
      console.log(`Fixing inconsistent order: ${orderId}`);
      
      // Get current order data
      const { data: order } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
        
      if (!order) return;
      
      // Fix missing completion date
      if (order.status === 'completed' && !order.completion_date) {
        await supabase
          .from('orders')
          .update({ completion_date: new Date().toISOString() })
          .eq('id', orderId);
      }
      
      // Check payment status against payment provider
      if (order.payment_status === 'paid' && !order.payment_id) {
        // Query payment provider API
        const paymentRecord = await paymentProvider.findPaymentForOrder(orderId);
        
        if (paymentRecord) {
          await supabase
            .from('orders')
            .update({ payment_id: paymentRecord.id })
            .eq('id', orderId);
        } else {
          // Revert to unpaid if no payment found
          await supabase
            .from('orders')
            .update({ payment_status: 'unpaid' })
            .eq('id', orderId);
        }
      }
    },
    interval: 3600000, // Run hourly
    batchSize: 50      // Check 50 records at a time
  }
);

// Start verification
ordersVerification.start();

// Get statistics periodically
setInterval(() => {
  const stats = ordersVerification.getStats();
  console.log('Order verification stats:', stats);
  
  // Alert if too many problems found
  if (stats.problemCount > 100) {
    sendAlertToAdmin('High number of order inconsistencies detected');
  }
}, 86400000); // Daily check
```

## Combining Patterns for Maximum Resilience

For critical operations, consider combining multiple patterns:

```typescript
import { 
  CircuitBreaker, 
  QueueProcessor,
  RealtimeListener,
  ServerSideVerification
} from '../lib/advanced-race-patterns';
import { supabase } from '../lib/supabase';

// 1. Circuit breaker for database operations
const databaseCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000
});

// 2. Queue for payment processing
const paymentQueue = new QueueProcessor(
  async (paymentData) => {
    // Process payment
    // ...
  },
  { concurrency: 1 } // Only process one payment at a time
);

// 3. Real-time listener for payment status updates
const paymentListener = new RealtimeListener(supabase, {
  table: 'payments',
  event: 'UPDATE'
});

// 4. Verification job for payment consistency
const paymentVerification = new ServerSideVerification(
  supabase,
  {
    table: 'payments',
    idColumn: 'id',
    dataValidator: (payment) => {
      // Validation logic
      // ...
    },
    fixMissingData: async (id) => {
      // Fix logic
      // ...
    },
    interval: 900000, // 15 minutes
    batchSize: 20
  }
);

// Start everything
paymentListener.start();
paymentVerification.start();

// Example: Process a payment with all safety mechanisms
async function processPayment(paymentData) {
  try {
    // Use circuit breaker to protect against system failures
    return await databaseCircuit.execute(async () => {
      // Queue the payment for processing
      paymentQueue.enqueue(paymentData, 10); // High priority
      
      return { success: true, message: 'Payment queued for processing' };
    });
  } catch (error) {
    if (error.message.includes('Circuit breaker is OPEN')) {
      return { success: false, message: 'Payment system temporarily unavailable' };
    }
    throw error;
  }
}
```

## Performance Considerations

- **Circuit Breaker**: Minimal overhead when closed, prevents cascading failures
- **Queue Processing**: Adds latency but improves throughput and stability
- **Real-time Listeners**: Low latency for updates, but requires WebSocket connection
- **Server-side Verification**: Run during off-peak hours to minimize impact

## Maintenance and Monitoring

All patterns include built-in statistics and monitoring capabilities:

```typescript
// Circuit breaker state
const circuitState = databaseCircuit.getState();

// Queue statistics
const queueStats = paymentQueue.getStats();

// Listener status
const listenerActive = paymentListener.isActive();

// Verification job statistics
const verificationStats = paymentVerification.getStats();
```

Use these to create dashboards and alerts for your application's health monitoring system.

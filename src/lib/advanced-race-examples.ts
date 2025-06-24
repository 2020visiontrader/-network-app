/**
 * Example implementations of advanced race condition patterns
 * 
 * This file demonstrates how to use the advanced race condition patterns
 * in various parts of the NetworkFounderApp.
 */
import { supabase } from './supabase';
import {
  CircuitBreaker,
  QueueProcessor,
  RealtimeListener,
  ServerSideVerification
} from './advanced-race-patterns';

// ------------------------------------------------------------
// 1. Circuit Breaker for Profile Fetching
// ------------------------------------------------------------

// Create a circuit breaker for profile operations
export const profileCircuitBreaker = new CircuitBreaker({
  failureThreshold: 3,       // Open after 3 consecutive failures
  resetTimeout: 10000,       // Try again after 10 seconds
  onOpen: () => {
    console.error('⚠️ Profile service circuit opened - experiencing issues');
    // Could trigger an event to show maintenance banner in UI
  },
  onClose: () => {
    console.log('✅ Profile service circuit closed - operations normal');
  }
});

/**
 * Fetch a user profile with circuit breaker protection
 */
export async function fetchProfileSafely(userId) {
  try {
    return await profileCircuitBreaker.execute(async () => {
      const { data, error } = await supabase
        .from('founders')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (error) throw error;
      if (!data) throw new Error('Profile not found');
      
      return data;
    });
  } catch (error) {
    if (error.message.includes('Circuit breaker is OPEN')) {
      // Return cached data or null during outage
      console.log('Using fallback for profile data due to circuit breaker');
      return null;
    }
    throw error;
  }
}

// ------------------------------------------------------------
// 2. Queue-based Onboarding Processing
// ------------------------------------------------------------

// Create a queue processor for onboarding tasks
export const onboardingQueue = new QueueProcessor(
  // Process function
  async (userData) => {
    console.log(`Processing onboarding for user ${userData.email}`);
    
    // 1. Create or update founder profile
    const { data: profile, error: profileError } = await supabase
      .from('founders')
      .upsert({
        id: userData.id,
        user_id: userData.id,
        email: userData.email,
        full_name: userData.fullName,
        company_name: userData.companyName,
        industry: userData.industry,
        onboarding_completed: true,
        profile_visible: userData.profileVisible || true,
        created_at: new Date().toISOString()
      })
      .select()
      .maybeSingle();
      
    if (profileError) throw profileError;
    
    // 2. Update preferences if provided
    if (userData.preferences) {
      const { error: prefError } = await supabase
        .from('preferences')
        .upsert({
          user_id: userData.id,
          ...userData.preferences
        });
        
      if (prefError) throw prefError;
    }
    
    // 3. Process avatar if provided
    if (userData.avatarBase64) {
      await uploadUserAvatar(userData.id, userData.avatarBase64);
    }
    
    console.log(`✅ Onboarding completed for ${userData.email}`);
    return profile;
  },
  // Options
  {
    concurrency: 2,     // Process 2 users at a time
    retryDelay: 3000,   // Wait 3 seconds between retries
    maxRetries: 3,      // Try up to 3 times
    onError: (error, item) => {
      console.error(`Error processing onboarding for ${item.data.email}:`, error);
    }
  }
);

/**
 * Queue a user for onboarding processing
 */
export function queueUserOnboarding(userData, priority = 0) {
  const queueId = onboardingQueue.enqueue(userData, priority);
  console.log(`User ${userData.email} added to onboarding queue with ID: ${queueId}`);
  return queueId;
}

/**
 * Helper to upload user avatar
 */
async function uploadUserAvatar(userId, base64Data) {
  // Implementation details...
  return true;
}

// ------------------------------------------------------------
// 3. Real-time Profile Updates Listener
// ------------------------------------------------------------

// Create a listener for profile updates
export const profileUpdatesListener = new RealtimeListener(supabase, {
  table: 'founders',
  event: 'UPDATE'
});

/**
 * Start listening for profile updates for a specific user
 */
export function startProfileUpdatesListener(userId, callback) {
  // Start the listener if not already started
  if (!profileUpdatesListener.isActive()) {
    profileUpdatesListener.start();
  }
  
  // Register this component's callback
  const listenerId = `profile-${userId}`;
  
  profileUpdatesListener.onChange(listenerId, (payload) => {
    // Only notify if it's for this user
    if (payload.new && payload.new.id === userId) {
      callback(payload.new);
    }
  });
  
  // Return a function to clean up the listener
  return () => {
    profileUpdatesListener.removeListener(listenerId);
  };
}

// Usage in a React component:
/*
useEffect(() => {
  // Set up real-time updates for this profile
  const cleanup = startProfileUpdatesListener(userId, (updatedProfile) => {
    setProfile(updatedProfile);
  });
  
  // Clean up on unmount
  return cleanup;
}, [userId]);
*/

// ------------------------------------------------------------
// 4. Server-side Onboarding Verification
// ------------------------------------------------------------

// Create a verification job for onboarding completion
export const onboardingVerification = new ServerSideVerification(
  supabase,
  {
    table: 'founders',
    idColumn: 'id',
    // Validator function - what makes onboarding valid?
    dataValidator: (founder) => {
      // Onboarding is considered complete if:
      return (
        // 1. Has onboarding_completed flag
        founder.onboarding_completed === true &&
        // 2. Has required fields
        founder.full_name &&
        founder.email &&
        // 3. Has a valid user_id (UUID)
        founder.user_id &&
        // 4. Has a created_at timestamp
        founder.created_at
      );
    },
    // Fix function - how to fix invalid records
    fixMissingData: async (founderId) => {
      console.log(`Fixing inconsistent onboarding for founder: ${founderId}`);
      
      // Get current founder data
      const { data: founder } = await supabase
        .from('founders')
        .select('*')
        .eq('id', founderId)
        .maybeSingle();
        
      if (!founder) return;
      
      // Prepare updates based on what's missing
      const updates = {};
      
      // Set timestamp if missing
      if (!founder.created_at) {
        updates.created_at = new Date().toISOString();
      }
      
      // Set user_id = id if missing (reasonable fallback)
      if (!founder.user_id) {
        updates.user_id = founderId;
      }
      
      // Apply fixes if needed
      if (Object.keys(updates).length > 0) {
        await supabase
          .from('founders')
          .update(updates)
          .eq('id', founderId);
          
        console.log(`✅ Fixed founder record: ${founderId}`);
      }
    },
    interval: 3600000, // Run hourly
    batchSize: 50      // Check 50 records at a time
  }
);

// Start verification automatically
onboardingVerification.start();

// Export all patterns for use in the application
export const AdvancedPatternExamples = {
  profileCircuitBreaker,
  fetchProfileSafely,
  onboardingQueue,
  queueUserOnboarding,
  profileUpdatesListener,
  startProfileUpdatesListener,
  onboardingVerification
};

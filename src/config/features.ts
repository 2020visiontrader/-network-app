/**
 * Feature flags for the Network app
 * 
 * This file controls which features are enabled or disabled.
 * Set flags to true to enable features, false to disable them.
 */

export const FEATURE_FLAGS = {
  // AI-powered features
  AI_EVENT_DISCOVERY: false,        // Hive tab AI event matching
  AI_SMART_INTRODUCTIONS: false,    // Smart introduction matching
  AI_NEURAL_MATCHING: false,        // Neural connection suggestions
  
  // External API integrations
  EVENTBRITE_API: false,            // Eventbrite event integration
  MEETUP_API: false,                // Meetup event integration
  LINKEDIN_API: false,              // LinkedIn profile integration
  
  // Advanced features
  REAL_TIME_NOTIFICATIONS: false,   // Real-time push notifications
  ADVANCED_ANALYTICS: false,        // User behavior analytics
  PREMIUM_FEATURES: false,          // Premium subscription features
  
  // Beta features
  VIDEO_CALLS: false,               // Integrated video calling
  CALENDAR_SYNC: false,             // External calendar synchronization
  EMAIL_AUTOMATION: false,          // Automated email introductions
} as const;

/**
 * Feature descriptions for documentation
 */
export const FEATURE_DESCRIPTIONS = {
  AI_EVENT_DISCOVERY: 'AI-powered event discovery based on user niche and location',
  AI_SMART_INTRODUCTIONS: 'Intelligent user matching for introductions',
  AI_NEURAL_MATCHING: 'Advanced neural network-based connection suggestions',
  EVENTBRITE_API: 'Integration with Eventbrite for real event data',
  MEETUP_API: 'Integration with Meetup for community events',
  LINKEDIN_API: 'LinkedIn profile integration and networking',
  REAL_TIME_NOTIFICATIONS: 'Push notifications for real-time updates',
  ADVANCED_ANALYTICS: 'Detailed user behavior and connection analytics',
  PREMIUM_FEATURES: 'Premium subscription features and capabilities',
  VIDEO_CALLS: 'Integrated video calling for virtual meetings',
  CALENDAR_SYNC: 'Synchronization with external calendar services',
  EMAIL_AUTOMATION: 'Automated email introductions and follow-ups',
} as const;

/**
 * Helper function to check if a feature is enabled
 */
export const isFeatureEnabled = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  return FEATURE_FLAGS[feature];
};

/**
 * Helper function to get feature description
 */
export const getFeatureDescription = (feature: keyof typeof FEATURE_FLAGS): string => {
  return FEATURE_DESCRIPTIONS[feature] || 'No description available';
};

/**
 * Development mode feature overrides
 * These can be used to enable features in development
 */
export const DEV_OVERRIDES = {
  // Uncomment to enable features in development
  // AI_EVENT_DISCOVERY: true,
  // AI_SMART_INTRODUCTIONS: true,
} as const;

/**
 * Get final feature flag value considering dev overrides
 */
export const getFeatureFlag = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  if (process.env.NODE_ENV === 'development' && feature in DEV_OVERRIDES) {
    return DEV_OVERRIDES[feature as keyof typeof DEV_OVERRIDES] ?? FEATURE_FLAGS[feature];
  }
  return FEATURE_FLAGS[feature];
};

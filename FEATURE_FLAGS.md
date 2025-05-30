# Feature Flags Documentation

This document explains how to manage feature flags in the Network app.

## Overview

The Network app uses feature flags to control which features are enabled or disabled. This allows for:

- **Safe Development**: Disable incomplete features in production
- **Gradual Rollouts**: Enable features for specific environments
- **A/B Testing**: Test different feature combinations
- **Emergency Rollbacks**: Quickly disable problematic features

## Configuration File

All feature flags are managed in `src/config/features.ts`.

### Current Feature Flags

| Feature | Status | Description |
|---------|--------|-------------|
| `AI_EVENT_DISCOVERY` | ❌ Disabled | AI-powered event discovery in Hive tab |
| `AI_SMART_INTRODUCTIONS` | ❌ Disabled | Smart introduction matching |
| `AI_NEURAL_MATCHING` | ❌ Disabled | Neural connection suggestions |
| `EVENTBRITE_API` | ❌ Disabled | Eventbrite event integration |
| `MEETUP_API` | ❌ Disabled | Meetup event integration |
| `LINKEDIN_API` | ❌ Disabled | LinkedIn profile integration |
| `REAL_TIME_NOTIFICATIONS` | ❌ Disabled | Real-time push notifications |
| `ADVANCED_ANALYTICS` | ❌ Disabled | User behavior analytics |
| `PREMIUM_FEATURES` | ❌ Disabled | Premium subscription features |
| `VIDEO_CALLS` | ❌ Disabled | Integrated video calling |
| `CALENDAR_SYNC` | ❌ Disabled | External calendar synchronization |
| `EMAIL_AUTOMATION` | ❌ Disabled | Automated email introductions |

## How to Enable Features

### 1. Production Deployment

Edit `src/config/features.ts` and change the flag value:

```typescript
export const FEATURE_FLAGS = {
  AI_EVENT_DISCOVERY: true,  // Changed from false to true
  // ... other flags
} as const;
```

### 2. Development Override

For development testing, use `DEV_OVERRIDES`:

```typescript
export const DEV_OVERRIDES = {
  AI_EVENT_DISCOVERY: true,        // Enable in development only
  AI_SMART_INTRODUCTIONS: true,    // Enable in development only
} as const;
```

### 3. Environment Variables (Future)

You can extend the system to use environment variables:

```typescript
export const getFeatureFlag = (feature: keyof typeof FEATURE_FLAGS): boolean => {
  // Check environment variable first
  const envFlag = process.env[`FEATURE_${feature}`];
  if (envFlag !== undefined) {
    return envFlag === 'true';
  }
  
  // Fall back to config
  return FEATURE_FLAGS[feature];
};
```

## Feature Implementation Guide

### When Adding New Features

1. **Add Feature Flag**: Add the flag to `FEATURE_FLAGS` in `features.ts`
2. **Add Description**: Add description to `FEATURE_DESCRIPTIONS`
3. **Implement Feature**: Use `getFeatureFlag()` to check if enabled
4. **Add Fallback UI**: Show "coming soon" state when disabled
5. **Test Both States**: Test with feature enabled and disabled

### Example Implementation

```typescript
import { getFeatureFlag } from '@/config/features';

const MyComponent = () => {
  const isFeatureEnabled = getFeatureFlag('MY_NEW_FEATURE');
  
  if (!isFeatureEnabled) {
    return (
      <div className="card-mobile text-center py-8">
        <h3>Feature Coming Soon</h3>
        <p>This feature is currently in development.</p>
      </div>
    );
  }
  
  return (
    <div>
      {/* Feature implementation */}
    </div>
  );
};
```

## Current Disabled Features

### 🔮 Hive Tab (AI Event Discovery)

**Status**: Disabled  
**Location**: `/src/app/hive/page.tsx`  
**Flag**: `AI_EVENT_DISCOVERY`

**What's Disabled**:
- AI-powered event matching
- External API integrations (Eventbrite, Meetup)
- Neural connection suggestions
- Travel-based event recommendations

**To Enable**:
1. Set `AI_EVENT_DISCOVERY: true` in `features.ts`
2. Implement real API integrations
3. Add proper error handling for external APIs

### 🤖 Smart Introductions

**Status**: Disabled  
**Location**: `/src/app/introductions/page.tsx`  
**Flag**: `AI_SMART_INTRODUCTIONS`

**What's Disabled**:
- AI-powered user matching
- Automatic introduction suggestions
- Neural network-based connections

**To Enable**:
1. Set `AI_SMART_INTRODUCTIONS: true` in `features.ts`
2. Implement matching algorithms
3. Add user preference controls

## Feature Status Monitoring

### Dashboard Widget

In demo mode, the dashboard shows a "Disabled Features" widget that lists all currently disabled features. This helps with:

- **Development Visibility**: See what features are disabled
- **Testing**: Quickly identify what to test when enabling features
- **Documentation**: Visual reference for feature status

### Accessing Feature Status

```typescript
import { getFeatureFlag, FEATURE_FLAGS } from '@/config/features';

// Check single feature
const isEnabled = getFeatureFlag('AI_EVENT_DISCOVERY');

// Get all disabled features
const disabledFeatures = Object.keys(FEATURE_FLAGS)
  .filter(feature => !getFeatureFlag(feature as keyof typeof FEATURE_FLAGS));
```

## Best Practices

### 1. Graceful Degradation

Always provide a meaningful fallback when features are disabled:

```typescript
// ✅ Good - Clear messaging
if (!isFeatureEnabled) {
  return <ComingSoonMessage feature="AI Matching" />;
}

// ❌ Bad - Empty or broken state
if (!isFeatureEnabled) {
  return null;
}
```

### 2. Feature Documentation

Document what each feature does and why it might be disabled:

```typescript
export const FEATURE_DESCRIPTIONS = {
  AI_EVENT_DISCOVERY: 'AI-powered event discovery based on user niche and location',
  // Clear, concise descriptions
} as const;
```

### 3. Testing

Test both enabled and disabled states:

```bash
# Test with features disabled (default)
npm run dev

# Test with features enabled (modify DEV_OVERRIDES)
# Edit src/config/features.ts DEV_OVERRIDES section
npm run dev
```

## Future Enhancements

### 1. Admin Panel

Create an admin interface to toggle features without code changes.

### 2. User-Specific Flags

Allow different users to have different feature access levels.

### 3. Gradual Rollouts

Implement percentage-based rollouts (e.g., enable for 10% of users).

### 4. Analytics Integration

Track feature usage and performance metrics.

## Troubleshooting

### Feature Not Working After Enabling

1. **Check Import**: Ensure `getFeatureFlag` is imported correctly
2. **Clear Cache**: Restart development server
3. **Check Logic**: Verify feature flag logic is correct
4. **Test Environment**: Confirm you're testing in the right environment

### Feature Status Not Updating

1. **Restart Server**: Feature flags are loaded at startup
2. **Check Syntax**: Ensure no TypeScript errors in `features.ts`
3. **Verify Flag Name**: Check spelling of feature flag name

---

For questions about feature flags, check the implementation in `src/config/features.ts` or contact the development team.

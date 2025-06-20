# Frontend Updates for Database Schema Fix

After applying the database fixes in `comprehensive_database_fix.sql`, you'll need to update your frontend code to work with the new schema and functions.

## Key Changes to Be Aware Of

1. **Database Schema Changes**:
   - `id` in founders table now matches `auth.users.id` instead of being a separate UUID
   - `user_id` in founders table is always equal to `id` for new records
   - `upsert_founder_onboarding` function now expects a simpler signature

2. **Function Signature Changes**:
   - The primary `upsert_founder_onboarding` function now takes only two parameters:
     - `user_id` (UUID): The user's auth ID
     - `data` (JSONB): The founder data to save

## Required Frontend Updates

### 1. Update FounderService.js

Find the `saveOnboardingData` method in your FounderService.js file and update it:

```javascript
static async saveOnboardingData(userId, userEmail, founderData) {
  try {
    if (!userId) {
      console.error('Cannot save onboarding data - missing userId');
      return {
        success: false,
        error: 'Missing userId'
      };
    }

    console.log('Saving onboarding data:', { userId, userEmail });
    
    // Prepare the data object as expected by the updated function
    const data = {
      full_name: founderData.full_name,
      company_name: founderData.company_name,
      role: founderData.role,
      linkedin_url: founderData.linkedin_url,
      location_city: founderData.location_city,
      industry: founderData.industry,
      bio: founderData.bio,
      tags_or_interests: Array.isArray(founderData.tags_or_interests) 
        ? founderData.tags_or_interests.join(',') 
        : founderData.tags_or_interests,
      profile_visible: founderData.profile_visible,
      // These will be forced to true/100 by the function anyway
      onboarding_completed: true,
      profile_progress: 100
    };
    
    // First try the backward-compatible version that matches your old function signature
    try {
      const { data: result, error } = await supabase.rpc('upsert_founder_onboarding', {
        user_id: userId,
        user_email: userEmail,
        founder_data: founderData
      });

      if (error) throw error;
      
      console.log('Onboarding data saved successfully:', result);
      return {
        success: true,
        data: result,
        message: 'Profile created successfully!'
      };
    } catch (funcError) {
      // If that fails, try the new version
      console.log('Trying new function signature...');
      
      const { data: result, error } = await supabase.rpc('upsert_founder_onboarding', {
        user_id: userId,
        data: data
      });
      
      if (error) throw error;
      
      console.log('Onboarding data saved successfully with new function:', result);
      return {
        success: true,
        data: result,
        message: 'Profile created successfully!'
      };
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return {
      success: false,
      error: error.message || 'An unknown error occurred',
      code: error.code
    };
  }
}
```

### 2. Update AuthContext.js

Make sure your `fetchUserData` and `refreshUserData` methods in AuthContext.js are querying the database correctly:

```javascript
const fetchUserData = async (userId) => {
  try {
    console.log('Fetching user data for userId:', userId);
    
    // Query by user_id which is now equal to auth.users.id
    const { data, error } = await supabase
      .from('founders')
      .select('*')
      .eq('user_id', userId)  // This is correct with our new schema
      .single();

    // Additional code remains the same
    // ...
  } catch (error) {
    // Error handling remains the same
    // ...
  }
};
```

### 3. Fix "href" Related Errors

The error "Cannot read property 'href' of undefined" typically occurs when trying to access a property on an undefined object. Look for code similar to:

```javascript
// Problematic code
router.push(user.profile_url); // Fails if user is undefined
```

Update with proper guards:

```javascript
// Fixed code
if (user?.profile_url) {
  router.push(user.profile_url);
} else {
  // Fallback, e.g., to dashboard or onboarding
  router.push('/dashboard');
}
```

### 4. Ensure User ID is Passed Correctly

Whenever you call functions that require the user ID, ensure you're getting it from the auth context:

```javascript
const { user } = useAuth();

// Then use user.id for any operations that need the auth user ID
const saveProfile = async (formData) => {
  if (!user?.id) {
    console.error('Cannot save profile - user not logged in');
    return;
  }
  
  const result = await FounderService.saveOnboardingData(
    user.id,
    user.email,
    formData
  );
  
  // Handle the result...
};
```

## Testing Your Changes

After making these updates:

1. Clear your browser's local storage to reset any cached authentication
2. Test the full sign-up and onboarding flow
3. Monitor the browser console and network requests for any errors
4. Verify that user data is correctly saved to the database

If you encounter any issues, check the Supabase logs and browser console for specific error messages.

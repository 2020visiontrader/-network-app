# Complete Fix for Network Founder App Issues

This document provides step-by-step instructions to fix all the critical issues in your app.

## 1. Database Schema Fixes

### Step 1: Run the comprehensive database fix

1. Go to the Supabase dashboard
2. Navigate to the SQL Editor
3. Copy the entire content from `comprehensive_database_fix.sql`
4. Run the SQL script
5. This will fix:
   - The `handle_new_user` function
   - The trigger that creates founder records on signup
   - The `upsert_founder_onboarding` function
   - Add the LinkedIn URL validation function
   - Fix any existing records with NULL user_id
   - Add constraints and indexes for better performance

### Step 2: Set up a custom SMTP provider

1. Go to Supabase dashboard
2. Navigate to Authentication → Email Templates
3. Click on "Enable a custom SMTP provider"
4. Enter your SMTP credentials (SendGrid, Mailgun, etc.)
   - SMTP Host: (e.g., smtp.sendgrid.net)
   - SMTP Port: 587 (or as provided by your SMTP service)
   - SMTP Username: (your username or API key)
   - SMTP Password: (your password or API key)
5. Save the settings
6. Test the email delivery

## 2. Code Fixes

### Step 1: Fix undefined href issues

Run the `fix_href_issues.js` script to identify potential issues:

```bash
node fix_href_issues.js
```

Apply the recommended fixes to your React Native code. Here are the key patterns to fix:

1. **Add optional chaining**:
   ```javascript
   // Before
   const url = user.profile_url;
   
   // After
   const url = user?.profile_url;
   ```

2. **Add conditional checks**:
   ```javascript
   // Before
   router.push(user.profile_url);
   
   // After
   if (user?.profile_url) {
     router.push(user.profile_url);
   }
   ```

3. **Add default values**:
   ```javascript
   // Before
   <Link href={profile.url}>Profile</Link>
   
   // After
   <Link href={profile?.url || '#'}>Profile</Link>
   ```

### Step 2: Update the OnboardingForm component

Make sure your onboarding form handles user_id correctly:

1. Open `src/components/OnboardingForm.js`
2. Find the function that submits the form data
3. Ensure it includes the user's ID from auth context:

```javascript
const handleSubmit = async () => {
  // Validate form
  if (!validation.isValid) {
    // Show error
    return;
  }

  setLoading(true);

  try {
    // Get the current user from auth context
    const { user } = useAuth();
    
    if (!user || !user.id) {
      Alert.alert('Error', 'You must be logged in to complete onboarding');
      return;
    }

    // Use the enhanced onboarding service for database operations
    const result = await FounderService.upsertFounderOnboarding(
      user.id,  // Make sure this is passed correctly
      user.email,
      {
        full_name: formData.full_name,
        linkedin_url: formData.linkedin_url,
        // ... other form fields
        onboarding_completed: true,
        profile_progress: 100
      }
    );

    if (!result.success) {
      // Handle error
      return;
    }

    // Success - refresh user data
    await refreshUserData();
    
    // Navigate safely
    if (navigation) {
      navigation.navigate('Dashboard');
    }
  } catch (error) {
    console.error('Onboarding error:', error);
    Alert.alert('Error', 'Failed to complete onboarding');
  } finally {
    setLoading(false);
  }
};
```

## 3. Testing Your Fixes

After applying all fixes:

1. Restart your Expo server:
   ```bash
   npx expo start --clear
   ```

2. Test the signup flow:
   - Create a new account
   - Verify you receive the confirmation email
   - Complete the onboarding form
   - Check that you're redirected to the dashboard

3. Verify database records:
   - Go to Supabase Table Editor
   - Check the founders table
   - Confirm that user_id is properly populated

## 4. Debugging

If you still encounter issues:

1. Check Supabase logs for SQL errors
2. Look for React Native errors in the console
3. Verify that auth triggers are working
4. Check the network requests in your app

## Need More Help?

If you're still having issues after applying these fixes, please provide:

1. The specific error message
2. The component/file where the error occurs
3. Any relevant Supabase logs

This will help diagnose and fix any remaining issues.

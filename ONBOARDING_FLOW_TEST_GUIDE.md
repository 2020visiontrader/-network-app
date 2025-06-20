# Auth → Onboarding → Dashboard Flow Manual Testing Guide

This document provides a step-by-step guide for manually testing the complete authentication and onboarding flow in the Network Founder App.

## Prerequisites

1. Make sure the SQL migration has been applied to your Supabase project
2. Ensure the app is running with the latest code changes
3. Have test credentials ready (use your personal email, not test emails)

## Test Scenario 1: New User Flow

### Steps:

1. **Initial Setup:**
   - Clear app data or uninstall/reinstall the app
   - Launch the app

2. **Sign Up:**
   - Navigate to the Sign Up screen
   - ✅ Verify only the following fields are present:
     - Email
     - Password
     - Confirm Password
   - Create an account with your personal email

3. **Onboarding:**
   - ✅ After sign-up, verify you're automatically directed to the Onboarding screen
   - ✅ Verify all these fields are present:
     - Full Name
     - LinkedIn URL
     - Location (City)
     - Company Name
     - Role
     - Industry
     - Bio
     - Tags/Interests
     - Profile Visibility
   - Fill out all required fields
   - Submit the form

4. **Dashboard:**
   - ✅ Verify you're automatically redirected to the Dashboard after onboarding
   - ✅ Verify your profile information is visible/accessible

5. **Logout and Login Again:**
   - Log out of the app
   - Log back in with the same credentials
   - ✅ Verify you're taken directly to the Dashboard (NOT the onboarding screen)

## Test Scenario 2: Existing User Flow

### Steps:

1. **Initial Setup:**
   - Clear app data or uninstall/reinstall the app
   - Launch the app

2. **Login:**
   - Navigate to the Login screen
   - Log in with an existing account that has already completed onboarding

3. **Dashboard:**
   - ✅ Verify you're taken directly to the Dashboard (NOT the onboarding screen)

## Test Scenario 3: Existing User with Incomplete Onboarding

### Steps:

1. **Database Setup:**
   - Use the Supabase dashboard to manually set `onboarding_completed = false` for a user
   - Or create a new user and don't complete onboarding

2. **Login:**
   - Launch the app
   - Log in with the account that has incomplete onboarding

3. **Onboarding:**
   - ✅ Verify you're directed to the Onboarding screen
   - Complete the onboarding form
   - Submit the form

4. **Dashboard:**
   - ✅ Verify you're automatically redirected to the Dashboard
   - ✅ Verify your profile information is visible/accessible

## Common Issues and Checks

- **Navigation Issues:**
  - Check if there are any navigation loops (repeatedly going back to onboarding)
  - Verify back button behavior is appropriate

- **Data Persistence:**
  - Verify data submitted during onboarding is properly saved to Supabase
  - Check that `onboarding_completed` and `profile_progress` fields are correctly updated

- **Error Handling:**
  - Try submitting the onboarding form with missing required fields
  - Check for appropriate error messages
  - Verify form data is preserved when validation fails

## Automated Test Verification

After manual testing, run the automated test to verify database functionality:

```bash
node test_complete_auth_onboarding_flow.js [your-email] [your-password]
```

This should show successful connection, authentication, and data validation.

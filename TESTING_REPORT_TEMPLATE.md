# Expo Testing Report

## Environment
- Device: [iPhone/Android model]
- Expo Go Version: [version]
- Network: WiFi
- Date: [Current date]

## Auth Flow Testing

### 1. Sign Up
- [ ] Created new account with email: _____________
- [ ] Bypassed email verification (since it's disabled)
- [ ] Redirected to onboarding screen
- [ ] No errors in logs

### 2. Onboarding
- [ ] Completed all required fields
- [ ] LinkedIn URL validation works
- [ ] Profile photo upload works (if implemented)
- [ ] Successfully submitted form
- [ ] Redirected to main app screen
- [ ] No errors in logs

### 3. Profile Access
- [ ] Can view profile information
- [ ] All submitted data appears correctly
- [ ] Can navigate to other app sections
- [ ] No errors in logs

### 4. Sign Out & Sign In
- [ ] Successfully signed out
- [ ] Successfully signed back in
- [ ] Profile data persisted correctly
- [ ] No errors in logs

## Database Verification

After testing, verify in Supabase that:
- [ ] User record exists in auth.users
- [ ] Founder record exists with correct user_id
- [ ] All profile fields are saved correctly
- [ ] onboarding_completed is set to true

## Issues Encountered

| Issue | Screen | Steps to Reproduce | Error Message |
|-------|--------|-------------------|---------------|
|       |        |                   |               |
|       |        |                   |               |

## Additional Notes

[Any other observations or feedback]

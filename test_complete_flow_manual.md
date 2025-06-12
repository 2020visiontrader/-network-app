# 🧪 COMPLETE AUTH + ONBOARDING FLOW TEST

## 📋 MANUAL TESTING CHECKLIST

### ✅ STEP 1: Database Setup
**Execute in Supabase SQL Editor:**
```sql
-- Copy and paste complete_auth_onboarding_setup.sql
-- This creates required columns and RLS policies
```

**Expected Result:**
- ✅ founders table has required columns
- ✅ RLS policies are clean and working
- ✅ No infinite recursion errors

### ✅ STEP 2: Google OAuth Configuration
**In Supabase Dashboard → Authentication → Providers:**

1. **Enable Google Provider**
2. **Add Client ID:** `724521313426-r2scai3u9bscrvbc5cn59dseb2g70u2d.apps.googleusercontent.com`
3. **Add Client Secret:** `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`
4. **Add Redirect URLs:**
   - `http://localhost:3001/auth/callback`
   - `https://appnetwork.netlify.app/auth/callback`

**Expected Result:**
- ✅ Google provider enabled
- ✅ Credentials configured
- ✅ Redirect URLs added

### ✅ STEP 3: Test Home Page
**Visit:** http://localhost:3001

**Expected Behavior:**
- ✅ Page loads without errors
- ✅ Shows professional networking content
- ✅ No demo content visible
- ✅ "Get Started" or "Sign In" buttons present

### ✅ STEP 4: Test Login Page
**Visit:** http://localhost:3001/login

**Expected Behavior:**
- ✅ Login form loads
- ✅ "Continue with Google" button present
- ✅ No "Try Demo" button (removed)
- ✅ Professional design with hive background

### ✅ STEP 5: Test Google OAuth Flow
**Click "Continue with Google" on login page:**

**Expected Flow:**
1. ✅ Redirects to Google consent screen
2. ✅ Shows app permissions request
3. ✅ After consent → redirects to `/auth/callback`
4. ✅ Auth callback processes → redirects to `/onboarding`

**Possible Issues:**
- ❌ If Google OAuth not configured → Error message
- ❌ If redirect URL mismatch → OAuth error
- ❌ If database policies wrong → Database error

### ✅ STEP 6: Test Auth Callback
**After Google OAuth consent:**

**Expected Behavior:**
- ✅ Shows "Finalizing authentication..." loading screen
- ✅ Creates founder record in database
- ✅ Redirects to `/onboarding` for new users
- ✅ Redirects to `/dashboard` for completed users

**Check in Supabase:**
- ✅ New record in `founders` table
- ✅ `onboarding_completed = false`
- ✅ User ID matches auth.uid()

### ✅ STEP 7: Test Onboarding Form
**On onboarding page:**

**Expected Form Fields:**
- ✅ Full Name (pre-filled from Google)
- ✅ LinkedIn Profile URL
- ✅ City
- ✅ Industry/Niche (dropdown)
- ✅ Goals & Vision (textarea)

**Test Form Submission:**
1. ✅ Fill all required fields
2. ✅ Click "Complete Profile & Enter Network"
3. ✅ Shows loading state
4. ✅ Saves to database
5. ✅ Redirects to `/dashboard`

**Check in Supabase:**
- ✅ `founders` table updated with form data
- ✅ `onboarding_completed = true`
- ✅ Optional `founder_applications` record created

### ✅ STEP 8: Test Dashboard Access
**After onboarding completion:**

**Expected Behavior:**
- ✅ Redirects to `/dashboard`
- ✅ Dashboard loads with user data
- ✅ Shows professional networking features
- ✅ No demo content visible

### ✅ STEP 9: Test Auth Guards
**Test different scenarios:**

**Scenario A: Not Authenticated**
- Visit `/dashboard` → Redirects to `/login`
- Visit `/onboarding` → Redirects to `/login`

**Scenario B: Authenticated but Not Onboarded**
- Visit `/dashboard` → Redirects to `/onboarding`
- Visit `/onboarding` → Shows onboarding form

**Scenario C: Authenticated and Onboarded**
- Visit `/dashboard` → Shows dashboard
- Visit `/onboarding` → Redirects to `/dashboard`

### ✅ STEP 10: Test Return User Flow
**Sign out and sign in again:**

**Expected Behavior:**
- ✅ Google OAuth → Auth callback
- ✅ Finds existing founder record
- ✅ Checks `onboarding_completed` status
- ✅ Redirects to `/dashboard` (not onboarding)

## 🚨 TROUBLESHOOTING

### Common Issues:

**1. Google OAuth Errors:**
- Check redirect URLs match exactly
- Verify client ID/secret in Supabase
- Ensure Google Console has correct domains

**2. Database Errors:**
- Execute SQL setup script
- Check RLS policies are correct
- Verify table columns exist

**3. Redirect Loops:**
- Check auth guard logic
- Verify onboarding_completed field
- Clear browser cache/cookies

**4. Component Errors:**
- Check useAuth hook import
- Verify Supabase client configuration
- Check environment variables

## ✅ SUCCESS CRITERIA

**Complete flow working when:**
- ✅ Google OAuth sign-in works
- ✅ New users go through onboarding
- ✅ Returning users go to dashboard
- ✅ Auth guards enforce proper flow
- ✅ No demo content visible
- ✅ Database records created correctly

## 🎯 PRODUCTION DEPLOYMENT

**After successful testing:**
1. Deploy to Netlify with environment variables
2. Test on https://appnetwork.netlify.app
3. Verify Google OAuth works in production
4. Monitor user creation and onboarding completion

**🚀 Ready for professional networking app launch!**

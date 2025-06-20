# Testing with Expo Go

This guide explains how to test your app on a real device using Expo Go after applying the database fixes.

## Prerequisites

- A smartphone with the [Expo Go](https://expo.dev/client) app installed
- Your phone and computer on the same WiFi network
- Node.js installed on your computer

## Step 1: Install Required Dependencies

Make sure you have all the required dependencies for testing:

```bash
# Using npm
npm install qrcode-terminal --save-dev

# Or using yarn
yarn add qrcode-terminal --dev
```

## Step 2: Start Expo with QR Code

Use the provided script to start your Expo app and generate a QR code:

```bash
node start-expo-with-qr.js
```

This will:
1. Start your Expo development server
2. Generate a QR code in the terminal
3. Show logs from the Expo server

## Step 3: Scan the QR Code

1. Open the Expo Go app on your phone
2. Tap "Scan QR Code"
3. Scan the QR code displayed in your terminal
4. The app should load on your device

## Step 4: Capture Logs

In a separate terminal window, run:

```bash
node capture-expo-logs.js
```

This will:
1. Capture all logs from your Expo app
2. Display them with color-coding for errors, warnings, etc.
3. Save them to `expo-debug-logs.txt` for later review

## Step 5: Test the Auth Flow

Now that you have the app running on your device, test the complete auth flow:

1. **Sign Up**
   - Create a new account
   - If email confirmation is disabled, you should proceed directly

2. **Onboarding**
   - Complete the onboarding form
   - All fields should work without errors

3. **Profile Access**
   - Verify you can access your profile
   - Check that your information is saved correctly

4. **Sign Out and Sign Back In**
   - Sign out of your account
   - Sign back in with the same credentials
   - Verify your profile data is still accessible

## Troubleshooting

### QR Code Doesn't Work

If the QR code doesn't work:
- Make sure your phone and computer are on the same WiFi network
- Try manually entering the URL displayed in the terminal
- Check that port 8081 isn't blocked by a firewall

### App Crashes During Testing

If the app crashes:
- Check the logs captured by `capture-expo-logs.js`
- Look for red error messages that indicate the problem
- Common issues after database fixes include:
  - Missing fields in the database
  - Incorrect function parameters
  - RLS policy restrictions

### Database Connection Issues

If you see database errors:
- Verify the Supabase URL and key in your `.env` file
- Check that RLS policies allow the necessary operations
- Ensure the database functions were created correctly

## Advanced: Running on a Specific Device

To test on a specific platform:

```bash
# For iOS
npm run ios

# For Android
npm run android

# For web
npm run web
```

## Next Steps

After successful testing:
1. Verify the database contains the correct records
2. Check the Supabase logs for any errors
3. Consider re-enabling email confirmation for production

Remember to keep the logs for debugging if any issues arise.

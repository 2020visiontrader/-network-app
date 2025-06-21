# Running Your Expo App on Android

## Current Situation

You're currently able to run your app on your physical Android device (SM_S921W) using Expo Go, even though you don't have the Android SDK installed on your computer. You're seeing warnings about the Android SDK path, but these don't prevent your app from running on your device.

## Using the Scripts

### For local network (when your phone is on the same WiFi):

```bash
./expo-qr.sh
```

### For remote access (when your phone is on a different network):

```bash
./expo-tunnel.sh
```

## What These Scripts Do

These scripts run Expo in a mode that generates a QR code that you can scan with the Expo Go app. They avoid using any Android SDK-specific commands, so they should work without installing Android Studio.

## How to Use

1. Run one of the scripts above
2. Wait for the QR code to appear in the terminal
3. Open Expo Go on your Android device
4. Scan the QR code
5. Your app should load on your device

## About the Android SDK Warnings

The warnings you're seeing:
```
Failed to resolve the Android SDK path. Default install location not found: /Users/BrandonChi/Library/Android/sdk.
```

These are normal and expected since you don't have Android Studio and the Android SDK installed. They don't affect your ability to use Expo Go on your physical device.

## Do You Need to Install Android Studio?

**No, not required** if you're only testing with Expo Go on a physical device.

**Yes, recommended** if you want to:
- Use an Android emulator
- Build a standalone APK/AAB
- Use certain native modules that require direct Android SDK access

## Next Steps

If you want to eliminate the warnings or set up a more comprehensive development environment, you can install Android Studio by following the guide in `ANDROID_EMULATOR_SETUP.md`.

Otherwise, you can continue using the scripts provided to run your app with Expo Go.

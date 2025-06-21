# Mobile Testing Guide for NetworkFounderApp

This guide provides comprehensive instructions for testing the NetworkFounderApp on both iOS and Android devices or simulators.

## Table of Contents

1. [Testing with Expo Go](#testing-with-expo-go)
2. [Android Testing Options](#android-testing-options)
3. [iOS Testing Options](#ios-testing-options)
4. [Using the Helper Scripts](#using-the-helper-scripts)
5. [Switching Between SDK Versions](#switching-between-sdk-versions)
6. [Troubleshooting](#troubleshooting)

## Testing with Expo Go

The simplest way to test the app is using the Expo Go app with a QR code:

1. Start the Expo development server:
   ```bash
   npx expo start
   ```

2. Scan the QR code with:
   - **Android**: Use the Expo Go app to scan the QR code
   - **iOS**: Use the Camera app to scan the QR code (will open Expo Go)

You can also use the provided scripts to generate and display QR codes:

```bash
# Generate QR codes for both SDKs (saved to qrcodes/ directory)
./generate-qr-codes.sh

# Display QR code in terminal
./terminal-qr.sh
```

## Android Testing Options

### Option 1: Physical Android Device

1. Follow the instructions in [ANDROID_DEVICE_SETUP.md](./ANDROID_DEVICE_SETUP.md)
2. Connect your device via USB
3. Run:
   ```bash
   npx expo start
   ```
4. Press 'a' to run on the Android device

### Option 2: Android Emulator

1. Follow the instructions in [ANDROID_EMULATOR_SETUP.md](./ANDROID_EMULATOR_SETUP.md)
2. Start an emulator
3. Run:
   ```bash
   npx expo start
   ```
4. Press 'a' to run on the Android emulator

### Option 3: Using the Helper Script

Use the provided script to automatically start an Android emulator and run the app:

```bash
./start-android-emulator.sh
```

## iOS Testing Options

### Option 1: Physical iOS Device

1. Make sure you have the Expo Go app installed from the App Store
2. Run:
   ```bash
   npx expo start
   ```
3. Scan the QR code with the Camera app

### Option 2: iOS Simulator

1. Make sure you have Xcode installed
2. Run:
   ```bash
   npx expo start
   ```
3. Press 'i' to run on the iOS Simulator

## Using the Helper Scripts

### Comprehensive Simulator Script

The `start-simulators.sh` script can start either iOS Simulator, Android emulator, or both:

```bash
# Start iOS Simulator and run the app
./start-simulators.sh ios

# Start Android emulator and run the app
./start-simulators.sh android

# Start both simulators and run the app
./start-simulators.sh both
```

### Android-Specific Script

If you only need Android:

```bash
./start-android-emulator.sh
```

### QR Code Scripts

```bash
# Generate QR codes for SDK 51 and 53
./generate-qr-codes.sh

# Display QR code in terminal for current SDK
./terminal-qr.sh
```

## Switching Between SDK Versions

Use the SDK switching script to change between Expo SDK 51 and 53:

```bash
# Switch to SDK 51
./switch-sdk.sh 51

# Switch to SDK 53
./switch-sdk.sh 53
```

After switching SDKs, you'll need to reinstall dependencies:

```bash
npm install
```

## Troubleshooting

### Common Issues

#### "No Android device found"

This error occurs when no Android device or emulator is detected:
- Make sure your physical device is properly connected (see [ANDROID_DEVICE_SETUP.md](./ANDROID_DEVICE_SETUP.md))
- Start an Android emulator (see [ANDROID_EMULATOR_SETUP.md](./ANDROID_EMULATOR_SETUP.md))
- Use the helper scripts: `./start-android-emulator.sh` or `./start-simulators.sh android`

#### "Cannot run on iOS Simulator"

- Make sure Xcode is installed and up to date
- Try running: `sudo xcode-select -s /Applications/Xcode.app`
- Use the helper script: `./start-simulators.sh ios`

#### Expo Go Compatibility Issues

- Make sure you're using the correct SDK version for your Expo Go app
- Use the SDK switching script to match your Expo Go version: `./switch-sdk.sh [51|53]`

#### QR Code Not Working

- Make sure your device and development machine are on the same WiFi network
- Try using the local tunnel option in Expo CLI by pressing 'd' and selecting "tunnel"

#### Web Version Issues

For web-specific issues, refer to [WEB_VERSION_GUIDE.md](./WEB_VERSION_GUIDE.md)

# NetworkFounderApp SDK 53 Migration Guide

This guide provides step-by-step instructions for migrating the NetworkFounderApp from Expo SDK 51 to SDK 53.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app installed on your mobile device

## Project Structure

- Original project: `/Users/BrandonChi/Desktop/NETWORK APP/NetworkFounderApp` (SDK 51)
- New project: `/Users/BrandonChi/Desktop/NETWORK APP/NetworkFounderApp53` (SDK 53)

## Migration Steps

### 1. Create the SDK 53 Project (Already Completed)

```bash
npx create-expo-app NetworkFounderApp53
cd NetworkFounderApp53
```

### 2. Copy Source Files

Copy these essential files and directories from the original project to the SDK 53 project:

- `App.js` - Main application component
- `src/` directory - All source code, components, screens, and services
- `.env` file (if exists) - Environment variables
- `assets/` directory - Images, fonts, and other static assets

```bash
# Example commands (run from original project directory)
cp App.js ../NetworkFounderApp53/
cp -R src ../NetworkFounderApp53/
cp -R assets ../NetworkFounderApp53/
cp .env ../NetworkFounderApp53/ # if it exists
```

### 3. Install Dependencies

In the SDK 53 project directory:

```bash
cd ../NetworkFounderApp53
npm install --legacy-peer-deps
```

### 4. Generate QR Code and Start the App

Run the helper script to generate a QR code for the SDK 53 app:

```bash
# From the original project directory
node sdk53-generate-qr.js
```

Or start the app directly:

```bash
# From the original project directory
node run-sdk53-app.js
```

Or manually:

```bash
cd ../NetworkFounderApp53
npx expo start
```

### 5. Test on Device

- Scan the QR code with the Expo Go app on your mobile device
- Make sure your device is on the same WiFi network as your computer
- Test all app functionality to ensure everything works correctly

## Troubleshooting

### Port Conflicts

If the default port (8081) is already in use, Expo will prompt you to use a different port. Make sure to update the QR code URL accordingly.

### Dependency Issues

If you encounter dependency issues:

```bash
npx expo-doctor
npx expo install [package-name]@[version]
```

### QR Code Not Working

Ensure your device and computer are on the same network. Try using the URL directly in the Expo Go app.

## Helper Scripts

- `sdk53-generate-qr.js` - Generates a QR code for the SDK 53 app
- `migrate-to-sdk53.js` - Provides migration instructions
- `run-sdk53-app.js` - Starts the SDK 53 app and generates a QR code

## Notes

- The original app.json and package.json have been updated to use SDK 53
- The sdkVersion field has been removed from app.json (per Expo recommendations)
- Deprecated dependencies have been removed or replaced

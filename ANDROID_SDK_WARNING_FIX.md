# Android SDK Warning Fix

## The Issue

If you're seeing warnings like:

```
Failed to resolve the Android SDK path. Default install location not found: /Users/BrandonChi/Library/Android/sdk. Use ANDROID_HOME to set the Android SDK location.
```

This occurs because Expo is looking for the Android SDK, which is typically installed with Android Studio.

## Important Note

**These warnings don't affect your ability to run the app on a physical device using Expo Go.**

Your app will still work fine with Expo Go, even with these warnings. The Android SDK is only needed for:
- Running on an Android emulator
- Building standalone APK/AAB files
- Using certain native modules that require direct Android SDK integration

## Solutions

### Option 1: Ignore the Warnings (Simplest)

If you're only using Expo Go on a physical device, you can safely ignore these warnings.

### Option 2: Use the No-Warnings Script

We've created a script that sets up a temporary Android SDK directory structure to suppress these warnings:

```bash
./run-expo-no-warnings.sh
```

This script:
1. Creates a minimal temporary Android SDK directory structure
2. Sets the ANDROID_HOME environment variable for the current session
3. Starts Expo with the warnings suppressed

### Option 3: Install Android Studio (Complete Solution)

For full Android development capabilities:

1. Download and install Android Studio from [developer.android.com/studio](https://developer.android.com/studio)
2. During installation, make sure to install the Android SDK
3. Run our setup script to set the environment variables:

```bash
./setup-android-env.sh
```

4. Apply the changes:

```bash
source ~/.zshrc  # or ~/.bash_profile depending on your shell
```

5. Restart your terminal and Expo development server

### Option 4: Manually Set ANDROID_HOME

If you've installed Android Studio but still see the warnings:

1. Find your Android SDK location (typically in `~/Library/Android/sdk`)
2. Set the environment variable:

```bash
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

3. Add these lines to your `~/.zshrc` or `~/.bash_profile` file for permanent setup

# Setting Up Android Emulator for Expo Testing

This guide will walk you through setting up an Android emulator for testing your Expo app.

## Prerequisites

1. Install Android Studio from [developer.android.com](https://developer.android.com/studio)

## Set Up Android Studio and AVD (Android Virtual Device)

1. Open Android Studio
2. If this is your first time opening Android Studio, follow the setup wizard
3. Otherwise, go to **Tools → AVD Manager** (or click the AVD Manager icon in the toolbar)

## Create a New Virtual Device

1. Click **Create Virtual Device**
2. Select a phone definition (e.g., Pixel 6)
3. Click **Next**
4. Select a system image:
   - For most compatibility, select a recent Google Play system image (e.g., API 33)
   - If none are installed, click **Download** next to your preferred system image
5. Click **Next**
6. (Optional) Change the AVD name if desired
7. Click **Finish**

## Start the Emulator

### From Android Studio:
1. In the AVD Manager, click the ▶️ (play) button next to your virtual device

### From Terminal:
The emulator is located in your Android SDK folder, typically at:
```
~/Library/Android/sdk/emulator/emulator
```

1. List available AVDs:
```bash
~/Library/Android/sdk/emulator/emulator -list-avds
```

2. Start a specific AVD:
```bash
~/Library/Android/sdk/emulator/emulator -avd [AVD_NAME]
```
Replace [AVD_NAME] with the name of your AVD from step 1.

## Set Up Environment Variables

Add these lines to your `~/.zshrc` or `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then restart your terminal or run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

## Run Your Expo App with the Emulator

Once your emulator is running:

```bash
npx expo start
```

Then press 'a' to run on Android emulator.

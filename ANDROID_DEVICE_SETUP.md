# Setting Up Your Android Device for Testing

## Enable Developer Options

1. Open the **Settings** app on your Android device
2. Scroll down and tap on **About phone** (or **About tablet**)
3. Find the **Build number** entry (may be under "Software information")
4. Tap on **Build number** 7 times until you see a message saying "You are now a developer!"

## Enable USB Debugging

1. Go back to the main **Settings** screen
2. Tap on **System** (or **System & updates**)
3. Tap on **Developer options** (may be under "Advanced")
4. Find and enable **USB debugging**
5. Accept the security prompt

## Connect to Your Mac

1. Connect your Android device to your Mac using a USB cable
2. When prompted on your Android device, tap **Allow** to allow USB debugging
3. If you don't see the prompt, try unplugging and reconnecting the USB cable

## Verify Connection

To verify your device is properly connected:

```bash
npx adb devices
```

Your device should appear in the list. If it doesn't, try:

```bash
npx adb kill-server
npx adb start-server
npx adb devices
```

## Run Your Expo App

Once your device is connected, you can run:

```bash
npx expo start
```

Then press 'a' to run on the Android device.

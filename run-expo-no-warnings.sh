#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Creating temporary Android SDK environment to suppress warnings${NC}"

# Create temporary Android SDK directory structure
TEMP_SDK_DIR="$HOME/Library/Android/sdk"
mkdir -p "$TEMP_SDK_DIR/tools"
mkdir -p "$TEMP_SDK_DIR/platform-tools"
mkdir -p "$TEMP_SDK_DIR/emulator"

# Create a minimal mock adb script
echo '#!/bin/bash
if [[ "$1" == "devices" ]]; then
  echo "List of devices attached"
  echo "emulator-5554 device"
  exit 0
fi

if [[ "$1" == "shell" && "$2" == "getprop" && "$3" == "sys.boot_completed" ]]; then
  echo "1"
  exit 0
fi

echo "Mock ADB - NetworkFounderApp"
' > "$TEMP_SDK_DIR/platform-tools/adb"

# Make the mock adb executable
chmod +x "$TEMP_SDK_DIR/platform-tools/adb"

# Set environment variables for this session
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools"

echo -e "${GREEN}Temporary Android SDK environment created at:${NC}"
echo "$TEMP_SDK_DIR"
echo ""
echo -e "${GREEN}Environment variables set for this session:${NC}"
echo "ANDROID_HOME=$ANDROID_HOME"
echo ""
echo -e "${YELLOW}Now running Expo. The Android SDK warnings should be suppressed.${NC}"
echo ""
echo -e "${RED}IMPORTANT:${NC} When asked to run on Android, press 'a' to attempt to run"
echo "on a connected Android device. If no device is connected, Expo will"
echo "provide a QR code that you can scan with the Expo Go app on your"
echo "Android device to test your app."
echo ""

# Run Expo with tunneling enabled to make it easier to connect from physical devices
npx expo start --tunnel

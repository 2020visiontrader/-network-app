#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo with Mock Android SDK ===${NC}"

# Create temporary Android SDK directory structure
TEMP_SDK_DIR="$HOME/Library/Android/sdk"
mkdir -p "$TEMP_SDK_DIR/platform-tools"
mkdir -p "$TEMP_SDK_DIR/emulator"
mkdir -p "$TEMP_SDK_DIR/tools/bin"

# Create mock adb script
ADB_PATH="$TEMP_SDK_DIR/platform-tools/adb"

echo '#!/bin/bash

# Mock adb script that does nothing but returns success
# This prevents "ENOENT" errors when Expo tries to use adb

case "$1" in
    "devices")
        echo "List of devices attached"
        ;;
    "shell")
        if [[ "$2" == "getprop" && "$3" == "sys.boot_completed" ]]; then
            echo "1"
        fi
        ;;
    *)
        # Do nothing for other commands
        ;;
esac

exit 0' > "$ADB_PATH"

# Make mock adb executable
chmod +x "$ADB_PATH"

# Set environment variables
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/tools/bin"

echo -e "${GREEN}Created mock Android SDK at: $TEMP_SDK_DIR${NC}"
echo -e "${GREEN}Created mock adb at: $ADB_PATH${NC}"
echo -e "${GREEN}Set ANDROID_HOME environment variable${NC}"
echo ""
echo -e "${YELLOW}Starting Expo in QR code mode...${NC}"
echo -e "${YELLOW}Press 'c' to show QR code in terminal${NC}"
echo -e "${YELLOW}Press 'w' to open web version${NC}"
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo ""

# Start Expo with hostType=lan to prioritize QR code
npx expo start --no-dev --minify

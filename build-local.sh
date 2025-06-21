#!/bin/bash
# build-local.sh
# Script to build the NetworkFounderApp locally for development testing

set -e # Exit on error

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SDK_VERSION=${1:-51}
PLATFORM=${2:-all}

echo -e "${BLUE}=== Building NetworkFounderApp Locally (SDK $SDK_VERSION) ===${NC}"

# Ensure SDK is set correctly
if [ -f "./switch-sdk.sh" ]; then
  echo -e "${YELLOW}Switching to SDK $SDK_VERSION...${NC}"
  ./switch-sdk.sh $SDK_VERSION
else
  echo -e "${YELLOW}SDK switching script not found. Using current SDK configuration.${NC}"
fi

# Ensure dependencies are installed
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Generate native code if needed
echo -e "${YELLOW}Generating native code with Expo Prebuild...${NC}"
npx expo prebuild --clean

# Function to build for web locally
build_web() {
  echo -e "${BLUE}Building for Web...${NC}"
  
  # Build the web version
  echo "Building web version for SDK $SDK_VERSION..."
  npx expo export:web
  
  echo -e "${GREEN}Web build complete!${NC}"
  echo -e "To serve the web build, run: ${YELLOW}npx serve web-build${NC}"
}

# Function to build for iOS locally
build_ios_local() {
  echo -e "${BLUE}Building for iOS locally...${NC}"
  
  # Check if we're on macOS
  if [ "$(uname)" != "Darwin" ]; then
    echo -e "${RED}iOS builds can only be created on macOS.${NC}"
    return 1
  fi
  
  # Check if Xcode is installed
  if ! command -v xcodebuild &> /dev/null; then
    echo -e "${RED}Xcode not found. Please install Xcode from the App Store.${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Building iOS app (this may take a while)...${NC}"
  (cd ios && xcodebuild -workspace NetworkFounderApp.xcworkspace -scheme NetworkFounderApp -configuration Debug -destination "platform=iOS Simulator,name=iPhone 14" build)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}iOS build complete!${NC}"
    echo -e "${YELLOW}To run the app in the simulator:${NC}"
    echo -e "1. Open Xcode: ${YELLOW}open ios/NetworkFounderApp.xcworkspace${NC}"
    echo -e "2. Select a simulator and click the Run button"
  else
    echo -e "${RED}iOS build failed. See errors above.${NC}"
  fi
}

# Function to build for Android locally
build_android_local() {
  echo -e "${BLUE}Building for Android locally...${NC}"
  
  # Check if Android SDK is available
  if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo -e "${RED}Android SDK not found. Please install Android Studio and SDK.${NC}"
    echo -e "See ${YELLOW}ANDROID_EMULATOR_SETUP.md${NC} for instructions."
    return 1
  fi
  
  # Set up Android SDK environment variables
  export ANDROID_HOME=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_HOME/platform-tools
  
  echo -e "${YELLOW}Building Android app (this may take a while)...${NC}"
  (cd android && ./gradlew assembleDebug)
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Android build complete!${NC}"
    echo -e "${YELLOW}The APK is located at:${NC} android/app/build/outputs/apk/debug/app-debug.apk"
    echo -e "${YELLOW}To install on a connected device:${NC} adb install android/app/build/outputs/apk/debug/app-debug.apk"
  else
    echo -e "${RED}Android build failed. See errors above.${NC}"
  fi
}

# Build based on platform selection
case "$PLATFORM" in
  web)
    build_web
    ;;
  ios)
    build_ios_local
    ;;
  android)
    build_android_local
    ;;
  all)
    build_web
    echo ""
    build_ios_local
    echo ""
    build_android_local
    ;;
  *)
    echo -e "${RED}Invalid platform: $PLATFORM${NC}"
    echo "Usage: ./build-local.sh [sdk_version] [platform]"
    echo "  sdk_version: 51 or 53 (default: 51)"
    echo "  platform: web, ios, android, or all (default: all)"
    exit 1
    ;;
esac

echo -e "${BLUE}=== Local Build Process Complete ===${NC}"

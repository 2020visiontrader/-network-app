#!/bin/bash
# build-app.sh
# Script to build the NetworkFounderApp for different platforms

set -e # Exit on error

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SDK_VERSION=${1:-51}
PLATFORM=${2:-all}

echo -e "${BLUE}=== Building NetworkFounderApp (SDK $SDK_VERSION) ===${NC}"

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

# Function to build for web
build_web() {
  echo -e "${BLUE}Building for Web...${NC}"
  
  # Make sure we have the necessary web dependencies
  npm install --save react-native-web@~0.19.6 @expo/metro-runtime@~3.2.3 --legacy-peer-deps
  
  # Create build directory if it doesn't exist
  mkdir -p web-build-sdk$SDK_VERSION
  
  # Build the web version
  echo "Building web version for SDK $SDK_VERSION..."
  npx expo export:web
  
  # Move to SDK-specific directory
  if [ -d "web-build" ]; then
    mkdir -p web-build-sdk$SDK_VERSION
    cp -R web-build/* web-build-sdk$SDK_VERSION/
    echo -e "${GREEN}Web build complete!${NC}"
    echo -e "The web build is available in the ${YELLOW}web-build-sdk$SDK_VERSION${NC} directory."
    echo -e "To serve the build, run: ${YELLOW}npx serve web-build-sdk$SDK_VERSION${NC}"
  else
    echo -e "${RED}Web build failed. web-build directory not found.${NC}"
  fi
}

# Function to build for iOS
build_ios() {
  echo -e "${BLUE}Building for iOS...${NC}"
  
  # Check if we have the necessary tools
  if ! command -v xcrun &> /dev/null; then
    echo -e "${RED}Xcode Command Line Tools not found. Please install Xcode.${NC}"
    return 1
  fi
  
  # Create build directory
  mkdir -p ios-build-sdk$SDK_VERSION
  
  # Build the iOS version
  echo "Building iOS version for SDK $SDK_VERSION..."
  npx expo prebuild --platform ios
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}iOS prebuild complete!${NC}"
    echo -e "Now building the iOS app..."
    
    # Build using xcodebuild if available
    if command -v xcodebuild &> /dev/null; then
      (cd ios && xcodebuild -workspace NetworkFounderApp.xcworkspace -scheme NetworkFounderApp -configuration Release -destination "generic/platform=iOS" -archivePath ../ios-build-sdk$SDK_VERSION/NetworkFounderApp.xcarchive archive)
      
      if [ $? -eq 0 ]; then
        echo -e "${GREEN}iOS build complete!${NC}"
        echo -e "The iOS build is available in the ${YELLOW}ios-build-sdk$SDK_VERSION${NC} directory."
      else
        echo -e "${RED}iOS build failed. See errors above.${NC}"
        echo -e "${YELLOW}You may need to open the project in Xcode and build from there.${NC}"
        echo -e "Run: ${YELLOW}open ios/NetworkFounderApp.xcworkspace${NC}"
      fi
    else
      echo -e "${YELLOW}xcodebuild not found. Please open the project in Xcode to build:${NC}"
      echo -e "Run: ${YELLOW}open ios/NetworkFounderApp.xcworkspace${NC}"
    fi
  else
    echo -e "${RED}iOS prebuild failed. See errors above.${NC}"
  fi
}

# Function to build for Android
build_android() {
  echo -e "${BLUE}Building for Android...${NC}"
  
  # Check if we have the necessary tools
  if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo -e "${RED}Android SDK not found. Please install Android Studio and SDK.${NC}"
    echo -e "See ${YELLOW}ANDROID_EMULATOR_SETUP.md${NC} for instructions."
    return 1
  fi
  
  # Create build directory
  mkdir -p android-build-sdk$SDK_VERSION
  
  # Build the Android version
  echo "Building Android version for SDK $SDK_VERSION..."
  npx expo prebuild --platform android
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Android prebuild complete!${NC}"
    echo -e "Now building the Android app..."
    
    # Set up Android SDK environment variables
    export ANDROID_HOME=$HOME/Library/Android/sdk
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    
    # Build using Gradle
    (cd android && ./gradlew assembleRelease)
    
    if [ $? -eq 0 ]; then
      # Copy APK to our build directory
      cp android/app/build/outputs/apk/release/*.apk android-build-sdk$SDK_VERSION/
      
      echo -e "${GREEN}Android build complete!${NC}"
      echo -e "The Android APK is available in the ${YELLOW}android-build-sdk$SDK_VERSION${NC} directory."
    else
      echo -e "${RED}Android build failed. See errors above.${NC}"
    fi
  else
    echo -e "${RED}Android prebuild failed. See errors above.${NC}"
  fi
}

# Build based on platform selection
case "$PLATFORM" in
  web)
    build_web
    ;;
  ios)
    build_ios
    ;;
  android)
    build_android
    ;;
  all)
    build_web
    echo ""
    build_ios
    echo ""
    build_android
    ;;
  *)
    echo -e "${RED}Invalid platform: $PLATFORM${NC}"
    echo "Usage: ./build-app.sh [sdk_version] [platform]"
    echo "  sdk_version: 51 or 53 (default: 51)"
    echo "  platform: web, ios, android, or all (default: all)"
    exit 1
    ;;
esac

echo -e "${BLUE}=== Build Process Complete ===${NC}"

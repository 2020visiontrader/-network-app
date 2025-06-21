#!/bin/bash
# compile-mobile-app.sh
# Script to compile the NetworkFounderApp for mobile platforms using EAS

set -e # Exit on error

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SDK_VERSION=${1:-51}
PLATFORM=${2:-all}

echo -e "${BLUE}=== Compiling NetworkFounderApp (SDK $SDK_VERSION) with EAS Build ===${NC}"

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

# Check if eas-cli is installed
if ! command -v eas &> /dev/null; then
  echo -e "${YELLOW}EAS CLI not found. Installing...${NC}"
  npm install -g eas-cli
fi

# Check if user is logged in to EAS
echo -e "${YELLOW}Checking EAS login status...${NC}"
eas whoami || (echo -e "${YELLOW}Please log in to EAS:${NC}" && eas login)

# Initialize EAS configuration if it doesn't exist
if [ ! -f "eas.json" ]; then
  echo -e "${YELLOW}Initializing EAS configuration...${NC}"
  eas build:configure
fi

# Function to build for iOS
build_ios() {
  echo -e "${BLUE}Building for iOS with EAS...${NC}"
  eas build --platform ios --profile preview
}

# Function to build for Android
build_android() {
  echo -e "${BLUE}Building for Android with EAS...${NC}"
  eas build --platform android --profile preview
}

# Build based on platform selection
case "$PLATFORM" in
  ios)
    build_ios
    ;;
  android)
    build_android
    ;;
  all)
    eas build --platform all --profile preview
    ;;
  *)
    echo -e "${RED}Invalid platform: $PLATFORM${NC}"
    echo "Usage: ./compile-mobile-app.sh [sdk_version] [platform]"
    echo "  sdk_version: 51 or 53 (default: 51)"
    echo "  platform: ios, android, or all (default: all)"
    exit 1
    ;;
esac

echo -e "${BLUE}=== EAS Build Process Initiated ===${NC}"
echo -e "${YELLOW}Your build will be processed in the Expo cloud build service.${NC}"
echo -e "${YELLOW}You'll receive a download link when the build is complete.${NC}"
echo -e "${GREEN}You can check the status of your builds at: https://expo.dev/accounts/[your-username]/projects/network-founder-app/builds${NC}"

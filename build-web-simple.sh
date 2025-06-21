#!/bin/bash
# build-web-simple.sh
# Simple script to build the web version of the app

set -e # Exit on error

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SDK_VERSION=${1:-51}

echo -e "${BLUE}=== Building NetworkFounderApp Web Version (SDK $SDK_VERSION) ===${NC}"

# Ensure SDK is set correctly
if [ -f "./switch-sdk.sh" ]; then
  echo -e "${YELLOW}Switching to SDK $SDK_VERSION...${NC}"
  ./switch-sdk.sh $SDK_VERSION
else
  echo -e "${YELLOW}SDK switching script not found. Using current SDK configuration.${NC}"
fi

# Ensure dependencies are installed
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --legacy-peer-deps

# Make sure we have the necessary web dependencies
echo -e "${YELLOW}Installing web dependencies...${NC}"
npm install --save react-native-web@~0.19.6 @expo/metro-runtime@~3.2.3 --legacy-peer-deps

# Create web build directory
mkdir -p web-build-sdk$SDK_VERSION

# Build using expo export:web
echo -e "${YELLOW}Building web version...${NC}"
npx expo export:web || npx expo-cli build:web

# Check if build succeeded
if [ -d "web-build" ]; then
  # Copy to SDK-specific directory
  cp -R web-build/* web-build-sdk$SDK_VERSION/
  
  echo -e "${GREEN}Web build complete!${NC}"
  echo -e "The web build is available in the ${YELLOW}web-build-sdk$SDK_VERSION${NC} directory."
  
  # Ask if user wants to serve the build
  echo -e "${YELLOW}Do you want to serve the web build now? (y/n)${NC}"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Starting web server...${NC}"
    npx serve web-build-sdk$SDK_VERSION
  else
    echo -e "To serve the build later, run: ${YELLOW}npx serve web-build-sdk$SDK_VERSION${NC}"
  fi
else
  echo -e "${RED}Web build failed. web-build directory not found.${NC}"
fi

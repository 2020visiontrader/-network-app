#!/bin/bash

# Expo SDK 51 LAN Connection QR Code Generator
# This script uses LAN mode which can be faster when it works

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Expo SDK 51 LAN Connection QR Code Generator ===${NC}"

# Clear Metro bundler cache
echo -e "${YELLOW}Clearing Metro bundler cache...${NC}"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-map-*

# Clear watchman cache
if command -v watchman &> /dev/null; then
  echo -e "${YELLOW}Clearing Watchman cache...${NC}"
  watchman watch-del-all
fi

# Use LAN mode for faster connections when on same network
echo -e "${YELLOW}Starting Expo in LAN mode (make sure your device is on the same WiFi)...${NC}"
echo -e "${YELLOW}When the QR code appears, scan it with Expo Go v2.31.2${NC}"
echo -e "${YELLOW}This may take a moment to start...${NC}"
echo ""

# Run Expo in LAN mode (default)
EXPO_NO_DOCTOR=1 npx expo start --no-dev --minify

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

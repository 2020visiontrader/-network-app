#!/bin/bash

# Simple script to run Expo with tunnel connection for remote access
# This avoids any Android SDK dependencies and works across networks

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo with Tunnel Connection ===${NC}"
echo -e "${YELLOW}This will create a tunnel so your app can be accessed from any network${NC}"
echo -e "${YELLOW}Useful when your device is not on the same WiFi as your computer${NC}"
echo ""
echo -e "${YELLOW}Starting Expo with tunnel connection...${NC}"
echo -e "${YELLOW}This may take a bit longer to start${NC}"

npx expo start --tunnel

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo in Tunnel Mode ===${NC}"
echo ""
echo -e "${YELLOW}This script will start Expo with a tunnel connection.${NC}"
echo -e "${YELLOW}This allows your app to work even if your device is not on the same network.${NC}"
echo ""
echo -e "${GREEN}Starting Expo with tunnel...${NC}"
echo ""

# Run Expo with tunnel option
npx expo start --tunnel

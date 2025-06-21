#!/bin/bash

# Simple script to run Expo with QR code for Expo Go
# This avoids any Android SDK dependencies

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo with QR Code for Expo Go ===${NC}"
echo -e "${YELLOW}This will start Expo in a mode that generates a QR code for Expo Go app${NC}"
echo -e "${YELLOW}without trying to directly connect to Android devices${NC}"
echo ""

# Check if a tunnel is requested
if [[ "$1" == "tunnel" ]]; then
  echo -e "${YELLOW}Starting Expo with tunnel connection...${NC}"
  echo -e "${YELLOW}This may take a bit longer to start${NC}"
  npx expo start --tunnel
else
  echo -e "${YELLOW}Starting Expo on your local network...${NC}"
  echo -e "${YELLOW}Make sure your device is on the same WiFi as this computer${NC}"
  npx expo start
fi

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

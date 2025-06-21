#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Expo Go QR Code Generator (Tunnel Mode) ===${NC}"
echo "This script will start Expo in tunnel mode and display a QR code for scanning with the Expo Go app."
echo "Tunnel mode works even if your device is not on the same WiFi network as your computer."
echo ""

# Start Expo in tunnel mode
echo -e "${YELLOW}Starting Expo development server in tunnel mode...${NC}"
echo "Scan the QR code below with the Expo Go app on your device."
echo -e "${YELLOW}This may take a moment to start as the tunnel is being created...${NC}"
echo ""

# Start Expo in tunnel mode
npx expo start --tunnel

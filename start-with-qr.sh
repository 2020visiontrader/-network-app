#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo in QR Code Mode ===${NC}"
echo ""
echo -e "${YELLOW}This script will start Expo in QR code mode only.${NC}"
echo -e "${YELLOW}Use the Expo Go app on your device to scan the QR code.${NC}"
echo ""
echo -e "${GREEN}Starting Expo...${NC}"
echo ""

# Run Expo with the host option to ensure it's accessible on your local network
npx expo start --host

#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== NetworkFounderApp Mobile Testing ====${NC}"
echo ""
echo -e "${YELLOW}Starting Expo development server with tunnel connection${NC}"
echo "This will make it easier to connect from your physical device"
echo "even if your device is not on the same WiFi network"
echo ""
echo -e "${GREEN}Instructions:${NC}"
echo "1. When Expo starts, it will display a QR code"
echo "2. Scan this QR code with:"
echo "   - Android: Open the Expo Go app and use the scanner"
echo "   - iOS: Use the Camera app to scan the code"
echo ""
echo "Your device does not need to be connected via USB - just scan the QR code!"
echo ""
echo -e "${YELLOW}Starting Expo...${NC}"

# Run Expo with tunneling enabled
npx expo start --tunnel

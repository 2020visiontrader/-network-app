#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Expo Go QR Code Generator ===${NC}"
echo "This script will start Expo and display a QR code for scanning with the Expo Go app."
echo ""

# Start Expo in development mode
echo -e "${YELLOW}Starting Expo development server...${NC}"
echo "Scan the QR code below with the Expo Go app on your device."
echo -e "${YELLOW}Make sure your device and computer are on the same WiFi network.${NC}"
echo ""

# Start Expo with minimal options
npx expo start

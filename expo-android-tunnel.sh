#!/bin/bash

# Simple script to generate a tunnel-based QR code for Expo Go on Android
# Tunnel mode works across different networks and is more reliable in some cases

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo with Tunnel for Android (SDK 51) ===${NC}"
echo -e "${YELLOW}This will create a tunnel connection and generate a QR code${NC}"
echo -e "${YELLOW}for Expo Go on Android that works across networks${NC}"
echo ""
echo -e "${YELLOW}Starting Expo tunnel... (this may take a moment)${NC}"

# Start Expo with tunnel mode
npx expo start --tunnel

#!/bin/bash

# sdk51-expo-go-qr.sh
# Direct script to generate a QR code for Expo Go with SDK 51

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== SDK 51 Expo Go QR Code Generator ===${NC}"
echo -e "${YELLOW}This script is specifically optimized for Expo SDK 51 and Expo Go client 2.31.2${NC}"

# Kill existing Expo processes
echo -e "${YELLOW}Terminating any existing Expo processes...${NC}"
pkill -f "expo start" 2>/dev/null || true
pkill -f "expo-cli" 2>/dev/null || true
sleep 2

# Clear caches
echo -e "${YELLOW}Clearing caches...${NC}"
rm -rf node_modules/.cache
rm -rf node_modules/.expo
rm -rf .expo

# Generate random port to avoid conflicts
PORT=$((8000 + RANDOM % 1000))
echo -e "${YELLOW}Using port ${PORT}${NC}"

# Use tunnel mode by default as it's more reliable
echo -e "${GREEN}Starting Expo in tunnel mode (works across networks)...${NC}"
echo -e "${YELLOW}This will take a moment. Please wait for the QR code to appear.${NC}"
echo -e "${YELLOW}Once the QR code appears, scan it with Expo Go on your device.${NC}"
echo ""

# Use more compatible flags for SDK 51
npx expo start --tunnel --port ${PORT} --clear

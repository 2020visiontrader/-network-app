#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Starting Expo Web Version ===${NC}"

# No need for Android SDK for web version
echo -e "${YELLOW}Starting Expo web version...${NC}"
echo -e "${YELLOW}Press Ctrl+C to exit${NC}"
echo ""

# Start Expo web version
npx expo start --web

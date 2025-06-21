#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

clear
echo -e "${BLUE}=== NetworkFounderApp Runner ===${NC}"
echo ""
echo -e "Choose how to run the app:"
echo -e "  ${GREEN}1${NC}) Run with QR code for Expo Go on physical devices"
echo -e "  ${GREEN}2${NC}) Run web version"
echo -e "  ${GREEN}3${NC}) Run with Expo CLI (with warnings)"
echo -e "  ${GREEN}q${NC}) Quit"
echo ""
read -p "Enter your choice [1-3 or q]: " choice

case $choice in
  1)
    echo -e "${YELLOW}Starting app with QR code mode...${NC}"
    ./start-expo-qr.sh
    ;;
  2)
    echo -e "${YELLOW}Starting web version...${NC}"
    ./start-expo-web.sh
    ;;
  3)
    echo -e "${YELLOW}Starting with standard Expo CLI...${NC}"
    echo -e "${YELLOW}Note: You will see Android SDK warnings, but they can be ignored${NC}"
    npx expo start
    ;;
  q|Q)
    echo -e "${BLUE}Exiting...${NC}"
    exit 0
    ;;
  *)
    echo -e "${RED}Invalid selection${NC}"
    echo "Please run the script again and select a valid option"
    exit 1
    ;;
esac

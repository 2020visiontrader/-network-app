#!/bin/bash

# Expo SDK 51 QR Code Generator for Expo Go Client 2.31.2 (Tunnel Mode)
# This script specifically targets Expo Go on Android with SDK 51
# Enhanced with detailed logging

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_FILE="expo-tunnel-logs.txt"

echo -e "${BLUE}=== Expo SDK 51 Tunnel QR Code Generator for Expo Go v2.31.2 (with Logs) ===${NC}"
echo -e "${YELLOW}Logs will be saved to ${LOG_FILE}${NC}"

# Start capturing all output to log file
exec > >(tee -a "$LOG_FILE") 2>&1

echo "===== ENVIRONMENT INFO =====" >> "$LOG_FILE"
echo "Date: $(date)" >> "$LOG_FILE"
echo "Node version: $(node -v)" >> "$LOG_FILE"
echo "NPM version: $(npm -v)" >> "$LOG_FILE"
echo "Expo CLI version: $(npx expo --version)" >> "$LOG_FILE"
echo "Operating system: $(uname -a)" >> "$LOG_FILE"
echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Print package.json content
echo "===== PACKAGE.JSON =====" >> "$LOG_FILE"
cat package.json >> "$LOG_FILE"
echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Print app.json content
echo "===== APP.JSON =====" >> "$LOG_FILE"
cat app.json >> "$LOG_FILE"
echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Clean up and prepare
echo -e "${YELLOW}Deep cleaning project cache...${NC}"
echo "===== CLEANING CACHE =====" >> "$LOG_FILE"

# Clear Metro bundler cache
echo "Clearing Metro bundler cache..." >> "$LOG_FILE"
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-map-* 2>/dev/null || true

# Clear watchman cache
if command -v watchman &> /dev/null; then
  echo "Clearing Watchman cache..." >> "$LOG_FILE"
  watchman watch-del-all >> "$LOG_FILE" 2>&1
fi

# Clear React Native cache
echo "Clearing React Native cache..." >> "$LOG_FILE"
rm -rf $TMPDIR/react-* 2>/dev/null || true

echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Print network info
echo "===== NETWORK INFO =====" >> "$LOG_FILE"
echo "Network interfaces:" >> "$LOG_FILE"
ifconfig | grep "inet " >> "$LOG_FILE"
echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Use tunnel mode for connections across different networks
echo -e "${YELLOW}Starting Expo in TUNNEL mode with detailed logging...${NC}"
echo -e "${YELLOW}When the QR code appears, scan it with Expo Go v2.31.2${NC}"
echo -e "${YELLOW}Tunnel mode takes longer to start but works across different networks${NC}"
echo -e "${GREEN}Detailed logs will be saved to ${LOG_FILE}${NC}"
echo ""

echo "===== STARTING EXPO WITH TUNNEL =====" >> "$LOG_FILE"
# Run Expo with tunnel and detailed logging
EXPO_DEBUG=1 EXPO_NO_DOCTOR=1 npx expo start --tunnel --no-dev

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

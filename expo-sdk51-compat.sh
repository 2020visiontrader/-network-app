#!/bin/bash

# Expo SDK 51 Compatibility Mode QR Generator for Expo Go Client 2.31.2
# This script uses alternative flags that may help with loading issues

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_FILE="expo-compat-logs.txt"

echo -e "${BLUE}=== Expo SDK 51 Compatibility Mode for Expo Go v2.31.2 (with Logs) ===${NC}"
echo -e "${YELLOW}This script uses alternative flags that may help with loading issues${NC}"
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

# Deep cleaning
echo -e "${YELLOW}Performing ultra-deep cache cleaning...${NC}"
echo "===== DEEP CLEANING =====" >> "$LOG_FILE"

# Clear npm cache
echo "Clearing npm cache..." >> "$LOG_FILE"
npm cache clean --force >> "$LOG_FILE" 2>&1

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

# Create a port file to force a specific port (8081 is most compatible)
echo "Setting fixed port 8081..." >> "$LOG_FILE"
echo "8081" > .port

echo "===========================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Starting in raw mode with compatibility flags
echo -e "${YELLOW}Starting Expo in compatibility mode...${NC}"
echo -e "${YELLOW}When the QR code appears, scan it with Expo Go v2.31.2${NC}"
echo -e "${GREEN}Detailed logs will be saved to ${LOG_FILE}${NC}"
echo ""

echo "===== STARTING EXPO IN COMPATIBILITY MODE =====" >> "$LOG_FILE"
# Run with minimal flags and fixed port for maximum compatibility
# Using --dev false for production mode which can be more stable
EXPO_DEBUG=1 EXPO_NO_DOCTOR=1 npx expo start --port 8081 --dev false --https

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

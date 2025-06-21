#!/bin/bash

# Expo SDK 51 Clean Start for Expo Go Client 2.31.2
# This script kills any existing Expo processes and starts a fresh one

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_FILE="expo-fresh-logs.txt"

echo -e "${BLUE}=== Expo SDK 51 Clean Start for Expo Go v2.31.2 ===${NC}"
echo -e "${YELLOW}This script will kill any existing Expo processes and start a fresh one${NC}"
echo -e "${YELLOW}Logs will be saved to ${LOG_FILE}${NC}"

# Kill any existing Expo processes
echo -e "${YELLOW}Killing any existing Expo processes...${NC}"
pkill -f "expo start" || true
pkill -f "expo run:android" || true
pkill -f "expo run:ios" || true
pkill -f "npx expo" || true
pkill -f "node.*[/]metro-bundler" || true
lsof -i:8081 -i:8082 -i:8083 -i:8084 -i:8085 -i:8086 -i:8087 -i:8088 -i:19000 -i:19001 -i:19002 -i:19003 -i:19004 -i:19005 -i:19006 | grep LISTEN | awk '{print $2}' | xargs kill -9 2>/dev/null || true

# Wait for processes to fully terminate
echo -e "${YELLOW}Waiting for processes to terminate...${NC}"
sleep 3

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
echo -e "${YELLOW}Performing complete cache cleaning...${NC}"
echo "===== DEEP CLEANING =====" >> "$LOG_FILE"

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

# Choose connection mode based on argument
MODE=${1:-lan}

if [ "$MODE" = "tunnel" ]; then
  echo -e "${YELLOW}Starting Expo in TUNNEL mode...${NC}"
  echo -e "${YELLOW}When the QR code appears, scan it with Expo Go v2.31.2${NC}"
  echo -e "${YELLOW}Tunnel mode takes longer to start but works across different networks${NC}"
  
  echo "===== STARTING EXPO WITH TUNNEL =====" >> "$LOG_FILE"
  # Run with tunnel mode
  EXPO_DEBUG=1 EXPO_NO_DOCTOR=1 npx expo start --tunnel --no-dev
else
  echo -e "${YELLOW}Starting Expo in LAN mode...${NC}"
  echo -e "${YELLOW}When the QR code appears, scan it with Expo Go v2.31.2${NC}"
  echo -e "${YELLOW}Make sure your device is on the same WiFi as this computer${NC}"
  
  echo "===== STARTING EXPO WITH LAN =====" >> "$LOG_FILE"
  # Run with LAN mode
  EXPO_DEBUG=1 EXPO_NO_DOCTOR=1 npx expo start --lan --no-dev
fi

# Note: The script will hang here while expo is running, which is expected
# Press Ctrl+C to stop the process

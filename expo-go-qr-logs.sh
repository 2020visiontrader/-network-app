#!/bin/bash

# expo-go-qr-logs.sh
# A comprehensive script to run Expo with QR code for Expo Go and save detailed logs

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

LOG_FILE="expo-debug-logs.txt"
TIMESTAMP=$(date "+%Y-%m-%d_%H-%M-%S")
DETAILED_LOG_FILE="expo-logs-${TIMESTAMP}.txt"

echo -e "${BLUE}=== Expo QR Code Generator with Detailed Logging ===${NC}"

# Check for existing Expo processes and ask to terminate them
if pgrep -f "expo start" > /dev/null || pgrep -f "expo-cli" > /dev/null; then
  echo -e "${YELLOW}Existing Expo processes detected. Terminating before starting new session...${NC}"
  pkill -f "expo start" || true
  pkill -f "expo-cli" || true
  sleep 2
fi

# Clear Metro bundler cache
echo -e "${YELLOW}Clearing Metro bundler cache...${NC}"
rm -rf node_modules/.cache
rm -rf node_modules/.expo

# Select connection type
echo -e "${BLUE}Connection type:${NC}"
echo -e "1) LAN (same WiFi network)"
echo -e "2) Tunnel (different networks, more reliable)"
echo -e "3) Local only (for development)"
read -p "Select connection type [1-3] (default: 2): " CONNECTION_CHOICE

case $CONNECTION_CHOICE in
  1)
    CONNECTION_TYPE="lan"
    CONNECTION_ARG="--lan"
    echo -e "${YELLOW}Using LAN connection (same WiFi network)${NC}"
    ;;
  3)
    CONNECTION_TYPE="local"
    CONNECTION_ARG="--localhost"
    echo -e "${YELLOW}Using local connection${NC}"
    ;;
  *)
    CONNECTION_TYPE="tunnel"
    CONNECTION_ARG="--tunnel"
    echo -e "${YELLOW}Using tunnel connection (works across networks)${NC}"
    ;;
esac

# Select a random port to avoid conflicts
PORT=$((8000 + RANDOM % 1000))
echo -e "${YELLOW}Using port ${PORT}${NC}"

# Start logging all output
echo -e "${YELLOW}Logs will be saved to ${DETAILED_LOG_FILE}${NC}"
echo "=== Expo Debug Logs - $(date) ===" > "${DETAILED_LOG_FILE}"
echo "Connection type: ${CONNECTION_TYPE}" >> "${DETAILED_LOG_FILE}"
echo "Port: ${PORT}" >> "${DETAILED_LOG_FILE}"
echo "====================================" >> "${DETAILED_LOG_FILE}"
echo "" >> "${DETAILED_LOG_FILE}"

# Print current SDK version
echo -e "${YELLOW}Detecting SDK version...${NC}"
SDK_VERSION=$(grep -o '"expo": *"[^"]*"' package.json | cut -d'"' -f4)
echo -e "${GREEN}Expo SDK version: ${SDK_VERSION}${NC}"
echo "Expo SDK version: ${SDK_VERSION}" >> "${DETAILED_LOG_FILE}"

# Print environment info
echo -e "${YELLOW}Collecting environment info...${NC}"
npx expo-env-info >> "${DETAILED_LOG_FILE}" 2>&1 || echo "Could not get Expo environment info" >> "${DETAILED_LOG_FILE}"

echo -e "${GREEN}Starting Expo with QR code...${NC}"
echo -e "${YELLOW}This will take a moment. Please wait for the QR code to appear.${NC}"
echo -e "${YELLOW}Once the QR code appears, scan it with Expo Go on your device.${NC}"
echo ""

# Run Expo with the selected connection type and port
echo -e "${BLUE}Running command: npx expo start --port ${PORT} ${CONNECTION_ARG} --clear${NC}"
echo "Running command: npx expo start --port ${PORT} ${CONNECTION_ARG} --clear" >> "${DETAILED_LOG_FILE}"
echo "" >> "${DETAILED_LOG_FILE}"

# Run Expo and capture logs
npx expo start --port ${PORT} ${CONNECTION_ARG} --clear | tee -a "${DETAILED_LOG_FILE}"

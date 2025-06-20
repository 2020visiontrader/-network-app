#!/bin/bash
# restart-expo.sh - Quick script to restart Expo server and logs

# Define terminal colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== RESTARTING EXPO SERVER AND LOGS ===${NC}\n"

# Kill any running Expo processes
echo -e "${YELLOW}Stopping any running Expo processes...${NC}"
pkill -f "expo start" || true
pkill -f "node start-expo-with-qr.js" || true
pkill -f "node capture-expo-logs.js" || true

# Give processes time to shut down
sleep 2

# Clear Metro bundler cache (optional but can help with stubborn issues)
echo -e "${YELLOW}Clearing Metro bundler cache...${NC}"
rm -rf $HOME/.expo/web-build-cache/
rm -rf node_modules/.cache/

# Install dependencies if needed
if [ ! -d "node_modules/qrcode-terminal" ]; then
  echo -e "${YELLOW}Installing qrcode-terminal dependency...${NC}"
  npm install qrcode-terminal --save-dev
fi

# Start the Expo server with QR code
echo -e "${CYAN}Starting Expo server with QR code...${NC}"
node start-expo-with-qr.js &
EXPO_PID=$!

# Wait a bit for Expo to start
sleep 5

# Start the logs capture in a separate process
echo -e "${CYAN}Starting logs capture...${NC}"
node capture-expo-logs.js &
LOGS_PID=$!

echo -e "\n${GREEN}Expo server and logs are now running${NC}"
echo -e "${YELLOW}To stop both processes, press Ctrl+C or run: pkill -f expo${NC}"

# Function to handle exit
function cleanup {
  echo -e "\n${RED}Stopping all processes...${NC}"
  kill $EXPO_PID $LOGS_PID 2>/dev/null || true
  exit 0
}

# Register the cleanup function for exit signals
trap cleanup SIGINT SIGTERM

# Keep the script running
wait

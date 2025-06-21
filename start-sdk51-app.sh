#!/bin/bash
# start-sdk51-app.sh
# Script to start the Expo development server for SDK 51

echo "=== Starting NetworkFounderApp SDK 51 ==="

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "ERROR: package.json not found in current directory"
  echo "Please make sure you're in the NetworkFounderApp directory"
  exit 1
fi

# Check if we're in the SDK 51 project
if ! grep -q "\"expo\": \"~51" package.json; then
  echo "WARNING: This doesn't appear to be an SDK 51 project"
  echo "Continuing anyway, but you may encounter issues"
fi

echo "Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "node_modules directory not found. Installing dependencies..."
  npm install --legacy-peer-deps
else
  echo "node_modules directory found. Skipping installation."
fi

echo "Starting Expo development server for SDK 51..."
echo "Scan the QR code that appears with the Expo Go app on your device."
echo "IMPORTANT: Make sure your device is on the same WiFi network as this computer."

# Start the Expo development server
npx expo start

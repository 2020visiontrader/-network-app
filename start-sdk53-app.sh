#!/bin/bash
# start-sdk53-app.sh
# Script to start the Expo development server in the SDK 53 project

# Define the SDK 53 project directory
SDK53_DIR="../NetworkFounderApp53"

echo "=== Starting NetworkFounderApp SDK 53 ==="

# Check if the SDK 53 directory exists
if [ ! -d "$SDK53_DIR" ]; then
  echo "ERROR: SDK 53 project directory not found: $SDK53_DIR"
  echo "Please make sure you've created the SDK 53 project using:"
  echo "npx create-expo-app NetworkFounderApp53"
  exit 1
fi

echo "Navigating to: $SDK53_DIR"
cd "$SDK53_DIR" || { echo "Failed to navigate to $SDK53_DIR"; exit 1; }

echo "Starting Expo development server..."
echo "Scan the QR code that appears with the Expo Go app on your device."
echo "IMPORTANT: Make sure your device is on the same WiFi network as this computer."

# Start the Expo development server
npx expo start

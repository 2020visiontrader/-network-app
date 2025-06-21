#!/bin/bash

# Tunnel script to start Expo and generate QR code for Expo Go
# Uses tunnel mode for better network compatibility

# Kill any existing Expo processes first
echo "Killing any existing Expo processes..."
pkill -f "expo start" || true
pkill -f "expo-cli" || true
pkill -f "node.*expo" || true
sleep 2

# Clear Metro bundler cache
echo "Clearing Metro cache..."
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Start Expo with tunnel option
echo "Starting Expo with tunnel and QR code..."
echo "This might take a minute to establish the tunnel connection."
echo "Please scan the QR code with Expo Go v2.31.2 on your Android device"

# Run with tunnel option for better connectivity
npx expo start --tunnel --clear

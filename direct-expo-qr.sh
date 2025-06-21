#!/bin/bash

# Direct script to start Expo and generate QR code for Expo Go
# Specifically targeting SDK 51 compatibility

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

# Start Expo with minimal options for maximum compatibility
echo "Starting Expo with QR code (SDK 51 compatible)..."
echo "Please scan the QR code with Expo Go v2.31.2 on your Android device"

# Run with plain options - this is the most direct approach
npx expo start --clear

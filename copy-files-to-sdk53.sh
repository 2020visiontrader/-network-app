#!/bin/bash
# copy-files-to-sdk53.sh
# Script to copy necessary files from the original project to the SDK 53 project

# Define source and destination directories
SOURCE_DIR="$(pwd)"
TARGET_DIR="../NetworkFounderApp53"

echo "=== Copying files to SDK 53 project ==="
echo "Source: $SOURCE_DIR"
echo "Target: $TARGET_DIR"

# Check if target directory exists
if [ ! -d "$TARGET_DIR" ]; then
  echo "ERROR: Target directory does not exist: $TARGET_DIR"
  echo "Please make sure you've created the SDK 53 project using:"
  echo "npx create-expo-app NetworkFounderApp53"
  exit 1
fi

# Copy App.js
echo "Copying App.js..."
cp "$SOURCE_DIR/App.js" "$TARGET_DIR/"

# Copy src directory
echo "Copying src directory..."
if [ -d "$SOURCE_DIR/src" ]; then
  mkdir -p "$TARGET_DIR/src"
  cp -R "$SOURCE_DIR/src/"* "$TARGET_DIR/src/"
else
  echo "WARNING: src directory not found in source project"
fi

# Copy assets directory
echo "Copying assets directory..."
if [ -d "$SOURCE_DIR/assets" ]; then
  mkdir -p "$TARGET_DIR/assets"
  cp -R "$SOURCE_DIR/assets/"* "$TARGET_DIR/assets/"
else
  echo "WARNING: assets directory not found in source project"
fi

# Copy .env file if it exists
if [ -f "$SOURCE_DIR/.env" ]; then
  echo "Copying .env file..."
  cp "$SOURCE_DIR/.env" "$TARGET_DIR/"
else
  echo "NOTE: No .env file found in source project"
fi

echo "=== File copy complete ==="
echo "Next steps:"
echo "1. Navigate to the SDK 53 project directory:"
echo "   cd \"$TARGET_DIR\""
echo "2. Install dependencies:"
echo "   npm install --legacy-peer-deps"
echo "3. Start the Expo development server:"
echo "   npx expo start"
echo "4. Scan the QR code with the Expo Go app on your device"

#!/bin/bash
# switch-sdk.sh
# Script to switch between Expo SDK 51 and SDK 53

set -e # Exit on error

function switch_to_sdk51() {
  echo "Switching to Expo SDK 51..."
  
  # Check if backup files exist
  if [ ! -f "package.json.sdk51" ]; then
    echo "Error: package.json.sdk51 not found. Cannot switch to SDK 51."
    exit 1
  fi
  
  if [ ! -f "app.json.sdk51" ]; then
    echo "Error: app.json.sdk51 not found. Cannot switch to SDK 51."
    exit 1
  fi
  
  # Backup current SDK 53 files if not already backed up
  if [ ! -f "package.json.sdk53-backup" ]; then
    cp package.json package.json.sdk53-backup
  fi
  
  if [ ! -f "app.json.sdk53-backup" ]; then
    cp app.json app.json.sdk53-backup
  fi
  
  # Replace with SDK 51 files
  cp package.json.sdk51 package.json
  cp app.json.sdk51 app.json
  
  echo "Switched to SDK 51 configuration."
  echo "You may need to run 'npm install --legacy-peer-deps' to update dependencies."
}

function switch_to_sdk53() {
  echo "Switching to Expo SDK 53..."
  
  # Check if backup files exist
  if [ ! -f "package.json.sdk53-backup" ]; then
    echo "Error: package.json.sdk53-backup not found. Cannot switch to SDK 53."
    exit 1
  fi
  
  if [ ! -f "app.json.sdk53-backup" ]; then
    echo "Error: app.json.sdk53-backup not found. Cannot switch to SDK 53."
    exit 1
  fi
  
  # Backup current SDK 51 files if not already backed up
  if [ ! -f "package.json.sdk51" ]; then
    cp package.json package.json.sdk51
  fi
  
  if [ ! -f "app.json.sdk51" ]; then
    cp app.json app.json.sdk51
  fi
  
  # Replace with SDK 53 files
  cp package.json.sdk53-backup package.json
  cp app.json.sdk53-backup app.json
  
  echo "Switched to SDK 53 configuration."
  echo "You may need to run 'npm install --legacy-peer-deps' to update dependencies."
}

# Main script
if [ "$1" == "51" ]; then
  switch_to_sdk51
elif [ "$1" == "53" ]; then
  switch_to_sdk53
else
  echo "Usage: $0 [51|53]"
  echo "  51: Switch to Expo SDK 51"
  echo "  53: Switch to Expo SDK 53"
  exit 1
fi

# Final instructions
echo ""
echo "To generate a QR code for the current SDK:"
echo "node generate-current-qr.js"
echo ""
echo "To start the Expo development server:"
echo "npx expo start"

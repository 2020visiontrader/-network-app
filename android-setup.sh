#!/bin/bash

# Colors for better visibility
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Android Environment Setup Helper ===${NC}"
echo "This script will help you set up your Android development environment."
echo ""

# Check if Android Studio is installed
if [ -d "/Applications/Android Studio.app" ]; then
  echo -e "${GREEN}✓ Android Studio is installed${NC}"
else
  echo -e "${RED}✗ Android Studio is not installed${NC}"
  echo -e "${YELLOW}Please download and install Android Studio from:${NC}"
  echo "https://developer.android.com/studio"
  echo ""
  echo "Would you like to open the download page? (y/n)"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    open "https://developer.android.com/studio"
  fi
  echo ""
  echo -e "${YELLOW}After installing Android Studio, run through the setup wizard and install:${NC}"
  echo "1. Android SDK"
  echo "2. Android SDK Platform"
  echo "3. Android Virtual Device"
  echo ""
  echo "Run this script again after installation."
  exit 1
fi

# Check if Android SDK is installed
SDK_LOCATIONS=(
  "$HOME/Library/Android/sdk"
  "$HOME/Android/sdk"
  "$HOME/AndroidSDK"
)

SDK_FOUND=false
for location in "${SDK_LOCATIONS[@]}"; do
  if [ -d "$location" ]; then
    SDK_PATH="$location"
    SDK_FOUND=true
    break
  fi
done

if [ "$SDK_FOUND" = true ]; then
  echo -e "${GREEN}✓ Android SDK found at: $SDK_PATH${NC}"
else
  echo -e "${RED}✗ Android SDK not found in common locations${NC}"
  echo -e "${YELLOW}To install the Android SDK:${NC}"
  echo "1. Open Android Studio"
  echo "2. Go to Preferences > Appearance & Behavior > System Settings > Android SDK"
  echo "3. Install the SDK"
  echo ""
  echo "Would you like to open Android Studio now? (y/n)"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    open -a "Android Studio"
  fi
  echo ""
  echo "Run this script again after installation."
  exit 1
fi

# Check for platform-tools (adb)
if [ -f "$SDK_PATH/platform-tools/adb" ]; then
  echo -e "${GREEN}✓ Android platform-tools (adb) found${NC}"
  export PATH="$PATH:$SDK_PATH/platform-tools"
else
  echo -e "${RED}✗ Android platform-tools not found${NC}"
  echo -e "${YELLOW}To install platform-tools:${NC}"
  echo "1. Open Android Studio"
  echo "2. Go to Preferences > Appearance & Behavior > System Settings > Android SDK"
  echo "3. Select the SDK Tools tab"
  echo "4. Check 'Android SDK Platform-Tools' and click Apply"
  echo ""
  echo "Would you like to open Android Studio now? (y/n)"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    open -a "Android Studio"
  fi
  echo ""
  echo "Run this script again after installation."
  exit 1
fi

# Check for emulator
if [ -f "$SDK_PATH/emulator/emulator" ]; then
  echo -e "${GREEN}✓ Android emulator found${NC}"
  export PATH="$PATH:$SDK_PATH/emulator"
else
  echo -e "${RED}✗ Android emulator not found${NC}"
  echo -e "${YELLOW}To install the emulator:${NC}"
  echo "1. Open Android Studio"
  echo "2. Go to Preferences > Appearance & Behavior > System Settings > Android SDK"
  echo "3. Select the SDK Tools tab"
  echo "4. Check 'Android Emulator' and click Apply"
  echo ""
  echo "Would you like to open Android Studio now? (y/n)"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    open -a "Android Studio"
  fi
  echo ""
  echo "Run this script again after installation."
  exit 1
fi

# Check for AVDs (Android Virtual Devices)
avds=$("$SDK_PATH/emulator/emulator" -list-avds 2>/dev/null)
if [ -n "$avds" ]; then
  echo -e "${GREEN}✓ Android Virtual Devices found:${NC}"
  echo "$avds"
else
  echo -e "${RED}✗ No Android Virtual Devices found${NC}"
  echo -e "${YELLOW}To create an AVD:${NC}"
  echo "1. Open Android Studio"
  echo "2. Go to Tools > AVD Manager"
  echo "3. Click 'Create Virtual Device'"
  echo "4. Select a phone definition (e.g., Pixel 6)"
  echo "5. Select a system image (e.g., API 33)"
  echo "6. Finish the wizard"
  echo ""
  echo "Would you like to open Android Studio now? (y/n)"
  read -r answer
  if [[ "$answer" =~ ^[Yy]$ ]]; then
    open -a "Android Studio"
  fi
  echo ""
  echo "Run this script again after creating an AVD."
  exit 1
fi

# All checks passed, set up environment variables
echo -e "${GREEN}All required Android components are installed!${NC}"
echo ""
echo -e "${BLUE}Setting up environment variables...${NC}"

# Add environment variables to shell profile
SHELL_PROFILE=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_PROFILE="$HOME/.zshrc"
elif [ -f "$HOME/.bash_profile" ]; then
  SHELL_PROFILE="$HOME/.bash_profile"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_PROFILE="$HOME/.bashrc"
fi

if [ -n "$SHELL_PROFILE" ]; then
  if ! grep -q "ANDROID_HOME" "$SHELL_PROFILE"; then
    echo "" >> "$SHELL_PROFILE"
    echo "# Android SDK" >> "$SHELL_PROFILE"
    echo "export ANDROID_HOME=$SDK_PATH" >> "$SHELL_PROFILE"
    echo "export PATH=\$PATH:\$ANDROID_HOME/emulator" >> "$SHELL_PROFILE"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools" >> "$SHELL_PROFILE"
    echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin" >> "$SHELL_PROFILE"
    echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools" >> "$SHELL_PROFILE"
    echo -e "${GREEN}✓ Environment variables added to $SHELL_PROFILE${NC}"
    echo -e "${YELLOW}Please run 'source $SHELL_PROFILE' or restart your terminal to apply changes${NC}"
  else
    echo -e "${GREEN}✓ Environment variables already set in $SHELL_PROFILE${NC}"
  fi
else
  echo -e "${RED}✗ Could not find shell profile file (.zshrc, .bash_profile, or .bashrc)${NC}"
  echo -e "${YELLOW}Please add these lines to your shell profile manually:${NC}"
  echo "export ANDROID_HOME=$SDK_PATH"
  echo "export PATH=\$PATH:\$ANDROID_HOME/emulator"
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools"
  echo "export PATH=\$PATH:\$ANDROID_HOME/tools/bin"
  echo "export PATH=\$PATH:\$ANDROID_HOME/platform-tools"
fi

echo ""
echo -e "${BLUE}=== Starting an Android Emulator ===${NC}"
echo "Choose an AVD to start:"
echo "$avds" | nl -w2 -s') '

read -r choice
selected_avd=$(echo "$avds" | sed -n "${choice}p")

if [ -z "$selected_avd" ]; then
  echo -e "${RED}Invalid selection. Please run the script again.${NC}"
  exit 1
fi

echo -e "${GREEN}Starting emulator with AVD: $selected_avd${NC}"
"$SDK_PATH/emulator/emulator" -avd "$selected_avd" &

echo ""
echo -e "${YELLOW}Waiting for emulator to boot (this may take a minute)...${NC}"
export PATH="$PATH:$SDK_PATH/platform-tools"
for i in {1..30}; do
  if "$SDK_PATH/platform-tools/adb" shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
    echo -e "${GREEN}✓ Emulator is ready!${NC}"
    
    echo ""
    echo -e "${BLUE}=== Starting Expo App ===${NC}"
    echo "Do you want to start the Expo app now? (y/n)"
    read -r start_expo
    if [[ "$start_expo" =~ ^[Yy]$ ]]; then
      npx expo start
    else
      echo -e "${YELLOW}You can start your Expo app manually with 'npx expo start'${NC}"
    fi
    
    exit 0
  fi
  sleep 2
  echo -n "."
done

echo -e "${RED}Timed out waiting for emulator to boot.${NC}"
echo -e "${YELLOW}The emulator might still be starting up. Check its status before proceeding.${NC}"
echo "You can start your Expo app manually with 'npx expo start' once the emulator is ready."

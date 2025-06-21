#!/bin/bash

# Script to start iOS Simulator, Android emulator, or both for Expo development
# Usage: ./start-simulators.sh [ios|android|both]

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if any Android emulator is running
check_android_emulator_running() {
  adb devices 2>/dev/null | grep -q "emulator-"
  return $?
}

# Function to check if any iOS Simulator is running
check_ios_simulator_running() {
  xcrun simctl list devices | grep -q "(Booted)"
  return $?
}

# Function to list available Android AVDs
list_android_avds() {
  echo -e "${YELLOW}Available Android Virtual Devices:${NC}"
  avds=$(~/Library/Android/sdk/emulator/emulator -list-avds 2>/dev/null)
  
  if [ -z "$avds" ]; then
    echo -e "${RED}No Android AVDs found. Please create one using Android Studio.${NC}"
    echo "See ANDROID_EMULATOR_SETUP.md for instructions."
    return 1
  fi
  
  echo "$avds"
  return 0
}

# Function to list available iOS Simulators
list_ios_simulators() {
  echo -e "${YELLOW}Available iOS Simulators:${NC}"
  xcrun simctl list devices | grep -v "unavailable" | grep "iPhone\|iPad"
  return 0
}

# Function to start Android emulator
start_android_emulator() {
  # Check if Android SDK is properly set up
  if [ ! -d "$HOME/Library/Android/sdk" ]; then
    echo -e "${RED}Android SDK not found at ~/Library/Android/sdk${NC}"
    echo "Please install Android Studio and SDK first."
    echo "See ANDROID_EMULATOR_SETUP.md for instructions."
    return 1
  fi

  # Check if adb is available
  if ! command -v adb &> /dev/null; then
    export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools
    
    if ! command -v adb &> /dev/null; then
      echo -e "${RED}adb command not found. Make sure Android SDK platform-tools are installed.${NC}"
      echo "See ANDROID_EMULATOR_SETUP.md for instructions."
      return 1
    fi
  fi

  # Check if emulator is available
  if ! command -v ~/Library/Android/sdk/emulator/emulator &> /dev/null; then
    echo -e "${RED}Android emulator not found. Make sure it's installed with Android Studio.${NC}"
    echo "See ANDROID_EMULATOR_SETUP.md for instructions."
    return 1
  fi

  # Check if an emulator is already running
  if check_android_emulator_running; then
    echo -e "${GREEN}✅ Android emulator is already running${NC}"
    return 0
  else
    echo "No Android emulator running. Starting one..."
    
    # List AVDs and ask user to select one
    if ! list_android_avds; then
      return 1
    fi
    
    echo ""
    echo "Enter the name of the Android AVD to start (or press Enter to use the first one):"
    read -r avd_name
    
    # If user didn't specify, use the first available AVD
    if [ -z "$avd_name" ]; then
      avd_name=$(~/Library/Android/sdk/emulator/emulator -list-avds 2>/dev/null | head -n 1)
      if [ -z "$avd_name" ]; then
        echo -e "${RED}No AVDs available. Please create one using Android Studio.${NC}"
        return 1
      fi
    fi
    
    # Start the emulator in the background
    echo "Starting Android emulator with AVD: $avd_name"
    ~/Library/Android/sdk/emulator/emulator -avd "$avd_name" &
    
    # Wait for emulator to boot
    echo "Waiting for Android emulator to boot (this may take a minute)..."
    for i in {1..30}; do
      if adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; then
        echo -e "${GREEN}✅ Android emulator started successfully${NC}"
        return 0
      fi
      sleep 2
    done
    
    echo -e "${RED}Timed out waiting for Android emulator to boot.${NC}"
    echo "The emulator might still be starting up. Check its status before proceeding."
    return 1
  fi
}

# Function to start iOS Simulator
start_ios_simulator() {
  # Check if xcrun is available
  if ! command -v xcrun &> /dev/null; then
    echo -e "${RED}xcrun command not found. Make sure Xcode is installed.${NC}"
    return 1
  fi

  # Check if a simulator is already running
  if check_ios_simulator_running; then
    echo -e "${GREEN}✅ iOS Simulator is already running${NC}"
    return 0
  else
    echo "No iOS Simulator running. Starting one..."
    
    # List simulators
    list_ios_simulators
    
    echo ""
    echo "Enter the UDID of the iOS Simulator to start (or press Enter for a default iPhone):"
    read -r simulator_udid
    
    # If user didn't specify, use a default iPhone
    if [ -z "$simulator_udid" ]; then
      # Try to find an iPhone 14 or similar
      simulator_udid=$(xcrun simctl list devices | grep "iPhone 1[1-9]" | grep -v "unavailable" | head -n 1 | sed -E 's/.*\(([A-Za-z0-9-]+)\).*/\1/')
      
      # If no iPhone 11+ found, try any iPhone
      if [ -z "$simulator_udid" ]; then
        simulator_udid=$(xcrun simctl list devices | grep "iPhone" | grep -v "unavailable" | head -n 1 | sed -E 's/.*\(([A-Za-z0-9-]+)\).*/\1/')
      fi
      
      if [ -z "$simulator_udid" ]; then
        echo -e "${RED}No suitable iOS Simulator found. Please install one using Xcode.${NC}"
        return 1
      fi
    fi
    
    # Start the simulator
    echo "Starting iOS Simulator with UDID: $simulator_udid"
    xcrun simctl boot "$simulator_udid"
    
    # Open the Simulator app
    open -a Simulator
    
    echo "Waiting for iOS Simulator to boot..."
    sleep 5
    
    if check_ios_simulator_running; then
      echo -e "${GREEN}✅ iOS Simulator started successfully${NC}"
      return 0
    else
      echo -e "${RED}Failed to start iOS Simulator.${NC}"
      return 1
    fi
  fi
}

# Main script

cd "$(dirname "$0")" # Ensure we're in the project directory

platform=${1:-both}
platform=$(echo "$platform" | tr '[:upper:]' '[:lower:]')

case "$platform" in
  ios)
    start_ios_simulator
    ios_result=$?
    
    if [ $ios_result -eq 0 ]; then
      echo -e "\n${GREEN}Starting Expo app for iOS...${NC}"
      npx expo start --ios
    else
      echo -e "\n${RED}Failed to start iOS Simulator. Fix the issues above and try again.${NC}"
      exit 1
    fi
    ;;
    
  android)
    start_android_emulator
    android_result=$?
    
    if [ $android_result -eq 0 ]; then
      echo -e "\n${GREEN}Starting Expo app for Android...${NC}"
      npx expo start --android
    else
      echo -e "\n${RED}Failed to start Android emulator. Fix the issues above and try again.${NC}"
      exit 1
    fi
    ;;
    
  both)
    echo -e "${YELLOW}Starting both iOS and Android simulators...${NC}\n"
    
    start_ios_simulator
    ios_result=$?
    
    echo ""
    
    start_android_emulator
    android_result=$?
    
    if [ $ios_result -eq 0 ] || [ $android_result -eq 0 ]; then
      echo -e "\n${GREEN}Starting Expo app...${NC}"
      npx expo start
    else
      echo -e "\n${RED}Failed to start both simulators. Fix the issues above and try again.${NC}"
      exit 1
    fi
    ;;
    
  *)
    echo -e "${RED}Invalid platform: $platform${NC}"
    echo "Usage: ./start-simulators.sh [ios|android|both]"
    exit 1
    ;;
esac

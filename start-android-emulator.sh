#!/bin/bash

# Script to start Android emulator and run Expo app
# Usage: ./start-android-emulator.sh [avd_name]

# Function to check if any emulator is running
check_emulator_running() {
  adb devices | grep -q "emulator-"
  return $?
}

# Function to list available AVDs
list_avds() {
  echo "Available Android Virtual Devices:"
  avds=$(~/Library/Android/sdk/emulator/emulator -list-avds)
  
  if [ -z "$avds" ]; then
    echo "No AVDs found. Please create one using Android Studio."
    exit 1
  fi
  
  echo "$avds"
}

# Check if Android SDK is properly set up
if [ ! -d "$HOME/Library/Android/sdk" ]; then
  echo "Android SDK not found at ~/Library/Android/sdk"
  echo "Please install Android Studio and SDK first."
  echo "See ANDROID_EMULATOR_SETUP.md for instructions."
  exit 1
fi

# Check if adb is available
if ! command -v adb &> /dev/null; then
  export PATH=$PATH:$HOME/Library/Android/sdk/platform-tools
  
  if ! command -v adb &> /dev/null; then
    echo "adb command not found. Make sure Android SDK platform-tools are installed."
    echo "See ANDROID_EMULATOR_SETUP.md for instructions."
    exit 1
  fi
fi

# Check if emulator is available
if ! command -v ~/Library/Android/sdk/emulator/emulator &> /dev/null; then
  echo "Android emulator not found. Make sure it's installed with Android Studio."
  echo "See ANDROID_EMULATOR_SETUP.md for instructions."
  exit 1
fi

# Check if an emulator is already running
if check_emulator_running; then
  echo "✅ Android emulator is already running"
else
  echo "No Android emulator running. Starting one..."
  
  # Use provided AVD name or ask user to select one
  avd_name=$1
  
  if [ -z "$avd_name" ]; then
    list_avds
    echo ""
    echo "Enter the name of the AVD to start (or press Enter to use the first one):"
    read -r avd_name
    
    # If user didn't specify, use the first available AVD
    if [ -z "$avd_name" ]; then
      avd_name=$(~/Library/Android/sdk/emulator/emulator -list-avds | head -n 1)
      if [ -z "$avd_name" ]; then
        echo "No AVDs available. Please create one using Android Studio."
        exit 1
      fi
    fi
  fi
  
  # Start the emulator in the background
  echo "Starting emulator with AVD: $avd_name"
  ~/Library/Android/sdk/emulator/emulator -avd "$avd_name" &
  
  # Wait for emulator to boot
  echo "Waiting for emulator to boot (this may take a minute)..."
  while ! adb shell getprop sys.boot_completed 2>/dev/null | grep -q "1"; do
    sleep 2
  done
  echo "✅ Emulator started successfully"
fi

# Start Expo app
echo "Starting Expo app..."
cd "$(dirname "$0")" # Ensure we're in the project directory
npx expo start

#!/bin/bash
# web-setup.sh
# Script to set up and manage web configurations for both SDK 51 and SDK 53

function setup_web_sdk51() {
  echo "Setting up web environment for SDK 51..."
  
  # Make sure we're using SDK 51 configuration
  ./switch-sdk.sh 51
  
  # Update web dependencies if needed
  npm install --save react-native-web@~0.19.6 react-dom@18.2.0 @expo/webpack-config@^19.0.0 --legacy-peer-deps
  
  echo "Starting web server for SDK 51..."
  npm run web
}

function setup_web_sdk53() {
  echo "Setting up web environment for SDK 53..."
  
  # Make sure we're using SDK 53 configuration
  ./switch-sdk.sh 53
  
  # Update web dependencies if needed
  npm install --save react-native-web@~0.19.10 react-dom@18.2.0 @expo/webpack-config@^19.0.0 --legacy-peer-deps
  
  echo "Starting web server for SDK 53..."
  npm run web
}

function build_web_sdk51() {
  echo "Building web version for SDK 51..."
  
  # Make sure we're using SDK 51 configuration
  ./switch-sdk.sh 51
  
  # Build the web version
  npx expo export:web
  
  echo "Web build completed for SDK 51. Files are in the web-build directory."
  echo "To serve the build, run: npx serve web-build"
}

function build_web_sdk53() {
  echo "Building web version for SDK 53..."
  
  # Make sure we're using SDK 53 configuration
  ./switch-sdk.sh 53
  
  # Build the web version
  npx expo export:web
  
  echo "Web build completed for SDK 53. Files are in the web-build directory."
  echo "To serve the build, run: npx serve web-build"
}

# Main script
if [ "$1" == "51" ]; then
  if [ "$2" == "build" ]; then
    build_web_sdk51
  else
    setup_web_sdk51
  fi
elif [ "$1" == "53" ]; then
  if [ "$2" == "build" ]; then
    build_web_sdk53
  else
    setup_web_sdk53
  fi
else
  echo "Usage: $0 [51|53] [build]"
  echo "  51: Work with SDK 51 web version"
  echo "  53: Work with SDK 53 web version"
  echo "  build: (Optional) Build the web version instead of starting the dev server"
  echo ""
  echo "Examples:"
  echo "  $0 51      # Start web development server with SDK 51"
  echo "  $0 53      # Start web development server with SDK 53"
  echo "  $0 51 build # Build web version with SDK 51"
  echo "  $0 53 build # Build web version with SDK 53"
  exit 1
fi
